import { Request, Response } from "express";
import {
  updateUserProfile,
  searchUsersByUsername,
  getAllUsers,
  getTextedUsers,
} from "@/src/services/user/userService";
import { AppError } from "@/src/lib/AppError";
import { AuthRequest } from "@/src/middleware/protectRoute";
import { parsePagination } from "@/src/lib/pagination";

export const updateProfile = async (req: Request, res: Response) => {
  const { username, bio, profilePic } = req.body;
  const userId = req.params.id as string;

  if (!username && !bio && !profilePic) {
    return res.status(400).json({
      message: "Provide a username, bio, or profile picture to update",
    });
  }

  try {
    const user = await updateUserProfile(userId, { username, bio, profilePic });
    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Error in updateProfile", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const { username } = req.query;
  const { limit, skip } = parsePagination(req.query);

  try {
    const { users, totalItems } = await searchUsersByUsername({
      username: username as string,
      limit,
      skip,
    });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    return res.status(200).json({
      users,
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
    console.error("Error in getUserByUsername", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id as string;

  try {
    const { limit, skip } = parsePagination(req.query);
    const { users, totalItems } = await getAllUsers({ userId, limit, skip });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    return res.status(200).json({
      users,
      page,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    });
  } catch (error) {
    console.error("Error in getUsers", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTextedContacts = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id as string;
  const { limit, skip } = parsePagination(req.query);

  try {
    const { users, totalItems } = await getTextedUsers({ userId, limit, skip });
    const { page, totalPages, hasNextPage, isFirstPage, isLastPage } =
      parsePagination(req.query, undefined, totalItems);

    return res.status(200).json({
      users,
      page,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    });
  } catch (error) {
    console.error("Error in getTextedContacts", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
