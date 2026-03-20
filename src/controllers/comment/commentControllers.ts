import { AuthRequest } from "@/src/middleware/protectRoute";
import Comment from "@/src/models/Comment";
import Post from "@/src/models/Post";
import { Response } from "express";

export const commentOnPost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id.toString();

  if (!comment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({ text: comment, author: userId });
    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    return res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("error in commentOnPost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user._id.toString();

  try {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Comment does not belong to the user" });
    }

    await comment.deleteOne();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {}
};

export const replyToComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const { reply } = req.body;
  const userId = req.user._id.toString();

  if (!reply) {
    return res.status(400).json({ message: "Reply cannot be empty" });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({ text: reply, author: userId });
    await comment.save();

    return res.status(200).json({ message: "Reply added successfully" });
  } catch (error) {
    console.error("error in replyToComment", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteReply = async (req: AuthRequest, res: Response) => {
  const { commentId, replyId } = req.params;
  const userId = req.user._id.toString();

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId as string);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    reply.deleteOne();
    await comment.save();

    return res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("error in deleteReply", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
