import "dotenv/config";
import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.blogToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(`Error in protectRoute: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
