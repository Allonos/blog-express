import express, { Response } from "express";
import { login, logout, signup } from "@/src/controllers/auth/authControllers";
import { AuthRequest, protectRoute } from "@/src/middleware/protectRoute";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", protectRoute, (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
});

export default router;
