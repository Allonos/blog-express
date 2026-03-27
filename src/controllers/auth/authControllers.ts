import { Request, Response } from "express";
import { generateToken } from "@/lib/utils";
import { signupUser, loginUser } from "@/services/auth/authService";
import { AppError } from "@/lib/AppError";
import "dotenv/config";

type GoogleUser = {
  _id: { toString(): string };
};

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as GoogleUser;
  generateToken(user._id.toString(), res);
  res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await signupUser(username, email, password);
    generateToken(user._id.toString(), res);
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error in SignUp", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await loginUser(email, password);
    generateToken(user._id.toString(), res);
    return res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error in login", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("blogToken", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
