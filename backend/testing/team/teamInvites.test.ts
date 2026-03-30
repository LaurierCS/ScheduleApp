import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import app from "../../src/app";
import User, { UserRole } from "../../src/models/user";
import Team from "../../src/models/team";
import Invite from "../../src/models/invite";
import JWTUtils from "../../src/utils/jwt";

describe("team invite flows", () => {
    let mongo: MongoMemoryServer;

    beforeAll(async () => {
        process.env.NODE_ENV = "test";
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongo) {
            await mongo.stop();
        }
    });

    beforeEach(async () => {
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }
    });

    const createAdminTeam = async () => {
        const admin = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "Password1!",
            role: UserRole.ADMIN,
            isActive: true,
            isEmailVerified: true,
        });

        const team = await Team.create({
            name: "Invite Team",
            description: "Testing invites",
            adminId: admin._id,
            isActive: true,
        });

        const teamId = String(team._id);
        await User.findByIdAndUpdate(admin._id, { teamId: team._id });

        const token = JWTUtils.generateAccessToken({
            userId: String(admin._id),
            email: admin.email,
            role: admin.role,
        });

        return { admin, team, teamId, token };
    };

    it("adds existing user as interviewer and returns invite counts", async () => {
        const { team, teamId, token } = await createAdminTeam();

        const existing = await User.create({
            name: "Existing User",
            email: "existing@example.com",
            password: "Password1!",
            role: UserRole.CANDIDATE,
            isActive: true,
            isEmailVerified: true,
        });

        const response = await request(app)
            .post(`/api/teams/${team._id}/members/batch`)
            .set("Authorization", `Bearer ${token}`)
            .send({ emails: [existing.email, "new@example.com"], role: UserRole.INTERVIEWER });

        expect(response.status).toBe(200);
        expect(response.body?.data?.addedUsers).toBe(1);
        expect(response.body?.data?.invitationsSent).toBe(1);

        const updatedExisting = await User.findById(existing._id);
        expect(updatedExisting?.teamId?.toString()).toBe(teamId);
        expect(updatedExisting?.role).toBe(UserRole.INTERVIEWER);

        const newUser = await User.findOne({ email: "new@example.com" });
        expect(newUser).toBeNull();

        const invite = await Invite.findOne({ email: "new@example.com" });
        expect(invite?.role).toBe(UserRole.INTERVIEWER);
        expect(invite?.code).toHaveLength(6);
    });

    it("adds existing user as candidate when invited in batch", async () => {
        const { team, teamId, token } = await createAdminTeam();

        const existing = await User.create({
            name: "Existing Interviewer",
            email: "candidate@example.com",
            password: "Password1!",
            role: UserRole.INTERVIEWER,
            isActive: true,
            isEmailVerified: true,
        });

        const response = await request(app)
            .post(`/api/teams/${team._id}/candidates/batch`)
            .set("Authorization", `Bearer ${token}`)
            .send({ emails: [existing.email, "newcandidate@example.com"] });

        expect(response.status).toBe(200);
        expect(response.body?.data?.addedCandidates).toBe(1);
        expect(response.body?.data?.invitationsSent).toBe(1);

        const updatedExisting = await User.findById(existing._id);
        expect(updatedExisting?.teamId?.toString()).toBe(teamId);
        expect(updatedExisting?.role).toBe(UserRole.CANDIDATE);

        const invite = await Invite.findOne({ email: "newcandidate@example.com" });
        expect(invite?.role).toBe(UserRole.CANDIDATE);
        expect(invite?.code).toHaveLength(6);
    });
});
