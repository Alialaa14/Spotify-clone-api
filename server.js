import express from "express";
import { ENV } from "./src/utils/ENV.js";
import { connectDB } from "./src/config/connectDB.js";
const app = express();
app.use(express.json());

app.listen(ENV.PORT, () => {
  console.log(`Listening on port ${ENV.PORT}`);
  connectDB();
});
