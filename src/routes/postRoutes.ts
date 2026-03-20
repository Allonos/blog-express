import experss from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  likePost,
} from "@/src/controllers/posts/postControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = experss.Router();

router.use(protectRoute);

router.post("/create", createPost);

router.get("/get-all-posts", getAllPosts);

router.get("/get-post/:postId", getPostById);

router.get("/get-posts-by-user/:userId", getPostsByUserId);

router.post("/like/:postId", likePost);

router.delete("/delete/:postId", deletePost);

export default router;
