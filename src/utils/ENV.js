import { config } from "dotenv";

config();

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  GMAIL_EMAIL: process.env.GMAIL_EMAIL,
  GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
};
