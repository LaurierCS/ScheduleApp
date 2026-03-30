import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../app';
import User, { UserRole } from '../models/user';
import Team from '../models/team';
import Invite from '../models/invite';
import JWTUtils from '../utils/jwt';

describe('auth team onboarding', () => {
    let mongo: MongoMemoryServer;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
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

    it('registers with invite code and attaches inviter team', async () => {
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Password1!',
            role: UserRole.ADMIN,
            isActive: true,
            isEmailVerified: true,
        });

        const team = await Team.create({
            name: 'Alpha Team',
            description: 'Test team',
            adminId: admin._id,
            isActive: true,
        });

        const teamId = team._id as mongoose.Types.ObjectId;

        await User.findByIdAndUpdate(admin._id, { teamId });

        const inviteCode = '123456';
        await Invite.create({
            code: inviteCode,
            role: UserRole.CANDIDATE,
            createdBy: admin._id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isActive: true,
        });

        const response = await request(app).post('/api/auth/register').send({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'Password1!',
            inviteCode,
        });

        expect(response.status).toBe(201);

        const createdUser = await User.findOne({ email: 'newuser@example.com' });
        expect(createdUser?.teamId?.toString()).toBe(teamId.toString());
        expect(createdUser?.role).toBe(UserRole.CANDIDATE);

        const updatedInvite = await Invite.findOne({ code: inviteCode });
        expect(updatedInvite?.isActive).toBe(false);
    });

    it('creates a team and promotes creator to admin', async () => {
        const user = await User.create({
            name: 'Team Creator',
            email: 'creator@example.com',
            password: 'Password1!',
            role: UserRole.CANDIDATE,
            isActive: true,
            isEmailVerified: true,
        });

        const token = JWTUtils.generateAccessToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });

        const response = await request(app)
            .post('/api/teams')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Beta Team', description: 'Hiring team' });

        expect(response.status).toBe(201);

        const updatedUser = await User.findById(user._id);
        expect(updatedUser?.role).toBe(UserRole.ADMIN);
        expect(updatedUser?.teamId).toBeDefined();

        const team = await Team.findById(updatedUser?.teamId);
        expect(team?.adminId.toString()).toBe(user._id.toString());
    });
});
