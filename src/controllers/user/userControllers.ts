import User from "@/src/models/User";
import { Request, Response } from "express";
import cloudinary from "@/src/lib/cloudinary";

export const updateProfile = async (req: Request, res: Response) => {
  const { username, bio, profilePic } = req.body;
  const { id: userId } = req.params;

  if (!username && !bio && !profilePic) {
    return res.status(400).json({
      message: "Provide a username, bio, or profile picture to update",
    });
  }

  try {
    const updates: { username?: string; bio?: string; profilePic?: string } =
      {};
    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResponse.secure_url;
    }

    const user = await User.findOneAndUpdate({ _id: userId }, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateProfile", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const { username } = req.query;

  console.log(username);

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserByUsername", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
