import { Router } from "express";
import {
  forgetPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyAccount,
  verifyOtp,
  accountVerificationOtp,
  getUser,
  getUsers,
  updateUser,
} from "../controlers/user.controler.js";
import {
  forgetPasswordValidator,
  getUserValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} from "../validators/user.validator.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { upload } from "../utils/multer.js";
const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/logout", logout);
router.post("/forget-password", forgetPasswordValidator, forgetPassword);
router.post("/verify-otp", verifyOtpValidator, verifyOtp);
router.patch("/reset-password", resetPasswordValidator, resetPassword);
router.post("/verify-account-otp", isAuthenticated, accountVerificationOtp);
router.patch("/verify-account", isAuthenticated, verifyAccount);
router.get("/:id", isAuthenticated, getUserValidator, getUser);
router.get("/", isAuthenticated, isAuthorized, getUsers);
router.patch("/", isAuthenticated, upload.single("pic"), updateUser);

export default router;
