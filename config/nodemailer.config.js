const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 587,
  secure: false, // This enables STARTTLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // sometimes needed for Namecheap servers
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Failed to connect to Private Email SMTP:", error);
  } else {
    console.log("📧 Private Email SMTP connection is ready!");
  }
});

module.exports = transporter;
