import express from "express";
import cors from "cors";
import "dotenv/config";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db";

import authRoutes from "@/src/routes/authRoutes";
import userRoutes from "@/src/routes/userRoutes";
import postRoutes from "@/src/routes/postRoutes";
import commentRoutes from "@/src/routes/commentRoutes";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
