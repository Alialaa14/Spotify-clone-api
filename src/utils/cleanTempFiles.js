import fs from "fs/promises";
import Custom_Error from "./Custom_Error.js";
import { StatusCodes } from "http-status-codes";

export const cleanTempFilesAfterUpload = (files) => {
  for (const file of files) {
    try {
      fs.unlink(file.path).catch((e) => {
        console.log(e.message);
        throw new Custom_Error(e.message, StatusCodes.INTERNAL_SERVER_ERROR);
      });
    } catch (e) {
      console.log("File cleanup failed:", e.message);
      throw new Custom_Error(e.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
};
