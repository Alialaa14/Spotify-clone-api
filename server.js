import express from "express";
import { ENV } from "./src/utils/ENV.js";
import { connectDB } from "./src/config/connectDB.js";
import userRouter from "./src/routes/user.router.js";
import Custom_Error from "./src/utils/Custom_Error.js";
const app = express();
app.use(express.json());
app.use("/api/v1/auth", userRouter);

app.use((req, res, next) => {
  return next(new Custom_Error("Page Not Found"));
});

app.use((err, req, res, next) => {
  return res
    .status(err.statusCode || 500)
    .json({ message: err.message, stack: err.stack });
});

app.listen(ENV.PORT, () => {
  console.log(`Listening on port ${ENV.PORT}`);
  connectDB();
});
