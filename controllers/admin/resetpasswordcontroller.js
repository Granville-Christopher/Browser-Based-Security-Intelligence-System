const bcrypt = require("bcrypt");
const Admin = require("../../models/adminmodel");
const nodemailer = require("../../config/nodemailer.config");
const getGeoLocation = require("../../utils/geoIP");
const PasswordResetLog = require("../../models/passwordresetlog");
const reverseGeocode = require("../../utils/reversegeocode");


const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isOtpExpired = !admin.otpExpiresAt || admin.otpExpiresAt < Date.now();
    const isOtpInvalid = admin.otp !== otp;

    if (isOtpExpired || isOtpInvalid) {
      admin.otp = null;
      admin.otpExpiresAt = null;
      await admin.save();
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // ✅ Hash and update password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    admin.password = hashedPassword;
    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    // ✅ Extract IP and User Agent
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "Unknown";

    const userAgent = req.headers["user-agent"] || "Unknown";

    // ✅ Get location
    const location = await getGeoLocation(ip);

    // ✅ Send email
    const mailOptions = {
      from: `"Security Team" <${process.env.MAIL_USER}>`,
      to: admin.email,
      subject: "✅ Password Reset Confirmation",
      html: `
        <p>Hello,</p>
        <p>This is to confirm that your password was <strong>successfully reset</strong>.</p>
        <p><strong>If this wasn't you, please contact support immediately.</strong></p>

        <h4>🔍 Security Info:</h4>
        <ul>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Location:</strong> ${location.city}, ${
        location.region
      }, ${location.country}</li>
          <li><strong>ISP:</strong> ${location.isp}</li>
          <li><strong>Device / Browser:</strong> ${userAgent}</li>
          ${
            location.latitude && location.longitude
              ? `<li><strong>Map:</strong> <a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank">View on Map</a></li>`
              : ""
          }
        </ul>

        <p>– AI Security Command Center</p>
      `,
    };

    try {
      await nodemailer.sendMail(mailOptions);
      console.log("📧 Reset confirmation email sent.");
    } catch (err) {
      console.error("❌ Email send error:", err.message);
    }

    await PasswordResetLog.create({
      email: admin.email,
      ip,
      location: {
        city: location.city,
        region: location.region,
        country: location.country,
        isp: location.isp,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      userAgent,
    });

    console.log("🔒 Password reset log created.");

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = resetPasswordController;
