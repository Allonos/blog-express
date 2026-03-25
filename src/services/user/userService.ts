import User from "@/src/models/User";
import cloudinary from "@/src/lib/cloudinary";
import { AppError } from "@/src/lib/AppError";
import Message from "@/src/models/Message";

export const updateUserProfile = async (
  userId: string,
  data: { username?: string; bio?: string; profilePic?: string },
) => {
  const updates: { username?: string; bio?: string; profilePic?: string } = {};

  if (data.username) updates.username = data.username;
  if (data.bio) updates.bio = data.bio;
  if (data.profilePic) {
    const uploadResponse = await cloudinary.uploader.upload(data.profilePic);
    updates.profilePic = uploadResponse.secure_url;
  }

  const user = await User.findOneAndUpdate({ _id: userId }, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const searchUsersByUsername = async (username: string) => {
  const users = await User.find({
    username: { $regex: username, $options: "i" },
  });

  if (!users.length) throw new AppError(404, "User not found");
  return users;
};

export const getAllUsers = async (userId: string) => {
  return User.find({ _id: { $ne: userId } }).select("-password");
};

export const getTextedUsers = async (userId: string) => {
  const sentTo = await Message.distinct("recieverId", { senderId: userId });
  const receivedFrom = await Message.distinct("senderId", { recieverId: userId });

  const userIds = [...new Set([...sentTo, ...receivedFrom].map((id) => id.toString()))];

  return User.find({ _id: { $in: userIds, $ne: userId } }).select("-password");
};
