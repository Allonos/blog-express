import express from "express";
import cors from "cors";
import "dotenv/config";
import "dotenv/config";
import cookieParser from "cookie-parser";

import authRoutes from "@/src/routes/authRoutes";
import { connectDB } from "./lib/db";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
