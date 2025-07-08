const mongoose = require("mongoose");

const PasswordResetLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  ip: { type: String, default: "Unknown" },
  location: {
    city: { type: String, default: "Unknown" },
    region: { type: String, default: "Unknown" },
    country: { type: String, default: "Unknown" },
    isp: { type: String, default: "Unknown" },
    latitude: { type: String, default: "N/A" },
    longitude: { type: String, default: "N/A" },
  },
  userAgent: { type: String, default: "Unknown" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PasswordResetLog", PasswordResetLogSchema);
