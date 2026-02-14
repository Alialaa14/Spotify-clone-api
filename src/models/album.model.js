import { Schema, model } from "mongoose";

const albumSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is Required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  coverImage: {
    type: String,
    required: [true, "Ablum Image Cover Is Required"],
  },
  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],

  creator: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
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

const Album = model("Album", albumSchema);

export default Album;
