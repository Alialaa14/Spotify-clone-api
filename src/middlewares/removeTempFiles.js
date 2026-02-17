import fs from "fs/promises";

// It USES AS GLOBAL ERROR MiDDLEWARE TO CLEAN UP TEMP FILES

export const removeTempFiles = async (err, req, res, next) => {
  try {
    let files = [];

    if (req.file) {
      files.push(req.file);
    }

    if (req.files && typeof req.files === "object") {
      files = files.concat(Object.values(req.files).flat());
    }

    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        console.log("File cleanup failed:", e.message);
      }
    }
  } catch (cleanupError) {
    console.log("Cleanup middleware error:", cleanupError.message);
  }

  next(err);
};
