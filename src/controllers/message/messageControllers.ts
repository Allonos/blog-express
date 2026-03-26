import { AppError } from "@/src/lib/AppError";
import { AuthRequest } from "@/src/middleware/protectRoute";
import {
  getMessagesByUserId as getMessages,
  sendMessage as send,
} from "@/src/services/message/messageService";
import { io } from "@/src/lib/socket";
import { Response } from "express";

export const getMessagesByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await getMessages(req.user._id, req.params.id as string);
    res.status(200).json(messages);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error in getMessagesByUserId", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text, image } = req.body;
    const newMessage = await send(
      req.user._id,
      req.params.id as string,
      text,
      image,
    );

    io.to(req.params.id).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error in sendMessage", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
