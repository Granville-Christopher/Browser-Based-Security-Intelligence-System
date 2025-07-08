const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const Admin = require("../../models/adminmodel");

const signupValidationRules = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .escape(),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must include at least one number")
    .matches(/[.!@#$%^&*]/)
    .withMessage(
      "Password must include at least one special character (., !, @, #, $, %, ^, &, *)"
    )
    .customSanitizer((value) => value.replace(/[^a-zA-Z0-9.!@#$%^&*]/g, ""))
    .escape(),
];

const adminSignupController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      message: "Validation failed",
      errors: extractedErrors,
    });
  }

  try {
    const { email, password } = req.body;

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
    });
    
    await admin.save();

    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signupValidationRules,
  adminSignupController,
};
