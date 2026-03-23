import express, { Response } from "express";
import {
  login,
  logout,
  signup,
  googleCallback,
} from "@/src/controllers/auth/authControllers";
import { AuthRequest, protectRoute } from "@/src/middleware/protectRoute";
import passport from "@/src/lib/passport";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}?error=google_auth_failed`,
  }),
  googleCallback,
);

router.get("/check", protectRoute, (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
});

export default router;
