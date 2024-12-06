const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const generateToken = require("../config/generateToken");
const register = async (req, res, next) => {
  const { name, userName, email, password } = req.body;
  // Validate request body
  if (!name || !userName || !email || !password) {
    return next(new ErrorResponse("All fields are required", 400));
  }

  try {
    const isUser = await User.findOne({ email });
    if (isUser) {
      return next(new ErrorResponse("User already exists", 400));
    }
    // Password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: createdUser._id, email: createdUser.email },
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return next(new ErrorResponse("Email and password are required", 401));
  }
  try {
    const isUser = await User.findOne({ email });
    if (!isUser) {
      return next(new ErrorResponse("Invalid email or password", 401));
    }
    const ismatch = await isUser.matchPassword(password);
    if (!ismatch) {
      return next(new ErrorResponse("Invalid email or password", 401));
    }
    const token = generateToken(isUser._id);
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};
const logout = (req, res) => {
  res.clearCookie("userToken");

  return res.status(200).json({ success: true, message: "Logout successful" });
};

module.exports = { register, login, logout };
