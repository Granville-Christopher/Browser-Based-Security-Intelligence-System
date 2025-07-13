const nodemailer = require("../config/nodemailer.config");
const getGeoLocation = require("./geoIP");
const BruteForceLog = require("../models/admin/bruteforcelog");
const dotenv = require("dotenv");
dotenv.config();

const sendBruteForceAlert = async (ipAddress, address = "Unavailable") => {
  const timestamp = new Date();
  const location = await getGeoLocation(ipAddress);

  const mailOptions = {
    from: `"Security Alert" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: "🚨 Brute Force Attempt Detected",
    html: `
      <p><strong>🛡️ Brute Force Attempt Detected</strong></p>
      <ul>
        <li><strong>IP Address:</strong> ${ipAddress}</li>
        <li><strong>Location:</strong> ${location.city || "Unknown"}, ${
      location.region || "Unknown"
    }, ${location.country || "Unknown"}</li>
        <li><strong>ISP:</strong> ${location.isp || "Unknown"}</li>
        <li><strong>Coordinates:</strong> ${location.latitude || "N/A"}, ${
      location.longitude || "N/A"
    }</li>
        <li><strong>Physical Address:</strong> ${address}</li>
        <li><strong>Map:</strong> ${
          location.mapLink
            ? `<a href="${location.mapLink}" target="_blank">View on Google Maps</a>`
            : "Unavailable"
        }</li>
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
      countryCode: location.countryCode,
      isp: location.isp,
      ispLogo: location.ispLogo,
      latitude: location.latitude,
      longitude: location.longitude,
      mapLink: location.mapLink,
      address: address,
      attemptedAt: timestamp,
    });

    console.log("🗃️ Alert logged to database");
  } catch (error) {
    console.error("❌ Failed to send email or log alert:", error);
  }
};

module.exports = { sendBruteForceAlert };
