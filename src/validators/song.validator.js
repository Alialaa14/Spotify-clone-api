import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { check, body } from "express-validator";
import Custom_Error from "../utils/Custom_Error.js";
import { StatusCodes } from "http-status-codes";
export const addSongValidator = [
  check("title").notEmpty().withMessage("Title is Required").trim(),
  check("description")
    .optional()
    .isLength({ max: 400 })
    .withMessage("Description Should be maximum of 400"),
  check("releaseDate").optional().isDate().withMessage("Invalid Date"),
  check("lyrics")
    .optional()
    .isLength({ max: 400 })
    .withMessage("Lyrics Should be maximum of 400"),
  check("artistId")
    .notEmpty()
    .withMessage("Artist'id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  check("albumId").optional().isMongoId().withMessage("Invalid Mongo id"),
  body("coverImage").custom((val, { req }) => {
    if (!req.files?.coverImage?.length) {
      throw new Custom_Error(
        "Cover Image is Required",
        StatusCodes.BAD_REQUEST,
      );
    }
    return true;
  }),
  // body("song").custom((value, { req }) => {
  //   if (!req.files?.song?.length) {
  //     throw new Custom_Error("Song is Required", StatusCodes.BAD_REQUEST);
  //   }
  //   return true;
  // }),
  validationMiddleware,
];

export const updateSongValidator = [
  check("title").notEmpty().withMessage("Title is Required").trim(),
  check("description").optional().isLength({ max: 400 }),
  check("releaseDate").optional().isDate().withMessage("Invalid Date"),
  check("lyrics").optional().isLength({ max: 400 }),
  check("id")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const deleteSongValidator = [
  check("id")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const getSongValidator = [
  check("id")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const getSongsValidator = [
  check("albumId").optional().isMongoId().withMessage("Invalid Mongo Id"),
  check("artistId").optional().isMongoId().withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const likeSongValidator = [
  check("id")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];
