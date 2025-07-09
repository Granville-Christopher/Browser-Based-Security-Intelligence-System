require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/basicroutes");
const mainRoutes = require("./routes/indexroute");
const adminRoutes = require("./routes/adminroutes");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const morgan = require("morgan");


const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Logging detailed logs in development
if (isDevelopment) {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"));
  console.log("📦 Production logging enabled (combined format)");
}

// EJS view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("trust proxy", true);

// Serve static files
app.use(express.static("public"));

// CSRF Protection (cookie-based)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  },
});

// Main routes (public site/pages)
app.use("/", mainRoutes);

// Security routes
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
  console.error("❌ Error occurred:", err.message || err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("JWT_SECRET from .env:", process.env.JWT_SECRET);
  console.log(
    
    `🚀 Server is running on port ${PORT} (${
      process.env.NODE_ENV || "development"
    })`
  );
});
