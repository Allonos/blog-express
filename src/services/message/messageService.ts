import cloudinary from "@/src/lib/cloudinary";
import { AppError } from "@/src/lib/AppError";
import Message from "@/src/models/Message";
import User from "@/src/models/User";
import { Types } from "mongoose";

export const getMessagesByUserId = async (
  myId: string,
  userToChatId: string,
) => {
  return Message.find({
    $or: [
      { senderId: myId, recieverId: userToChatId },
      { senderId: userToChatId, recieverId: myId },
    ],
  }).populate("recieverId", "username profilePic");
};

export const sendMessage = async (
  senderId: Types.ObjectId,
  recieverId: string,
  text: string,
  image?: string,
) => {
  if (senderId.equals(recieverId)) {
    throw new AppError(400, "Cannot send message to yourself");
  }

  const recieverExists = await User.exists({ _id: recieverId });
  if (!recieverExists) {
    throw new AppError(404, "Reciever not found");
  }

  let imageUrl: string | undefined;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = new Message({
    senderId,
    recieverId,
    text,
    image: imageUrl,
  });
  await newMessage.save();
  return newMessage;
};
