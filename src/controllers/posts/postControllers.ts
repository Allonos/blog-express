import cloudinary from "@/src/lib/cloudinary";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import { Request, Response } from "express";

export const createPost = async (req: Request, res: Response) => {
  const { id, description, image } = req.body;

  if (!id || !description) {
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

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePic")
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

export const getPostsByUserId = async (req: Request, res: Response) => {
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

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body;

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
