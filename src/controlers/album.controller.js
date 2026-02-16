import { asyncHandler } from "../utils/asyncHandler.js";
import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";
import Custom_Error from "../utils/Custom_Error.js";
import { upload } from "../utils/multer.js";
import cloudinary from "../config/cloudinary.js";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createAlbum = asyncHandler(async (req, res, next) => {
  const { title, description, releaseDate, artistId } = req.body;
  const file = req.file;

  // Check For EXISTING ALBUM
  const existedAlbum = await Album.findOne({ title });

  if (existedAlbum) {
    if (file) fs.unlinkSync(file.path);
    return next(
      new Custom_Error("Album Already Existed", StatusCodes.BAD_REQUEST),
    );
  }

  //Check For Existing Artist
  const artist = await Artist.findById(artistId);
  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.BAD_REQUEST));

  let secure_url = "";
  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `SpotifyClone/albums/${artist.name}/${title}`,
    });

    secure_url = result.secure_url;
  }

  const album = await Album.create({
    title,
    description,
    releaseDate,
    artist: artistId,
    coverImage: secure_url,
  });
  fs.unlinkSync(file.path);

  // Add Album To Artist
  artist.albums.push(album._id);
  await artist.save();

  if (!album) return next(new Custom_Error("We Couldn't Create Album", 400));
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Album Created Successfully",
    data: album,
  });
});

export const updateAlbum = asyncHandler(async (req, res, next) => {
  const { title, description, releaseDate } = req.body;
  const albumId = req.params.id;
  const file = req.file;

  //CHECK FOR EXISTING ALBUM
  const album = await Album.findById(albumId);
  if (!album) {
    fs.unlinkSync(file.path);
    return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));
  }

  let secure_url = album.coverImage;

  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `SpotifyClone/albums/${album.artist}/${album.title}`,
    });
    secure_url = result.secure_url;
  }
  fs.unlinkSync(file.path);
  const updateAlbum = await Album.findByIdAndUpdate(
    albumId,
    {
      title: title || album.title,
      description: description || album.description,
      releaseDate: releaseDate || album.releaseDate,
      coverImage: secure_url,
    },
    { new: true },
  );

  if (!updateAlbum)
    return next(
      new Custom_Error("We Couldn't Update Album", StatusCodes.BAD_REQUEST),
    );
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Album Updated Successfully",
    data: updateAlbum,
  });
});

export const deleteAlbum = asyncHandler(async (req, res, next) => {
  const albumId = req.params.id;

  const deletedAlbum = await Album.findByIdAndDelete(albumId);
  const updateArtist = await Artist.findByIdAndUpdate(deletedAlbum.artist, {
    $pull: { albums: albumId },
  });

  if (!updateArtist)
    return next(
      new Custom_Error("We Couldn't Update Artist", StatusCodes.BAD_REQUEST),
    );

  if (!deletedAlbum)
    return next(
      new Custom_Error("We Couldn't Delete Album", StatusCodes.BAD_REQUEST),
    );

  await Song.deleteMany({ album: albumId });
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Album Deleted Successfully",
    data: deletedAlbum,
  });
});

export const getAlbum = asyncHandler(async (req, res, next) => {
  const albumId = req.params.id;

  const album = await Album.findById(albumId)
    .populate("artist", "name image")
    .populate("songs", "title coverImage song_duration artist likes downloads");

  if (!album)
    return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Album Fetched Successfully",
    data: album,
  });
});

export const getAlbums = asyncHandler(async (req, res, next) => {
  const { artistId } = req.query;
  const { page = 1, limit = 10, search } = req.query;
  const skip = Number(page - 1) * Number(limit);

  let filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const albums = await Album.find(
    artistId ? { artist: artistId, ...filter } : filter,
  )
    .skip(skip)
    .limit(Number(limit))
    .sort({ likes: -1 });

  if (!albums)
    return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));

  if (albums.length === 0)
    return next(
      new Custom_Error("There Are No Albums", StatusCodes.BAD_REQUEST),
    );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Albums Fetched Successfully",
    data: albums,
  });
});

export const likeAlbum = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const albumId = req.params.id;

  const album = await Album.findById(albumId);
  if (!album)
    return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));

  const existingUser = await User.findById(user);
  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.BAD_REQUEST));

  const isLiked = existingUser.likedAlbums.includes(albumId);
  if (isLiked) {
    album.likes -= 1;
    existingUser.likedAlbums.pull(albumId);
  } else {
    album.likes += 1;
    existingUser.likedAlbums.push(albumId);
  }

  await album.save();
  await existingUser.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: isLiked
      ? "Album Unliked Successfully"
      : "Album Liked Successfully",
  });
});
