import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload } from "../utils/multer.js";
import {
  addCollabToPlaylist,
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylistOfMe,
  getPlaylists,
  likePlaylist,
  removeCollabToPlaylist,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../controlers/playlist.controller.js";
import {
  likePlaylistValidator,
  addCollabratorToPlaylistValidator,
  addSongToPlaylistValidator,
  createPlaylistValidator,
  deletePlaylisValidator,
  removeCollabratorFromPlaylistValidator,
  removeSongFromPlaylistValidator,
  updatePlaylistValidator,
  getPlaylistValidator,
} from "../validators/playlist.validator.js";
import { removeTempFiles } from "../middlewares/removeTempFiles.js";
const router = Router();

router.use(removeTempFiles);
router
  .route("/")
  .post(
    isAuthenticated,
    upload.single("coverImage"),
    createPlaylistValidator,
    createPlaylist,
  )
  .get(isAuthenticated, getPlaylists);

router.route("/me").get(isAuthenticated, getPlaylistOfMe);
router
  .route("/:id")
  .patch(
    isAuthenticated,
    upload.single("coverImage"),
    updatePlaylistValidator,
    updatePlaylist,
  )
  .delete(isAuthenticated, deletePlaylisValidator, deletePlaylist)
  .get(isAuthenticated, getPlaylistValidator, getPlaylist);

router
  .route("/:playlistId/song/:songId")
  .post(isAuthenticated, addSongToPlaylistValidator, addSongToPlaylist)
  .delete(
    isAuthenticated,
    removeSongFromPlaylistValidator,
    removeSongFromPlaylist,
  );
router
  .route("/:id/collabs")
  .post(isAuthenticated, addCollabratorToPlaylistValidator, addCollabToPlaylist)
  .delete(
    isAuthenticated,
    removeCollabratorFromPlaylistValidator,
    removeCollabToPlaylist,
  );
router
  .route("/:id/like")
  .patch(isAuthenticated, likePlaylistValidator, likePlaylist);
export default router;
