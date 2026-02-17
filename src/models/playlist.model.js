import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is Required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxLength: [400, "Description has maximum of 400 characters"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover Image is Required"],
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    collabrators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is Required"],
    },

    likes: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Playlist = model("Playlist", playlistSchema);
export default Playlist;
