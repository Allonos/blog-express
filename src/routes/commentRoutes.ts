import express from "express";
import { commentOnPost } from "../controllers/comment/commentControllers";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.use(protectRoute);

router.post("/:postId", commentOnPost);

export default router;
