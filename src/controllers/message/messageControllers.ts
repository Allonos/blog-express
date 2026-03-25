import cloudinary from "@/src/lib/cloudinary";
import { AuthRequest } from "@/src/middleware/protectRoute";
import Message from "@/src/models/Message";
import User from "@/src/models/User";
import { Response } from "express";

export const getMessagesByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
      ],
    }).populate("recieverId", "username profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessagesByUserId", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    if (senderId.equals(recieverId)) {
      return res
        .status(400)
        .json({ message: "Cannot send message to yourself" });
    }

    const recieverExists = await User.exists({ _id: recieverId });
    if (!recieverExists) {
      return res.status(404).json({ message: "Reciever not found" });
    }

    let imageUrl;
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
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
