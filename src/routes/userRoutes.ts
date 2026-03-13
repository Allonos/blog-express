import express from "express";
import {
  getUserByUsername,
  updateProfile,
} from "../controllers/user/userControllers";

const router = express.Router();

router.patch("/update/:id", updateProfile);

router.get("/find-user", getUserByUsername);

export default router;
