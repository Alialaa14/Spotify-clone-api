import { asyncHandler } from "../utils/asyncHandler.js";
import Custom_Error from "../utils/Custom_Error.js";
import User from "../models/user.model.js";
import Song from "../models/song.model.js";
import Playlist from "../models/playlist.model.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.js";
import { cleanTempFilesAfterUpload } from "../utils/cleanTempFiles.js";
import { removeTempFiles } from "../middlewares/removeTempFiles.js";
export const createPlaylist = asyncHandler(async (req, res, next) => {
  const { title, description, collabrators, isPublic } = req.body;
  const userId = req.user;
  const file = req.file;
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new Custom_Error(
        "User Not Found Please Login First",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // Upload Cover Image to Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "SpotifyClone/playlists/coverImage-" + user._id,
  });
  const secure_url = result.secure_url;

  const playlist = await Playlist.create({
    title,
    description,
    coverImage: secure_url,
    creator: user._id,
    isPublic,
    collabrators,
  });

  if (!playlist)
    return next(
      new Custom_Error("We Couldn't Create Playlist", StatusCodes.BAD_REQUEST),
    );

  const updateUserPlaylist = await User.findByIdAndUpdate(user._id, {
    $push: {
      playlists: playlist._id,
    },
  });
  if (!updateUserPlaylist)
    return next(
      new Custom_Error("We Couldn't Update User", StatusCodes.BAD_REQUEST),
    );

  cleanTempFilesAfterUpload([file]);
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Playlist Created Successfully",
    data: playlist,
  });
});

export const updatePlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;
  const user = req.user;
  const file = req.file;
  const { title, description, isPublic } = req.body;

  const playlist = await Playlist.find({ _id: playlistId, creator: user });
  if (!playlist) {
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));
  }

  //Upload Cover Image To Cloudinary if exists

  const result = file
    ? await cloudinary.uploader.upload(file.path, {
        folder: "SpotifyClone/playlists/coverImage-" + user._id,
      })
    : null;

  const secure_url = result ? result.secure_url : playlist.coverImage;

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      title: title || playlist.title,
      description: description || playlist.description,
      coverImage: secure_url,
      isPublic,
    },
    { new: true },
  );

  if (!updatePlaylist)
    return next(
      new Custom_Error("We Couldn't Update Playlist", StatusCodes.BAD_REQUEST),
    );

  removeTempFiles([file.path]);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist Updated Successfully",
    data: updatePlaylist,
  });
});
export const deletePlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;
  const user = req.user;

  const playlist = await Playlist.find({ _id: playlistId, creator: user });
  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist)
    return next(
      new Custom_Error("We Couldn't Delete Playlist", StatusCodes.BAD_REQUEST),
    );
  const updateUserPlaylists = await User.findByIdAndUpdate(user, {
    $pull: {
      playlists: playlistId,
    },
  });

  if (!updateUserPlaylists)
    return next(
      new Custom_Error(
        "We Couldn't Update User Playlist",
        StatusCodes.BAD_REQUEST,
      ),
    );
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist Deleted Successfully",
  });
});

export const getPlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;

  const playlist = await Playlist.findById(playlistId)
    .populate("creator", "name image")
    .populate("collabrators", "name image")
    .populate("songs", "title artist album coverImage");

  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  const isAllowed =
    playlist.creator._id.toString() === req.user.toString() ||
    playlist.collabrators.includes(req.user) ||
    playlist.isPublic;

  if (!isAllowed)
    return next(
      new Custom_Error(
        "You Are Not Allowed To Access This Playlist",
        StatusCodes.FORBIDDEN,
      ),
    );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist Fetched Successfully",
    data: playlist,
  });
});

export const getPlaylists = asyncHandler(async (req, res, next) => {
  const { limit = 10, page = 1, search, sortBy = "likes" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const playlists = await Playlist.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ [sortBy]: -1 });

  if (!playlists || playlists.length === 0) {
    return next(
      new Custom_Error("There Are No Playlists", StatusCodes.BAD_REQUEST),
    );
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlists Fetched Successfully",
    data: playlists,
  });
});

export const getPlaylistOfMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const playlist = await Playlist.find({ creator: user })
    .sort({ createdAt: -1 })
    .populate("creator", "name image")
    .populate("collabrators", "name image")
    .populate("songs", "title artist album coverImage");

  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist Fetched Successfully",
    data: playlist,
  });
});
export const addSongToPlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.playlistId;
  const songId = req.params.songId;
  const user = req.user;
  const playlist = await Playlist.findOne({
    _id: playlistId,
    $or: [{ creator: user }, { collabrators: user }],
  });

  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  const song = await Song.findById(songId);
  if (!song)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));

  if (playlist.songs.includes(songId))
    return next(
      new Custom_Error("Song Already Added", StatusCodes.BAD_REQUEST),
    );

  playlist.songs.push(songId);
  await playlist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Song Added To Playlist Successfully",
    data: playlist,
  });
});
export const removeSongFromPlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.playlistId;
  const songId = req.params.songId;
  const user = req.user;

  const playlist = await Playlist.findOne({
    _id: playlistId,
    $or: [{ creator: user }, { collabrators: user }],
  });
  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  const song = await Song.findById(songId);
  if (!song)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));

  if (!playlist.songs.includes(songId))
    return next(
      new Custom_Error("Song is not in playlist", StatusCodes.BAD_REQUEST),
    );

  playlist.songs.pull(songId);
  await playlist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Song Removed From Playlist Successfully",
    data: playlist,
  });
});
export const addCollabToPlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;
  const user = req.user;
  const { collabrators } = req.body;

  const playlist = await Playlist.findOne({
    _id: playlistId,
    creator: user,
  });
  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  for (const collab of collabrators) {
    const existingUser = await User.findById(collab);
    if (!existingUser)
      return next(new Custom_Error("User Not Found", StatusCodes.NOT_FOUND));

    if (playlist.collabrators.includes(collab))
      return next(
        new Custom_Error(
          `User ${existingUser.name} is already in playlist`,
          StatusCodes.BAD_REQUEST,
        ),
      );
    playlist.collabrators.push(collab);
  }

  await playlist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Collabs Added To Playlist Successfully",
    data: playlist,
  });
});
export const removeCollabToPlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;
  const user = req.user;
  const { collabrators } = req.body;

  const playlist = await Playlist.findOne({
    _id: playlistId,
    creator: user,
  });
  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  for (const collab of collabrators) {
    const existingUser = await User.findById(collab);
    if (!existingUser)
      return next(new Custom_Error("User Not Found", StatusCodes.NOT_FOUND));

    if (!playlist.collabrators.includes(collab))
      return next(
        new Custom_Error(
          `User ${existingUser.name} is not in playlist`,
          StatusCodes.BAD_REQUEST,
        ),
      );
    playlist.collabrators.pull(collab);
  }

  await playlist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Collabs Removed To Playlist Successfully",
    data: playlist,
  });
});

export const likePlaylist = asyncHandler(async (req, res, next) => {
  const playlistId = req.params.id;
  const userId = req.user;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist)
    return next(new Custom_Error("Playlist Not Found", StatusCodes.NOT_FOUND));

  if (playlist.creator.toString() === userId.toString())
    return next(
      new Custom_Error(
        "You Can't Like Your Own Playlist",
        StatusCodes.BAD_REQUEST,
      ),
    );
  const user = await User.findById(userId);
  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.NOT_FOUND));

  const isLiked = user.likedPlaylists.includes(playlistId);
  if (isLiked) {
    user.likedPlaylists.pull(playlistId);
    playlist.likes -= 1;
  } else {
    user.likedPlaylists.push(playlistId);
    playlist.likes += 1;
  }

  await user.save();
  await playlist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Playlist Liked Successfully",
    data: playlist,
  });
});
