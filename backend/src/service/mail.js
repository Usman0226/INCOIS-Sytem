
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_MAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("Server is ready");
  }
});

const mailTo = async (mailText, to,sub) => {
  try {
    const mailContent = {
      from: process.env.NODEMAILER_MAIL,
      to: to,
      subject: sub,
      text: mailText,
    };

    await transporter.sendMail(mailContent);
  } catch (error) {
    console.log("Unable to send the mail ! Please try again later")
    throw error
  }
};

module.exports = mailTo;
