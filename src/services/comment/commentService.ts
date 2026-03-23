import Comment from "@/src/models/Comment";
import Post from "@/src/models/Post";
import { AppError } from "@/src/lib/AppError";

export const addComment = async (
  postId: string,
  userId: string,
  comment: string,
) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");

  const newComment = new Comment({ text: comment, author: userId });
  await newComment.save();

  post.comments.push(newComment._id);
  await post.save();
};

export const removeComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  if (comment.author.toString() !== userId) {
    throw new AppError(403, "Comment does not belong to the user");
  }

  await comment.deleteOne();
};

export const addReply = async (
  commentId: string,
  userId: string,
  reply: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  comment.replies.push({ text: reply, author: userId });
  await comment.save();
};

export const removeReply = async (
  commentId: string,
  replyId: string,
  userId: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError(404, "Comment not found");

  const reply = comment.replies.id(replyId);
  if (!reply) throw new AppError(404, "Reply not found");

  if (reply.author.toString() !== userId) {
    throw new AppError(403, "Unauthorized");
  }

  reply.deleteOne();
  await comment.save();
};
