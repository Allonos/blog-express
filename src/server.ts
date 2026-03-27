import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db";
import passport from "@/lib/passport";
import { app, server } from "@/lib/socket";

import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import postRoutes from "@/routes/postRoutes";
import commentRoutes from "@/routes/commentRoutes";
import messageRoutes from "@/routes/messageRoutes";

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/message", messageRoutes);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
