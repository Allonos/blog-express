import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    if (!mongoURI)
      throw new Error("MONGO_URI not defined in environment variables");

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};
