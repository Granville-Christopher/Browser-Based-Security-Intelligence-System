const Admin = require("../../models/admin/adminmodel");
const crypto = require("crypto");
const nodemailer = require("../../config/nodemailer.config");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;
  
    await Admin.updateMany({ otp }, { $unset: { otp: "", otpExpiresAt: "" } });

    admin.otp = otp;
    admin.otpExpiresAt = otpExpiresAt;
    await admin.save();

    // Send OTP via email
    const mailOptions = {
      from: `"Security Center" <${process.env.MAIL_USER}>`,
      to: admin.email,
      subject: "Your OTP Code for Password Reset",
      html: `
        <p>Hello,</p>
        <p>Your OTP for password reset is:</p>
        <h2 style="color: #10b981;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you!</p>
      `,
    };

    await nodemailer.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("OTP generation error:", err);
    return res.status(500).json({ message: "Failed to send OTP." });
  }
};

module.exports = getOtpController;
