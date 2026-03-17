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
