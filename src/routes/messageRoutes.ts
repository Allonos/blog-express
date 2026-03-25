import express from "express";
import {
  getMessagesByUserId,
  sendMessage,
} from "@/src/controllers/message/messageControllers";

const router = express.Router();

router.get("/get-messages/:id", getMessagesByUserId);

router.post("/send-message/:id", sendMessage);

export default router;
