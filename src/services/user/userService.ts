import User from "@/src/models/User";
import cloudinary from "@/src/lib/cloudinary";
import { AppError } from "@/src/lib/AppError";

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
