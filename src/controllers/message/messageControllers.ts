import { AppError } from "@/lib/AppError";
import { AuthRequest } from "@/middleware/protectRoute";
import {
  getMessagesByUserId as getMessages,
  sendMessage as send,
} from "@/services/message/messageService";
import { io } from "@/lib/socket";
import { Response } from "express";
import { parsePagination } from "@/lib/pagination";

export const getMessagesByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const { limit, skip } = parsePagination(req.query);
    const { messages, totalItems } = await getMessages({
      myId: req.user._id.toString(),
      userToChatId: req.params.id as string,
      limit,
      skip,
    });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    res.status(200).json({
      messages,
      page,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    });
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
