const mongoose = require("mongoose");

const adminLoginLogSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    success: { type: Boolean, required: true },
    ip: { type: String },
    userAgent: { type: String },
    location: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLoginLog", adminLoginLogSchema);
