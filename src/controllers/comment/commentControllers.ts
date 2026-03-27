import { AuthRequest } from "@/middleware/protectRoute";
import { Response } from "express";
import {
  addComment,
  removeComment,
  addReply,
  removeReply,
} from "@/services/comment/commentService";
import { AppError } from "@/lib/AppError";

export const commentOnPost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const { comment } = req.body;
  const userId = req.user._id.toString();

  if (!comment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    await addComment(postId, userId, comment);
    return res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in commentOnPost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.user._id.toString();

  try {
    await removeComment(commentId, userId);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in deleteComment", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const replyToComment = async (req: AuthRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const { reply } = req.body;
  const userId = req.user._id.toString();

  if (!reply) {
    return res.status(400).json({ message: "Reply cannot be empty" });
  }

  try {
    await addReply(commentId, userId, reply);
    return res.status(200).json({ message: "Reply added successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in replyToComment", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteReply = async (req: AuthRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const replyId = req.params.replyId as string;
  const userId = req.user._id.toString();

  try {
    await removeReply(commentId, replyId, userId);
    return res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in deleteReply", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
