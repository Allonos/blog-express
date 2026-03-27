import cloudinary from "@/lib/cloudinary";
import { AppError } from "@/lib/AppError";
import Message from "@/models/Message";
import User from "@/models/User";
import { Types } from "mongoose";

interface GetMessagesByUserIdParams {
  limit: number;
  skip: number;
  myId: string;
  userToChatId: string;
}

export const getMessagesByUserId = async ({
  myId,
  userToChatId,
  limit,
  skip,
}: GetMessagesByUserIdParams) => {
  const [messages, totalItems] = await Promise.all([
    Message.find({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recieverId", "username profilePic"),
    Message.countDocuments({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
      ],
    }),
  ]);

  return { messages: messages.reverse(), totalItems };
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
