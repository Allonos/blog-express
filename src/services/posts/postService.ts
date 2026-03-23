import cloudinary from "@/src/lib/cloudinary";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import { AppError } from "@/src/lib/AppError";
import mongoose, { Types } from "mongoose";

interface GetAllPostsParams {
  limit: number;
  cursor?: string;
}

const commentPopulate = {
  path: "comments",
  populate: [
    { path: "author", select: "username profilePic" },
    { path: "replies.author", select: "username profilePic" },
  ],
  options: { sort: { createdAt: -1 } },
};

export const createPost = async (
  userId: string,
  description: string,
  image?: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  let imageUrl: string | undefined;
  if (image) {
    const uploaded = await cloudinary.uploader.upload(image);
    imageUrl = uploaded.secure_url;
  }

  const newPost = await Post.create({
    author: userId,
    description,
    ...(imageUrl && { image: imageUrl }),
  });

  await newPost.populate("author", "username profilePic");
  return newPost;
};

export const getAllPosts = async ({ limit, cursor }: GetAllPostsParams) => {
  const query = cursor
    ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
    : {};

  const posts = await Post.find(query)
    .populate("author", "username profilePic")
    .populate(commentPopulate)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNextPage = posts.length > limit;
  const data = hasNextPage ? posts.slice(0, limit) : posts;
  const nextCursor = hasNextPage ? data[data.length - 1]._id.toString() : null;

  if (!posts.length) throw new AppError(404, "No posts found");
  return {
    posts: data,
    nextCursor,
    hasNextPage,
  };
};

export const getPostById = async (postId: string) => {
  const post = await Post.findById(postId)
    .populate("author", "username profilePic")
    .populate(commentPopulate);

  if (!post) throw new AppError(404, "Post not found");
  return post;
};

export const getPostsByUserId = async ({
  userId,
  limit,
  cursor,
}: {
  userId: string;
  limit: number;
  cursor?: string;
}) => {
  const query = cursor
    ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
    : {};
  const user = await User.findById(userId).select(
    "username email profilePic bio",
  );
  if (!user) throw new AppError(404, "User not found");

  const posts = await Post.find({ author: user._id, ...query })
    .populate("author", "username profilePic")
    .populate(commentPopulate)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasNextPage = posts.length > limit;
  const data = hasNextPage ? posts.slice(0, limit) : posts;
  const nextCursor = hasNextPage ? data[data.length - 1]._id.toString() : null;

  if (!posts.length) throw new AppError(404, "No posts found for this user");

  return {
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    bio: user.bio,
    posts: data,
    nextCursor,
    hasNextPage,
  };
};

export const toggleLikePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");

  if (!post.likes) post.likes = [];
  const alreadyLiked = post.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(new Types.ObjectId(userId));
  }

  await post.save();
  return { likes: post.likes };
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");

  if (post.author.toString() !== userId) {
    throw new AppError(403, "Post does not belong to the user");
  }

  await post.deleteOne();
};
