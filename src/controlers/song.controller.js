import { asyncHandler } from "../utils/asyncHandler.js";
import Song from "../models/song.model.js";
import Custom_Error from "../utils/Custom_Error.js";
import Album from "../models/album.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Artist from "../models/artist.model.js";
import User from "../models/user.model.js";
import { cleanTempFilesAfterUpload } from "../utils/cleanTempFiles.js";

export const addSong = asyncHandler(async (req, res, next) => {
  const { title, description, lyrics, releaseDate } = req.body;
  const { artistId, albumId } = req.query;
  const coverImage = req.files?.coverImage[0];
  const song = req.files?.song[0];

  const existingSong = await Song.findOne({ title, artist: artistId });

  if (existingSong) {
    return next(new Custom_Error("You can't Repeat Creating This Song"));
  }

  // Check if the artist has this album or not
  const artist = await Artist.findById(artistId);
  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.NOT_FOUND));

  if (!artist.albums.includes(albumId))
    return next(
      new Custom_Error(
        "You can't add this song to this album",
        StatusCodes.BAD_REQUEST,
      ),
    );

  // upload CoverImage to cloudinary
  const { secure_url: coverImage_url } = await cloudinary.uploader.upload(
    coverImage.path,
    {
      folder: `SpotifyClone/songs/${artistId}-coverImage`,
      resource_type: "image",
    },
  );

  // upload Song to Cloudinary
  const { secure_url: song_url } = await cloudinary.uploader.upload(song.path, {
    folder: `SpotifyClone/songs/${artistId}`,
    resource_type: "video",
  });

  // Find Album if the song is added to album

  const newSong = await Song.create({
    title,
    description,
    lyrics,
    releaseDate,
    artist: artistId,
    album: albumId,
    coverImage: coverImage_url,
    song_url: song_url,
  });

  if (!newSong) return next(new Custom_Error("We Couldn't Create Song"));

  const updateArtist = await Artist.findByIdAndUpdate(artistId, {
    $push: { songs: newSong._id },
  });

  if (!updateArtist) return next(new Custom_Error("We Couldn't Update Artist"));

  if (albumId) {
    const album = await Album.findByIdAndUpdate(albumId, {
      $push: { songs: newSong._id },
    });
    if (!album)
      return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));
  }

  cleanTempFilesAfterUpload([coverImage, song]);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Song Created Successfully",
    data: newSong,
  });
});

export const updateSong = asyncHandler(async (req, res, next) => {
  const { title, description, lyrics, releaseDate } = req.body;
  const songId = req.params.id;
  const coverImage = req.file;

  const song = await Song.findById(songId);

  if (!song)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));

  // upload CoverImage to cloudinary
  const { secure_url: coverImage_url } = await cloudinary.uploader.upload(
    coverImage.path,
    {
      folder: `SpotifyClone/songs/${song.artist}-coverImage`,
      resource_type: "image",
    },
  );

  const updateSong = await Song.findByIdAndUpdate(
    songId,
    {
      title: title || song.title,
      description: description || song.description,
      lyrics: lyrics || song.lyrics,
      releaseDate: releaseDate || song.releaseDate,
      coverImage: coverImage_url || song.coverImage,
    },
    { new: true },
  );

  if (!updateSong) return next(new Custom_Error("We Couldn't Update Song"));

  if (coverImage) {
    cleanTempFilesAfterUpload([coverImage]);
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Song Updated Successfully",
    data: updateSong,
  });
});

export const deleteSong = asyncHandler(async (req, res, next) => {
  const songId = req.params.id;

  const deletedSong = await Song.findByIdAndDelete(songId);
  if (!deletedSong)
    return next(
      new Custom_Error("We Couldn't Delete Song", StatusCodes.BAD_REQUEST),
    );

  const updateArtist = await Artist.findByIdAndUpdate(deletedSong.artist, {
    $pull: { songs: songId },
  });
  if (!updateArtist)
    return next(
      new Custom_Error("We Couldn't Update Artist or Artist Not Found"),
    );

  if (deleteSong.Album) {
    const album = await Album.findByIdAndUpdate(deletedSong.album, {
      $pull: { songs: songId },
    });
    if (!album)
      return next(new Custom_Error("Album Not Found", StatusCodes.BAD_REQUEST));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Song Deleted Successfully",
    data: deletedSong,
  });
});

export const getSong = asyncHandler(async (req, res, next) => {
  const songId = req.params.id;
  const song = await Song.findById(songId)
    .populate("artist", "name image isVerified")
    .populate("album", "name coverImage");
  if (!song)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Song Fetched Successfully",
    data: song,
  });
});

export const getSongs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    artistId: artist,
    albumId: album,
    filter = "followed",
  } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  let queryFilter = {};
  if (search) {
    queryFilter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (artist) {
    queryFilter.artist = artist;
  }
  if (album) {
    queryFilter.album = album;
  }
  if (filter === "followed") {
    const user = await User.findById(req.user).select("followedArtists");
    queryFilter.artist = {
      $in: user.followedArtists,
    };
  }

  const songs = await Song.find(queryFilter)
    .skip(skip)
    .limit(Number(limit))
    .populate("artist", "name image isVerified")
    .populate("album", "name coverImage");
  if (!songs)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Songs Fetched Successfully",
    data: songs,
  });
});

export const likeSong = asyncHandler(async (req, res, next) => {
  const songId = req.params.id;
  const userId = req.user;
  const song = await Song.findById(songId);
  if (!song)
    return next(new Custom_Error("Song Not Found", StatusCodes.NOT_FOUND));

  const user = await User.findById(userId);
  if (!user)
    return next(new Custom_Error("User Not Found", StatusCodes.NOT_FOUND));

  const isLiked = user.likedSongs.includes(songId);
  if (isLiked) {
    user.likedSongs.pull(songId);
    song.likes -= 1;
  } else {
    user.likedSongs.push(songId);
    song.likes += 1;
  }

  await user.save();
  await song.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: isLiked ? "Song Unliked Successfully" : "Song Liked Successfully",
  });
});
