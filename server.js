const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/basicroutes");
const mainRoutes = require("./routes/indexroute");
const adminRoutes = require("./routes/adminroutes");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("trust proxy", true);

// Serve static files
app.use(express.static("public"));

const csrfProtection = csrf({ cookie: true });

// Main routes (public site/pages)
app.use("/", mainRoutes);

// Security routes (e.g. login, register APIs) — NO CSRF
app.use("/security", userRoutes);

// Admin panel (with CSRF for EJS forms)
app.use(
  "/api/admin",
  csrfProtection,
  (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  },
  adminRoutes
);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.message || err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
