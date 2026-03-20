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
