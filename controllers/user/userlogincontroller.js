const User = require("../../models/user/usermodel");
const LoginAttempt = require("../../models/user/userloginattempts");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const sanitize = require("sanitize-html");

const loginAttemptsMemory = new Map();

const saveLoginAttempt = async ({ userId, ip, status, message }) => {
  try {
    await LoginAttempt.create({
      userId,
      ip,
      status,
      message,
    });
  } catch (err) {
    console.error("Failed to log attempt:", err.message);
  }
};

exports.loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

exports.loginUser = [
  body("userId").trim().escape(),
  body("pin").trim().isLength({ min: 8 }).escape(),

  async (req, res) => {
    const errors = validationResult(req);
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userId = sanitize(req.body.userId);
    const pin = sanitize(req.body.pin);

    if (!errors.isEmpty()) {
      await saveLoginAttempt({
        userId,
        ip,
        status: "invalid_credentials",
        message: "Validation error or malformed input",
      });
      return res.status(400).json({ message: "Invalid input." });
    }

    const attempts = loginAttemptsMemory.get(userId) || {
      count: 0,
      locked: false,
    };

    try {
      const user = await User.findOne({ userId });

      if (!user) {
        await saveLoginAttempt({
          userId,
          ip,
          status: "invalid_credentials",
          message: "User not found",
        });
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // 🔒 If user is blocked in DB
      if (user.accountStatus === "blocked") {
        await saveLoginAttempt({
          userId,
          ip,
          status: "blocked",
          message: "Account is blocked in database",
        });
        return res
          .status(403)
          .json({ message: "Account is blocked. Contact admin." });
      }

      const isMatch = await bcrypt.compare(pin, user.pin);

      if (!isMatch) {
        attempts.count += 1;

        let message = `Invalid PIN. ${5 - attempts.count} tries left.`;
        let status = "incorrect_pin";

        if (attempts.count >= 5) {
          attempts.locked = true;
          status = "blocked";
          message = "Account blocked. Contact admin.";

          // 🔐 Persist lock in DB
          user.accountStatus = "blocked";
          await user.save();
        }

        loginAttemptsMemory.set(userId, attempts);

        await saveLoginAttempt({ userId, ip, status, message });
        return res.status(status === "blocked" ? 403 : 401).json({ message });
      }

      // ✅ Successful login
      loginAttemptsMemory.delete(userId);

      await saveLoginAttempt({
        userId,
        ip,
        status: "success",
        message: "Login successful",
      });

      return res.status(200).json({ message: "ACCESS GRANTED!" });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error." });
    }
  },
];
