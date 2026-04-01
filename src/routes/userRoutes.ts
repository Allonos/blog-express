import express from "express";
import {
  getUserByUsername,
  updateProfile,
  getUsers,
  getTextedContacts,
} from "../controllers/user/userControllers";
import { protectRoute } from "../middleware/protectRoute";
import upload from "../middleware/upload";

const router = express.Router();

router.patch(
  "/update/:id",
  protectRoute,
  upload.single("profilePic"),
  updateProfile,
);

router.get("/find-user", protectRoute, getUserByUsername);

router.get("/", protectRoute, getUsers);

router.get("/contacts", protectRoute, getTextedContacts);

export default router;
