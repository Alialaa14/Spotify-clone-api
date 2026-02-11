import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { check } from "express-validator";
import User from "../models/user.model.js";
import Custom_Error from "../utils/Custom_Error.js";
import { StatusCodes } from "http-status-codes";
export const registerValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is Required")
    .isLength({ max: 40 })
    .withMessage("Name Length shouldn't be more than 40 characters")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Not Valid Email")
    .notEmpty()
    .withMessage("Email is Required")
    .trim(),
  check("password").notEmpty().withMessage("Password is Required"),
  validationMiddleware,
];

export const loginValidator = [
  check("email")
    .isEmail()
    .withMessage("Not Valid Email")
    .notEmpty()
    .withMessage("Email is Required")
    .trim(),
  validationMiddleware,
];

export const forgetPasswordValidator = [
  check("email")
    .isEmail()
    .withMessage("Not Valid Email")
    .notEmpty()
    .withMessage("Email is Required")
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (!user)
        throw new Custom_Error("User Not Found", StatusCodes.NOT_FOUND);
    }),
  validationMiddleware,
];

export const verifyOtpValidator = [
  check("otp").notEmpty().withMessage("Otp is Required"),
  validationMiddleware,
];

export const resetPasswordValidator = [
  check("password").notEmpty().withMessage("Password is Required"),
  validationMiddleware,
];

export const verifyAccountValidator = [
  check("otp").notEmpty().withMessage("Otp is Required"),
  validationMiddleware,
];

export const getUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is Required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validationMiddleware,
];
