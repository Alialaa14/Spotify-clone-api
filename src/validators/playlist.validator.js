import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { check } from "express-validator";

export const createPlaylistValidator = [
  check("name").notEmpty().withMessage("Name is Required").trim(),
  check("description")
    .optional()
    .isLength({ max: 400 })
    .withMessage("Description is too long")
    .trim(),
  check("coverImage").notEmpty().withMessage("Cover Image is Required"),
  check("isPublic").optional().isBoolean().withMessage("Invalid Boolean"),
  check("collabrators").optional().isArray().withMessage("Invalid Array"),
  validationMiddleware,
];

export const updatePlaylistValidator = [
  check("name").optional().trim(),
  check("id")
    .notEmpty()
    .withMessage("id is Required")
    .isMongoId()
    .withMessage("Invalid id"),
  check("description")
    .optional()
    .isLength({ max: 400 })
    .withMessage("Description is too long")
    .trim(),
  check("coverImage").optional(),
  check("isPublic").optional().isBoolean().withMessage("Invalid Boolean"),
  validationMiddleware,
];

export const deletePlaylisValidator = [
  check("id")
    .notEmpty()
    .withMessage("id is Required")
    .isMongoId()
    .withMessage("Invalid id"),
  validationMiddleware,
];

export const getPlaylistValidator = [
  check("id")
    .notEmpty()
    .withMessage("id is Required")
    .isMongoId()
    .withMessage("Invalid id"),
  validationMiddleware,
];

export const addSongToPlaylistValidator = [
  check("playlistId")
    .notEmpty()
    .withMessage("Playlist Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  check("songId")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const removeSongFromPlaylistValidator = [
  check("playlistId")
    .notEmpty()
    .withMessage("Playlist Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  check("songId")
    .notEmpty()
    .withMessage("Song Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];

export const addCollabratorToPlaylistValidator = [
  check("id")
    .notEmpty()
    .withMessage("Playlist Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  check("collabrators")
    .notEmpty()
    .withMessage("Collabrator Ids is Required")
    .isArray()
    .withMessage("Invalid Array"),
  validationMiddleware,
];

export const removeCollabratorFromPlaylistValidator = [
  check("id")
    .notEmpty()
    .withMessage("Playlist Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  check("collabrators")
    .notEmpty()
    .withMessage("Collabrator Ids is Required")
    .isArray()
    .withMessage("Invalid Array"),
  validationMiddleware,
];

export const likePlaylistValidator = [
  check("id")
    .notEmpty()
    .withMessage("Playlist Id is Required")
    .isMongoId()
    .withMessage("Invalid Mongo Id"),
  validationMiddleware,
];
