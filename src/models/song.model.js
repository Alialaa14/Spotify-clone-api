import { Schema, model } from "mongoose";

const songSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is Required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    required: [true, "Cover Image of Song is Required"],
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  lyrics: {
    type: String,
    default: "",
    maxLength: [400, "Lyrics has maximum of 400 Characters"],
  },
  song_url: {
    type: String,
    required: [true, "Song Url is required"],
  },
  song_duration: {
    type: String,
    required: [true, "Duration is Required"],
    trim: true,
  },
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
  },
  album: {
    type: Schema.Types.ObjectId,
    ref: "Album",
    default: "",
  },
  likes: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
});

const Song = model("Song", songSchema);

export default Song;
