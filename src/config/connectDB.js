import mongoose from "mongoose";
import { ENV } from "../utils/ENV.js";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(ENV.MONGO_URI);
    console.log(`Connected To Database hosted ${db.connection.host}`);
  } catch (error) {
    console.log("We Couldn't Connect to Db ");
  }
};
