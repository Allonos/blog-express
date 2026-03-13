import express from "express";
import { signup } from "@/src/controllers/auth/Signup";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", (req, res) => {
  res.send("Login route");
});

router.post("/logout", (req, res) => {
  res.send("Logout route");
});

router.get("/check", (req, res) => {
  res.send("Check auth route");
});

export default router;
