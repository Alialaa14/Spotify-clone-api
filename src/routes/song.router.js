import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import {
  addSongValidator,
  deleteSongValidator,
  getSongsValidator,
  getSongValidator,
  likeSongValidator,
  updateSongValidator,
} from "../validators/song.validator.js";
import { upload } from "../utils/multer.js";
import {
  addSong,
  getSongs,
  updateSong,
  deleteSong,
  getSong,
  likeSong,
} from "../controlers/song.controller.js";

const router = Router();

router
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized,
    upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "song", maxCount: 1 },
    ]),
    addSongValidator,
    addSong,
  )
  .get(isAuthenticated, getSongsValidator, getSongs);

router
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized,
    upload.single("coverImage"),
    updateSongValidator,
    updateSong,
  )
  .delete(isAuthenticated, isAuthorized, deleteSongValidator, deleteSong)
  .get(isAuthenticated, getSongValidator, getSong);

router.route("/:id/like").patch(isAuthenticated, likeSongValidator, likeSong);

export default router;
