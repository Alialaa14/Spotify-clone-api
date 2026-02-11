import jwt from "jsonwebtoken";
import Custom_Error from "../utils/Custom_Error.js";
import { StatusCodes } from "http-status-codes";
import { ENV } from "../utils/ENV.js";

export const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : false;
    if (!token) {
      return next(new Custom_Error("Token Not Found", StatusCodes.BAD_REQUEST));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded.data;
    next();
  } catch (error) {
    return next(new Custom_Error(error.message, StatusCodes.BAD_REQUEST));
  }
};
