const mongoose = require("mongoose");

const BruteForceLogSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  isp: String,
  latitude: Number,
  longitude: Number,
  mapLink: String,
  attemptedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BruteForceLog", BruteForceLogSchema);
