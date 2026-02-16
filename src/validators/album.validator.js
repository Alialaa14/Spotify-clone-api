import { check } from "express-validator";
import { validationMiddleware } from "../middlewares/validation.middleware.js";

export const createAlbumValidator = [
  check("title").notEmpty().withMessage("Title is Required").trim(),
  check("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Description is too long")
    .trim(),
  check("releaseDate").optional().isDate().withMessage("Invalid Date"),
  check("artistId").notEmpty().withMessage("Artist Id is Required"),
  validationMiddleware,
];

export const updateAlbumValidator = [
  check("title").notEmpty().withMessage("Title is Required").trim(),
  check("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Description is too long")
    .trim(),
  check("releaseDate").optional().isDate().withMessage("Invalid Date"),
  check("id").notEmpty().withMessage("Album Id is Required"),
  validationMiddleware,
];

export const deleteAlbumValidator = [
  check("id")
    .notEmpty()
    .withMessage("Album Id is Required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validationMiddleware,
];

export const getAlbumValidator = [
  check("artistId").optional().isMongoId().withMessage("Invalid Id"),
  validationMiddleware,
];
