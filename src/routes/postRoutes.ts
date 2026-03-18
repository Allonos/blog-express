import experss from "express";
import {
  createPost,
  getAllPosts,
  getPostsByUserId,
} from "@/src/controllers/posts/postControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = experss.Router();

router.post("/create", protectRoute, createPost);

router.get("/get-all-posts", getAllPosts);

router.get("/get-posts-by-user/:userId", getPostsByUserId);

export default router;
