import cloudinary from "@/src/lib/cloudinary";
import Comment from "@/src/models/Comment";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import { Response } from "express";
import { AuthRequest } from "@/src/middleware/protectRoute";

export const createPost = async (req: AuthRequest, res: Response) => {
  const { description, image } = req.body;
  const id = req.user._id;

  if (!description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let newPost;

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      newPost = await Post.create({
        author: id,
        description,
        image: uploadedImage.secure_url,
      });
    } else {
      newPost = await Post.create({
        author: id,
        description,
      });
    }

    await newPost.populate("author", "username profilePic");

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("error in createPost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePic" },
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 });

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found" });
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error("error in getAllPosts", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePic" },
        options: { sort: { createdAt: -1 } },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("error in getPostById", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostsByUserId = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select(
      "username email profilePic bio",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePic" },
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      posts,
    });
  } catch (error) {
    console.error("error in getPostsByUserId", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes) post.likes = [];
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error("error in likePost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Post does not belong to the user" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("error in deletePost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
