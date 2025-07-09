const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const User = require("../../models/usermodel");

const createUserValidationRules = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("User ID is required.")
    .isLength({ min: 4 })
    .withMessage("User ID must be at least 4 characters.")
    .escape(),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage("PIN is required.")
    .isLength({ min: 4 })
    .withMessage("PIN must be at least 4 digits.")
    .escape(),
];

const createUserController = async (req, res) => {
  try {
    // ✅ Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg });
    }

    // ✅ Sanitize inputs
    const userId = sanitizeHtml(req.body.userId);
    const pin = sanitizeHtml(req.body.pin);

    // ✅ Check if user exists
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    // ✅ Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // ✅ Create and save user
    const newUser = new User({
      userId,
      pin: hashedPin,
      role: "user", // explicitly set for clarity
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("User creation error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ✅ Export both the controller and its validation rules
module.exports = {
  createUserController,
  createUserValidationRules,
};
