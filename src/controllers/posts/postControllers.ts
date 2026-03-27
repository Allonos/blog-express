import { Response } from "express";
import { AuthRequest } from "@/middleware/protectRoute";
import {
  createPost as createPostService,
  getAllPosts as getAllPostsService,
  getPostById as getPostByIdService,
  getPostsByUserId as getPostsByUserIdService,
  toggleLikePost,
  deletePost as deletePostService,
} from "@/services/posts/postService";
import { AppError } from "@/lib/AppError";
import { parsePagination } from "@/lib/pagination";

export const createPost = async (req: AuthRequest, res: Response) => {
  const { description, image } = req.body;
  const userId = req.user._id.toString();

  if (!description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const post = await createPostService(userId, description, image);
    return res.status(201).json(post);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in createPost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPosts = async (req: AuthRequest, res: Response) => {
  const { limit, skip } = parsePagination(req.query);

  try {
    const { posts, totalItems } = await getAllPostsService({ limit, skip });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    return res.status(200).json({
      posts,
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
    console.error("error in getAllPosts", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;

  try {
    const post = await getPostByIdService(postId);
    return res.status(200).json(post);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in getPostById", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostsByUserId = async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId as string;
  const { limit, skip } = parsePagination(req.query);

  try {
    const { username, email, profilePic, bio, posts, totalItems } =
      await getPostsByUserIdService({ userId, limit, skip });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    return res.status(200).json({
      username,
      email,
      profilePic,
      bio,
      posts,
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
    console.error("error in getPostsByUserId", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const userId = req.user._id.toString();

  try {
    const result = await toggleLikePost(postId, userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in likePost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const userId = req.user._id.toString();

  try {
    await deletePostService(postId, userId);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("error in deletePost", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
