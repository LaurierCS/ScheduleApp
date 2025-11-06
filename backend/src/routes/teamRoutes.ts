// routes/team.routes.ts
import express, { Router, Request, Response, NextFunction } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { z } from "zod";
import { Team, GroupDefinitionSchema } from "../models/Team"; // adjust path if needed

const router = Router();

/* ----------------------------- Helpers ----------------------------------- */

const toObjectId = (s: string): mongoose.Types.ObjectId =>
  new mongoose.Types.ObjectId(String(s));

const objectIdSchema = z
  .string()
  .trim()
  .refine((v: string) => isValidObjectId(v), { message: "Invalid ObjectId" })
  .transform((s: string) => toObjectId(s));

// IMPORTANT: split into plain vs defaulted variants
const objectIdArrayPlain = z.array(objectIdSchema); // ← use for .min()
const objectIdArrayDefault = z.array(objectIdSchema).default([]); // ← use for defaults

const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown> | unknown
  ) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const requireAuth = (_req: Request, _res: Response, next: NextFunction) =>
  next();
const requireAdmin = (_req: Request, _res: Response, next: NextFunction) =>
  next();

/* --------------------------- Validation ---------------------------------- */

const createTeamSchema = z.object({
  name: z.string().min(1, "name is required"),
  admin: objectIdSchema,
  description: z.string().optional(),
  // optional with default []
  members: objectIdArrayDefault.optional(),
  candidates: objectIdArrayDefault.optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  admin: objectIdSchema.optional(),
  description: z.string().optional(),
  // optional with default []
  members: objectIdArrayDefault.optional(),
  candidates: objectIdArrayDefault.optional(),
});

// add endpoints: REQUIRE at least one id
const addMembersSchema = z.object({
  members: objectIdArrayPlain.min(1, "members must include at least one id"),
});

const addCandidatesSchema = z.object({
  candidates: objectIdArrayPlain.min(
    1,
    "candidates must include at least one id"
  ),
});

/* ------------------------------ Routes ----------------------------------- */

// POST /api/teams
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createTeamSchema.parse(req.body);
    const team = await Team.create({
      name: data.name,
      admin: data.admin,
      description: data.description,
      members: data.members ?? [],
      candidates: data.candidates ?? [],
    });
    res.status(201).json(team);
  })
);

// GET /api/teams (admin)
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "20"), 10))
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Team.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Team.countDocuments(),
    ]);

    res.json({ items, page, limit, total });
  })
);

// GET /api/teams/:id
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const populate = String(req.query.populate ?? "0") === "1";

    const q = Team.findById(id);
    if (populate) {
      q.populate("admin", "_id name email")
        .populate("members", "_id name email")
        .populate("candidates", "_id name email status");
    }
    const team = await q;
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// PUT /api/teams/:id
router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const data = updateTeamSchema.parse(req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// DELETE /api/teams/:id
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Team not found" });
    res.status(204).send();
  })
);

// POST /api/teams/:id/members
router.post(
  "/:id/members",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const { members } = addMembersSchema.parse(req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $addToSet: { members: { $each: members } } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// POST /api/teams/:id/candidates
router.post(
  "/:id/candidates",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const { candidates } = addCandidatesSchema.parse(req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $addToSet: { candidates: { $each: candidates } } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

router.post(
  "/:id/groups",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);

    // Validate request body manually or just trust mongoose to cast:
    const def = req.body;

    const team = await Team.findByIdAndUpdate(
      id,
      { $push: { groups: { def } } },
      { new: true, runValidators: true } // ensures GroupDefinitionSchema validation runs
    );

    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);
const removeGroupsSchema = z.object({
  names: z.array(z.string().min(1)).min(1, "names must include at least one"),
});

router.delete(
  "/:id/groups",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const { names } = removeGroupsSchema.parse(req.body);

    // $pull with condition on embedded field
    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { groups: { "def.name": { $in: names } } } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);
// --- DELETE (bulk) /api/teams/:id/members
const removeMembersSchema = z.object({
  members: objectIdArrayPlain.min(1, "members must include at least one id"),
});

router.delete(
  "/:id/members",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const { members } = removeMembersSchema.parse(req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { members: { $in: members } } }, // remove any matching ids
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// --- DELETE (single) /api/teams/:id/members/:userId
router.delete(
  "/:id/members/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const userId = objectIdSchema.parse(req.params.userId);

    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// --- DELETE (bulk) /api/teams/:id/candidates
const removeCandidatesSchema = z.object({
  candidates: objectIdArrayPlain.min(
    1,
    "candidates must include at least one id"
  ),
});

router.delete(
  "/:id/candidates",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const { candidates } = removeCandidatesSchema.parse(req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { candidates: { $in: candidates } } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

// --- DELETE (single) /api/teams/:id/candidates/:candidateId
router.delete(
  "/:id/candidates/:candidateId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const candidateId = objectIdSchema.parse(req.params.candidateId);

    const team = await Team.findByIdAndUpdate(
      id,
      { $pull: { candidates: candidateId } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  })
);

/* ---------------------------- Error handler ------------------------------ */

router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.name === "ZodError") {
    return res
      .status(400)
      .json({ error: "ValidationError", issues: err.issues });
  }
  if (err?.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: "ValidationError", details: err.errors });
  }
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

export default router;
