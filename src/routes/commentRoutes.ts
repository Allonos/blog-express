import express from "express";
import {
  commentOnPost,
  deleteComment,
  deleteReply,
  replyToComment,
} from "../controllers/comment/commentControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.use(protectRoute);

router.post("/:postId", commentOnPost);

router.post("/reply/:commentId", replyToComment);

router.delete("/delete/:commentId", deleteComment);

router.delete("/reply/delete/:commentId/:replyId", deleteReply);

export default router;
