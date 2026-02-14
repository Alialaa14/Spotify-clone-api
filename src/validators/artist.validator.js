import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { check } from "express-validator";

export const createArtistValidator = [
  check("name").notEmpty().withMessage("Name is Required").trim(),
  check("bio")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Bio is too long")
    .trim(),
  validationMiddleware,
];

export const updateArtistValidator = [
  check("name").optional().trim(),
  check("bio")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Bio is too long")
    .trim(),
  validationMiddleware,
];

export const getArtistValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is Required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validationMiddleware,
];

export const deleteArtistValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is Required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validationMiddleware,
];
