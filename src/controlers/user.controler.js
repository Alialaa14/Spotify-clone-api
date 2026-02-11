import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Custom_Error from "../utils/Custom_Error.js";
import { generateToken } from "../utils/generateToken.js";
import { StatusCodes } from "http-status-codes";
import { ENV } from "../utils/ENV.js";
import { OtpTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
// Register Controler
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existedUser = await User.findOne({ email });

  if (existedUser)
    return next(new Custom_Error("Email is Already Registerd Please Login"));

  const user = await User.create({
    name,
    email,
    password,
  });

  if (!user) return next(new Custom_Error("We Couldn't Create User"));

  return res.status(200).json({
    success: true,
    message: "User Created Successfully",
    data: {
      id: user._id,
      token: generateToken({ data: user._id, expiration: "5d" }),
    },
  });
});
// login

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.NOT_FOUND));

  //Match Password
  const matchPassword = await user.comparePassword(password);

  // Fix global error Handler
  if (!matchPassword)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Incorrect Password" });
  // return new Custom_Error("Incorrect Password", StatusCodes.BAD_REQUEST);

  return res.status(200).json({
    success: true,
    message: "User Logged In Successfully",
    data: {
      id: user._id,
      token: generateToken({ data: user._id, expiration: "5d" }),
    },
  });
});
// logout
export const logout = asyncHandler(async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "User Logged Out Successfully",
  });
});
// fogetpassword

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // //Generate Otp
  const otp = Math.floor(100000 + Math.random() * 900000);

  const isEmailSent = sendEmail(
    email,
    "Reset Password",
    OtpTemplate({ otp, name: user.name }),
  );

  if (!isEmailSent)
    return next(new Custom_Error("Email Not Sent", StatusCodes.BAD_REQUEST));

  user.Otp = otp;
  await user.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Otp Sent Successfully",
    data: {
      token: generateToken({ data: user._id, expiration: "30m" }),
    },
  });
});
// verify otp
export const verifyOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const token = req.headers.authorization.startsWith("Bearer")
    ? req.headers.authorization.split(" ")[1]
    : false;

  if (!token)
    return next(new Custom_Error("Token Not Found", StatusCodes.BAD_REQUEST));

  const decode = jwt.verify(token, ENV.JWT_SECRET);

  const user = await User.findById(decode.data);

  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.BAD_REQUEST));

  if (user.Otp !== otp)
    return next(new Custom_Error("Incorrect Otp", StatusCodes.BAD_REQUEST));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Otp Verified Successfully",
    data: {
      id: user._id,
      token: generateToken({
        data: { id: user._id, verified: true },
        expiration: "10m",
      }),
    },
  });
});
// reset password

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const token = req.headers.authorization.startsWith("Bearer")
    ? req.headers.authorization.split(" ")[1]
    : false;

  if (!token)
    return next(new Custom_Error("Token Not Found", StatusCodes.BAD_REQUEST));

  const decode = jwt.verify(token, ENV.JWT_SECRET);

  const isVerified = decode.data.verified;
  if (!isVerified)
    return new Custom_Error("User Not Verified", StatusCodes.BAD_REQUEST);

  const user = await User.findById(decode.data.id);

  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.BAD_REQUEST));

  user.password = password;
  user.Otp = "";
  await user.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Password Reset Successfully",
  });
});
//Send Account Verification Email
export const accountVerificationOtp = asyncHandler(async (req, res, next) => {
  const userId = req.user;

  const user = await User.findById(userId);

  const otp = Math.floor(100000 + Math.random() * 900000);

  const isEmailSent = sendEmail(
    user.email,
    "Account Verification",
    OtpTemplate({ otp, name: user.name }),
  );

  if (!isEmailSent)
    return next(new Custom_Error("Email Not Sent", StatusCodes.BAD_REQUEST));

  user.Otp = otp;
  await user.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Otp Sent Successfully",
  });
});
// verify-account
export const verifyAccount = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const userId = req.user;

  const user = await User.findById(userId);

  if (user.Otp !== otp)
    return next(new Custom_Error("Otp Not Match", StatusCodes.BAD_REQUEST));

  user.isVerified = true;
  user.Otp = "";
  await user.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Account Verified Successfully",
  });
});
// get user

export const getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id).select("-password -Otp ");

  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.BAD_REQUEST));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "User Fetched Successfully",
    data: user,
  });
});
// get Users for admin

export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password -Otp ");

  if (!users)
    return next(new Custom_Error("Users Not Found", StatusCodes.BAD_REQUEST));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Users Fetched Successfully",
    data: users,
  });
});
