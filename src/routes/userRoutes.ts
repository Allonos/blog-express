import express from "express";
import {
  getUserByUsername,
  updateProfile,
} from "../controllers/user/userControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.patch("/update/:id", protectRoute, updateProfile);

router.get("/find-user", protectRoute, getUserByUsername);

export default router;
