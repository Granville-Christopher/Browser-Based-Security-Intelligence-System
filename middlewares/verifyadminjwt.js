const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function verifyAdminJWT(req, res, next) {
  const token = req.cookies.admin_jwt;

  if (!token) {
    console.warn("❌ No token found. Unauthorized access attempt.");
    return res.status(401).render("admin/login", {
      csrfToken: req.csrfToken(),
      error: "You must be logged in to access this page.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid or expired JWT:", err.message);

    const errorMessage =
      err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";

    return res.status(401).render("admin/login", {
      csrfToken: req.csrfToken(),
      error: errorMessage,
    });
  }
}

module.exports = verifyAdminJWT;
