import jwt from "jsonwebtoken";
import Custom_Error from "./Custom_Error.js";
import { ENV } from "./ENV.js";

export const generateToken = ({ data, expiration }) => {
  return jwt.sign({ data }, ENV.JWT_SECRET, { expiresIn: expiration });
};
