import User from "@/src/models/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "@/src/lib/utils";

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
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id.toString(), res);

      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      });
    }
  } catch (error) {
    console.error("Error in SignUp", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
