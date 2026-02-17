import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  Otp: {
    type: String,
    default: "",
  },
  picture: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  likedSongs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  likedAlbums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Album",
    },
  ],
  followedArtists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },
  ],
  likedPlaylists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  playlists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

export default User;
