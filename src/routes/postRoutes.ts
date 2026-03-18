import experss from "express";
import {
  createPost,
  getAllPosts,
} from "@/src/controllers/posts/postControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = experss.Router();

router.post("/create", protectRoute, createPost);

router.get("/get-all-posts", getAllPosts);

export default router;
