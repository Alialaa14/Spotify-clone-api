import User from "../models/user.model.js";
import Custom_Error from "../utils/Custom_Error.js";
import { StatusCodes } from "http-status-codes";
export const isAuthorized = async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user.isAdmin) {
    return next(
      new Custom_Error("You are not Authorized", StatusCodes.UNAUTHORIZED),
    );
  }
  next();
};
