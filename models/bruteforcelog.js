const mongoose = require("mongoose");

const BruteForceLogSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  isp: String,
  attemptedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BruteForceLog", BruteForceLogSchema);
