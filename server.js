import express from "express";
import { ENV } from "./src/utils/ENV.js";
import { connectDB } from "./src/config/connectDB.js";
import userRouter from "./src/routes/user.router.js";
import artistRouter from "./src/routes/artist.router.js";
import albumRouter from "./src/routes/album.router.js";
import songRouter from "./src/routes/song.router.js";
import playlistRouter from "./src/routes/playlist.router.js";
import Custom_Error from "./src/utils/Custom_Error.js";
import { removeTempFiles } from "./src/middlewares/removeTempFiles.js";
const app = express();
app.use(express.json());
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/artist", artistRouter);
app.use("/api/v1/album", albumRouter);
app.use("/api/v1/song", songRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use((req, res, next) => {
  return next(new Custom_Error("Page Not Found", 404));
});

app.use(removeTempFiles);
app.use((err, req, res, next) => {
  return res
    .status(err.statusCode || 500)
    .json({ message: err.message, stack: err.stack });
});

app.listen(ENV.PORT, () => {
  console.log(`Listening on port ${ENV.PORT}`);
  connectDB();
});
