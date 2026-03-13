import "dotenv/config";
import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (userId: string, res: Response) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("blogToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};
