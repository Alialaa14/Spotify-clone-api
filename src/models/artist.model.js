import { Schema, model } from "mongoose";

const artistSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  bio: {
    type: String,
    default: "",
    trim: true,
  },
  image: {
    type: String,
    default:
      "https://media.istockphoto.com/id/1125877063/photo/mixed-race-woman-singing-and-playing-guitar.jpg?s=1024x1024&w=is&k=20&c=2ocOWVJDeCbEukFKoTEpKqHtb86bPrSxRBj8d7v2uT4=",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  albums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Album",
    },
  ],
  featuredSongs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followersCount: {
    type: Number,
    default: 0,
  },
});

const Artist = model("Artist", artistSchema);

export default Artist;
