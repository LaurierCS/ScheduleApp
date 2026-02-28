import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware"; // adjust path/name if yours differs
import {me,updateProfile,getPreferences, updatePreferences} from "../controllers/auth/profile";

const router = Router();

// All routes here require auth
router.use(authenticate);

// GET /api/users/profile
router.get("/profile", me);

// PUT /api/users/profile
router.put("/profile", updateProfile);

// GET /api/users/preferences
router.get("/preferences", getPreferences);

// PUT /api/users/preferences
router.put("/preferences", updatePreferences);

// POST /api/users/profile/image (optional - not implemented now)
// router.post("/profile/image", uploadProfileImage);

export default router;
