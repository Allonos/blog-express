import User from "@/models/User";
import bcrypt from "bcrypt";
import { AppError } from "@/lib/AppError";

export const signupUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError(400, "Email already in use");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  return {
    _id: newUser._id,
    username: newUser.username,
    email: newUser.email,
  };
};

export const googleAuthUser = async (
  googleId: string,
  email: string,
  username: string,
  profilePic: string,
) => {
  let user = await User.findOne({ googleId });
  if (user) return user;

  user = await User.findOne({ email });
  if (user) {
    user.googleId = googleId;
    if (!user.profilePic) user.profilePic = profilePic;
    await user.save();
    return user;
  }

  user = new User({ googleId, email, username, profilePic });
  await user.save();
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError(400, "Invalid credentials");

  if (!user.password)
    throw new AppError(400, "This account uses Google Sign-In");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Invalid credentials");

  return user;
};
