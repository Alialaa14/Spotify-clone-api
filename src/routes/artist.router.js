import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import {
  createArtist,
  deleteArtist,
  followArtist,
  getArtist,
  getArtists,
  updateArtist,
} from "../controlers/artist.controller.js";
import { upload } from "../utils/multer.js";
import {
  createArtistValidator,
  deleteArtistValidator,
  getArtistValidator,
  updateArtistValidator,
} from "../validators/artist.validator.js";
const router = Router();
router
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized,
    upload.single("image"),
    createArtistValidator,
    createArtist,
  )
  .get(isAuthenticated, getArtists);

router
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized,
    upload.single("image"),
    updateArtistValidator,
    updateArtist,
  )
  .delete(isAuthenticated, isAuthorized, deleteArtistValidator, deleteArtist)
  .get(isAuthenticated, getArtistValidator, getArtist);

router.route("/:id/follow").patch(isAuthenticated, followArtist);

export default router;
