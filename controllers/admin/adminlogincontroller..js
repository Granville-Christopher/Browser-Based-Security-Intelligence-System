const bcrypt = require("bcrypt");
const Admin = require("../../models/adminmodel");
const { sendBruteForceAlert } = require("../../utils/sendbruteforcealert");
const loginAttempts = new Map();

const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS, 10) || 10;
const BLOCK_TIME = 60 * 60 * 1000;

const adminLoginController = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  if (loginAttempts.has(ip)) {
    const attempt = loginAttempts.get(ip);
    if (
      attempt.count >= MAX_ATTEMPTS &&
      Date.now() - attempt.timestamp < BLOCK_TIME
    ) {
      return res
        .status(429)
        .json({ message: "Too many failed attempts. Try again later." });
    }
  }

  try {
    const matchedAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!matchedAdmin) {
      recordFailedAttempt(ip);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, matchedAdmin.password);
    if (!isMatch) {
      recordFailedAttempt(ip);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    loginAttempts.delete(ip);

    if (matchedAdmin.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    return res
      .status(200)
      .json({ message: "Login successful", role: matchedAdmin.role });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function recordFailedAttempt(ip) {
  const currentAttempt = loginAttempts.get(ip);

  if (!currentAttempt) {
    loginAttempts.set(ip, { count: 1, timestamp: Date.now() });
  } else {
    const updatedAttempt = {
      count: currentAttempt.count + 1,
      timestamp: Date.now(),
    };
    loginAttempts.set(ip, updatedAttempt);

    if (updatedAttempt.count === MAX_ATTEMPTS) {
      console.log("📡 MAX ATTEMPTS reached. Sending alert...");
      try {
        await sendBruteForceAlert(ip);
        console.warn(`🚨 Brute force detected and alert sent from IP: ${ip}`);
      } catch (err) {
        console.error("❌ Failed to send brute-force alert:", err);
      }
    }
  }
}
module.exports = adminLoginController;
