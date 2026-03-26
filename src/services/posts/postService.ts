import cloudinary from "@/src/lib/cloudinary";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import { AppError } from "@/src/lib/AppError";
import { Types } from "mongoose";

interface GetAllPostsParams {
  limit: number;
  skip: number;
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

export const getAllPosts = async ({ limit, skip }: GetAllPostsParams) => {
  const [posts, totalItems] = await Promise.all([
    Post.find()
      .populate("author", "username profilePic")
      .populate(commentPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(),
  ]);

  return { posts, totalItems };
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
  skip,
}: {
  userId: string;
  limit: number;
  skip: number;
}) => {
  const user = await User.findById(userId).select(
    "username email profilePic bio",
  );
  if (!user) throw new AppError(404, "User not found");

  const [posts, totalItems] = await Promise.all([
    Post.find({ author: user._id })
      .populate("author", "username profilePic")
      .populate(commentPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ author: user._id }),
  ]);

  return {
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    bio: user.bio,
    posts,
    totalItems,
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
