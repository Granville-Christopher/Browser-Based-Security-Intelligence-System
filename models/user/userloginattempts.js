const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  userId: { type: String },
  ip: { type: String },
  status: {
    type: String,
    enum: ["success", "invalid_credentials", "incorrect_pin", "blocked", "error"],
    required: true,
  },
  message: String,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
