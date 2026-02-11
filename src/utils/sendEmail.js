import transporter from "./nodemailer.js";
import { ENV } from "../utils/ENV.js";
import Custom_Error from "./Custom_Error.js";
import { StatusCodes } from "http-status-codes";

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: ENV.GMAIL_EMAIL,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.log("We Couldn't Send Email");
    return new Custom_Error(
      "We Couldn't Send Email",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
