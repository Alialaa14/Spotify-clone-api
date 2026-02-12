import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads");
  },
  filename: function (req, file, cb) {
    const user = req.user;
    const ext = path.extname(file.originalname);
    const filename = `${user}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else if (file.mimetype === "mp3" || file.mimetype === "wav") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});
