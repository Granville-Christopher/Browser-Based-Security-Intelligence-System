const nodemailer = require("../config/nodemailer.config");
const getGeoLocation = require("./geoIP");
const BruteForceLog = require("../models/bruteforcelog");
const dotenv = require("dotenv");
dotenv.config();

const sendBruteForceAlert = async (ipAddress) => {
  const timestamp = new Date();
  const location = await getGeoLocation(ipAddress);

  const mailOptions = {
    from: `"Security Alert" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: "🚨 Brute Force Attempt Detected",
    html: `
      <p><strong>🛡️ Brute Force Detected</strong></p>
      <ul>
        <li><strong>IP Address:</strong> ${ipAddress}</li>
        <li><strong>Location:</strong> ${location.city}, ${location.region}, ${location.country}</li>
        <li><strong>ISP:</strong> ${location.isp}</li>
        <li><strong>Time:</strong> ${timestamp.toLocaleString()}</li>
      </ul>
    `,
  };

  try {
    await nodemailer.sendMail(mailOptions);
    console.log("✅ Brute-force alert email sent");

    // Save to DB
    await BruteForceLog.create({
      ip: ipAddress,
      city: location.city,
      region: location.region,
      country: location.country,
      isp: location.isp,
      attemptedAt: timestamp,
    });
    console.log("🗃️ Alert logged to database");
  } catch (error) {
    console.error("❌ Failed to send email or log alert:", error);
  }
};

module.exports = { sendBruteForceAlert };
