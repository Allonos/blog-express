import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { AppError } from "@/lib/AppError";
import Message from "@/models/Message";

interface GetAllUsersParams {
  userId: string;
  limit: number;
  skip: number;
}

interface SearchUsersParams {
  username: string;
  limit: number;
  skip: number;
}

export const updateUserProfile = async (
  userId: string,
  data: { username?: string; bio?: string; profilePicBuffer?: Buffer },
) => {
  const updates: { username?: string; bio?: string; profilePic?: string } = {};

  if (data.username) updates.username = data.username;
  if (data.bio) updates.bio = data.bio;
  if (data.profilePicBuffer) {
    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result);
          },
        );
        stream.end(data.profilePicBuffer);
      },
    );
    updates.profilePic = uploadResult.secure_url;
  }

  const user = await User.findOneAndUpdate({ _id: userId }, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const searchUsersByUsername = async ({
  username,
  limit,
  skip,
}: SearchUsersParams) => {
  const [users, totalItems] = await Promise.all([
    User.find({
      username: { $regex: username, $options: "i" },
    })
      .skip(skip)
      .limit(limit),
    User.countDocuments({
      username: { $regex: username, $options: "i" },
    }),
  ]);

  return { users, totalItems };
};

export const getAllUsers = async ({
  userId,
  limit,
  skip,
}: GetAllUsersParams) => {
  const [users, totalItems] = await Promise.all([
    User.find({ _id: { $ne: userId } })
      .skip(skip)
      .limit(limit)
      .select("-password"),
    User.countDocuments({ _id: { $ne: userId } }),
  ]);

  return { users, totalItems };
};

export const getTextedUsers = async ({
  userId,
  limit,
  skip,
}: GetAllUsersParams) => {
  const sentTo = await Message.distinct("recieverId", { senderId: userId });
  const receivedFrom = await Message.distinct("senderId", {
    recieverId: userId,
  });

  const userIds = [
    ...new Set([...sentTo, ...receivedFrom].map((id) => id.toString())),
  ];

  const filter = { _id: { $in: userIds, $ne: userId } };

  const [users, totalItems] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).select("-password"),
    User.countDocuments(filter),
  ]);

  return { users, totalItems };
};
