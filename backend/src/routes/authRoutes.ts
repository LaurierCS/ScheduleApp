import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    return res.status(200).json({ message: "Made it to auth endpoint" });
});

router.get("/login", (req, res) => { 
    return res.status(200).json({ message: "Made it to login endpoint" });
});

router.get("/register", (req, res) => {
    return res.status(200).json({ message: "Made it to register endpoint" });
});

export default router;
