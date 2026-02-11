import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

export const validationMiddleware = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: result });
  }
  next();
};
