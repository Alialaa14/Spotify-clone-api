// CREATE ARTIST
// UPDATE ARTIST
// DELETE ARTIST
// GET ARTIST
// GET ALL ARTISTS
// FOLLOW AND UNFOLLOW ARTIST
import Artist from "../models/artist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Custom_Error from "../utils/Custom_Error.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Song from "../models/song.model.js";
import Album from "../models/album.model.js";
import User from "../models/user.model.js";

export const createArtist = asyncHandler(async (req, res, next) => {
  const { name, bio } = req.body;
  const file = req.file;

  const existedArtist = await Artist.findOne({ name });
  if (existedArtist) {
    if (file) fs.unlinkSync(file.path);
    return next(
      new Custom_Error("Artist Already Existed", StatusCodes.BAD_REQUEST),
    );
  }

  let secure_Url = "";
  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `SpotifyClone/artists/${name}`,
    });
    secure_Url = result.secure_url;
  }

  const artist = await Artist.create({
    name,
    bio,
  });

  if (file) {
    artist.image = secure_Url;
    await artist.save();
    // Delete File
    fs.unlinkSync(file.path);
  }

  if (!artist)
    return next(
      new Custom_Error("We Couldn't Create Artist", StatusCodes.BAD_REQUEST),
    );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist Created Successfully",
    data: artist,
  });
});

export const updateArtist = asyncHandler(async (req, res, next) => {
  const { name, bio } = req.body;
  const artistId = req.params.id;
  const file = req.file;

  let secure_Url = "";
  if (file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `SpotifyClone/artists/${name}`,
    });
    secure_Url = result.secure_url;
  }

  const artist = await Artist.findById(artistId);

  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.BAD_REQUEST));

  const updateArtist = await Artist.findByIdAndUpdate(artistId, {
    name: name || artist.name,
    bio: bio || artist.bio,
    image: secure_Url || artist.image,
  });

  if (!updateArtist)
    return next(
      new Custom_Error("We Couldn't Update Artist", StatusCodes.BAD_REQUEST),
    );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist Updated Successfully",
    data: updateArtist,
  });
});

export const deleteArtist = asyncHandler(async (req, res, next) => {
  const artistId = req.params.id;

  const artist = await Artist.findByIdAndDelete(artistId);

  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.BAD_REQUEST));

  await Song.deleteMany({ artist: artist._id });
  await Album.deleteMany({ artist: artist._id });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist Deleted Successfully",
  });
});

export const getArtist = asyncHandler(async (req, res, next) => {
  const artistId = req.params.id;

  const artist = await Artist.findById(artistId)
    .populate("songs", "name likes plays duration media")
    .populate("albums", "name likes");

  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.BAD_REQUEST));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artist Fetched Successfully",
    data: artist,
  });
});

export const getArtists = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  console.log(filter);
  const artists = await Artist.find(filter).skip(skip).limit(Number(limit));

  if (!artists) return next(new Custom_Error("Artists Not Found", 404));
  if (!artists.length)
    return next(new Custom_Error("There Are No Artists", 404));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Artists Fetched Successfully",
    data: artists,
  });
});

export const followArtist = asyncHandler(async (req, res, next) => {
  const artistId = req.params.id;
  const userId = req.user;

  const artist = await Artist.findById(artistId);
  if (!artist)
    return next(new Custom_Error("Artist Not Found", StatusCodes.NOT_FOUND));

  const user = await User.findById(userId);
  if (!user)
    return next(
      new Custom_Error(
        "User Not Found Please Login First",
        StatusCodes.NOT_FOUND,
      ),
    );
  const isFollowed = user.followedArtists.includes(artistId);
  if (isFollowed) {
    user.followedArtists.pull(artistId);
    artist.followers.pull(userId);
    artist.followersCount -= 1;
  } else {
    user.followedArtists.push(artistId);
    artist.followers.push(userId);
    artist.followersCount += 1;
  }
  await user.save();
  await artist.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: isFollowed
      ? "Artist Unfollowed Successfully"
      : "Artist Followed Successfully",
  });
});
