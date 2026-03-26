import jwt from "jsonwebtoken";
import User from "../models/User";

export const socketAuthMiddleware = async (socket: any, next: any) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const token = cookieHeader
      .split("; ")
      .find((row: string) => row.startsWith("blogToken="))
      ?.split("=")[1];

    if (!token) {
      console.log("socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    if (!decoded) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("Unauthorized - User not found"));
    }

    socket.data.userId = user._id.toString();

    console.log(
      `Socket authenticated for user: ${user.username} (${user._id})`,
    );
    next();
  } catch (error) {
    console.log("Socket connection rejected: Error occurred", error);
    next(new Error("Unauthorized - Authentication failed"));
  }
};
