import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js"; // Assuming this is the correct path for the Stream user creation function

// Controller for user signup
// This function handles user registration, including validation, password hashing, and JWT token generation
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const profilePicture = `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}&backgroundColor=ffcc00&backgroundType=gradientLinear&size=100&radius=50&scale=100&fontFamily=Arial&fontSize=50&fontWeight=500&color=000000`;

    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePicture,
    });

    //   todo: create the user in stream as well

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    // Generate JWT token
    // This token will be used for authentication in subsequent requests

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Helps prevent CSRF attacks
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Helps prevent CSRF attacks
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
}

export async function onboard(req, res) {
  try{
    const userId = req.user._id;
    const { fullName,bio,nativeLanguage,learningLanguage ,location } = req.body;
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json(
        { message: "All fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded: true,
    },{ new: true }); 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // update the user info in  Stream 

    res.status(200).json({
      success: true,
      message: "User onboarded successfully",
      user: updatedUser,
    });
    
  }catch (error) {
    console.error("Error in onboarding controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
