import experss from "express";
import {
  createPost,
  getAllPosts,
} from "@/src/controllers/posts/postControllers";

const router = experss.Router();

router.post("/create", createPost);

router.get("/get-all-posts", getAllPosts);

export default router;
