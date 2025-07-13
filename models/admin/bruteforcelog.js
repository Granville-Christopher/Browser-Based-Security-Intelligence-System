const mongoose = require("mongoose");

const BruteForceLogSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  countryCode: String,
  isp: String,
  ispLogo: String,
  latitude: Number,
  longitude: Number,
  mapLink: String,
  address: String,
  attemptedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BruteForceLog", BruteForceLogSchema);
