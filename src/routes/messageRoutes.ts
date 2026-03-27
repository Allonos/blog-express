import express from "express";
import {
  getMessagesByUserId,
  sendMessage,
} from "@/controllers/message/messageControllers";
import { protectRoute } from "@/middleware/protectRoute";

const router = express.Router();

router.get("/get-messages/:id", protectRoute, getMessagesByUserId);

router.post("/send-message/:id", protectRoute, sendMessage);

export default router;
