import mongoose from "mongoose";
import { ENV } from "../utils/ENV.js";
import Custom_Error from "../utils/Custom_Error.js";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(ENV.MONGO_URI);
    console.log(`Connected To Database hosted ${db.connection.host}`);
  } catch (error) {
    console.log("We Couldn't Connect to Db ");
    return new Custom_Error("We Couldn't Connect to Db", 500);
  }
};
