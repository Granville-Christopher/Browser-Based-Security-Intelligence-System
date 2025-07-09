const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/adminmodel");
const getGeoLocation = require("../../utils/geoIP");
const reverseGeocode = require("../../utils/reversegeocode");
const { sendBruteForceAlert } = require("../../utils/sendbruteforcealert");
const AdminLoginLog = require("../../models/adminloginlog");

const loginAttempts = new Map();
const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS, 10) || 10;
const BLOCK_TIME = 60 * 60 * 1000;

const adminLoginController = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const emailTrimmed = email?.toLowerCase().trim();

  if (loginAttempts.has(ip)) {
    const attempt = loginAttempts.get(ip);
    if (
      attempt.count >= MAX_ATTEMPTS &&
      Date.now() - attempt.timestamp < BLOCK_TIME
    ) {
      await logLoginAttempt(emailTrimmed, ip, "false", "Blocked by rate limit");
      return res
        .status(429)
        .json({ message: "Too many failed attempts. Try again later." });
    }
  }

  try {
    const matchedAdmin = await Admin.findOne({ email: emailTrimmed });

    if (!matchedAdmin) {
      await logLoginAttempt(emailTrimmed, ip, "false", "Admin not found");
      return res
        .status(401)
        .json({ message: "Admin not found or invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, matchedAdmin.password);
    if (!isMatch) {
      await recordFailedAttempt(ip, emailTrimmed, "Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    loginAttempts.delete(ip);

    if (matchedAdmin.role !== "admin") {
      await logLoginAttempt(emailTrimmed, ip, "false", "Non-admin role");
      return res.status(403).json({ message: "Access denied" });
    }

    const token = jwt.sign(
      {
        id: matchedAdmin._id,
        email: matchedAdmin.email,
        role: matchedAdmin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.cookie("admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000,
    });

    await logLoginAttempt(emailTrimmed, ip, "true", "Login successful");

    return res
      .status(200)
      .json({ message: "Login successful", role: matchedAdmin.role });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function recordFailedAttempt(ip, email, reason) {
  const currentAttempt = loginAttempts.get(ip);

  if (!currentAttempt) {
    loginAttempts.set(ip, { count: 1, timestamp: Date.now() });
  } else {
    loginAttempts.set(ip, {
      count: currentAttempt.count + 1,
      timestamp: Date.now(),
    });
  }

  await logLoginAttempt(email, ip, "fail", reason);

  const updatedAttempt = loginAttempts.get(ip);
  if (updatedAttempt.count === MAX_ATTEMPTS) {
    console.log("📡 MAX ATTEMPTS reached. Sending alert...");
    try {
      const location = await getGeoLocation(ip);
      let address = "Unavailable";

      if (location.latitude && location.longitude) {
        address = await reverseGeocode(location.latitude, location.longitude);
      }

      await sendBruteForceAlert(ip, address);
      console.warn(`🚨 Brute force detected and alert sent from IP: ${ip}`);
    } catch (err) {
      console.error("❌ Failed to send brute-force alert:", err);
    }
  }
}
async function logLoginAttempt(email, ip, success, reason) {
  try {
    const geo = await getGeoLocation(ip);
    let address = "Unknown";
    if (geo.latitude && geo.longitude) {
      address = await reverseGeocode(geo.latitude, geo.longitude);
    }

    await AdminLoginLog.create({
      email,
      ip,
      success,
      reason,
      location: address,
    });
  } catch (err) {
    console.error("❌ Failed to log admin login attempt:", err);
  }
}

module.exports = adminLoginController;
