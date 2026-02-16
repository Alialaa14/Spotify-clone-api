import { Router } from "express";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbum,
  getAlbums,
  likeAlbum,
} from "../controlers/album.controller.js";
import {
  createAlbumValidator,
  updateAlbumValidator,
  deleteAlbumValidator,
  getAlbumValidator,
} from "../validators/album.validator.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { upload } from "../utils/multer.js";
const router = Router();

router
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized,
    upload.single("coverImage"),
    createAlbumValidator,
    createAlbum,
  )
  .get(isAuthenticated, isAuthorized, getAlbumValidator, getAlbums);

router
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized,
    upload.single("coverImage"),
    updateAlbumValidator,
    updateAlbum,
  )
  .delete(isAuthenticated, isAuthorized, deleteAlbumValidator, deleteAlbum)
  .get(isAuthenticated, isAuthorized, getAlbumValidator, getAlbum);

router.route("/:id/like").put(isAuthenticated, likeAlbum);
export default router;
