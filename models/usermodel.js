const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accountStatus: {
      type: String,
      enum: ["accessible", "blocked"],
      default: "accessible",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
