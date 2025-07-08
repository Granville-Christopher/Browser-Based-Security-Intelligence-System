const {
  signupValidationRules,
  adminSignupController,
} = require("../controllers/admin/admincontroller");
const adminLoginController = require("../controllers/admin/adminlogincontroller.");
const getGeoLocation = require("../utils/geoIP");
const reverseGeocode = require("../utils/reversegeocode");
const router = require("express").Router();

// IP extraction utility
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress
  );
};

// ✅ GEO LOCATION ROUTE
router.get("/geo", async (req, res) => {
  const ip = getClientIp(req);
  const geo = await getGeoLocation(ip);

  let address = "Unknown location";

  if (geo.latitude && geo.longitude) {
    address = await reverseGeocode(geo.latitude, geo.longitude);
  }

  res.json({
    ip,
    geo,
    address,
  });
});

// Other admin routes
router.get("/admin", (req, res) => {
  return res.status(200).render("admin/admin", {
    title: "Admin Dashboard",
    message: "Welcome to the Admin Dashboard",
  });
});

router.get("/login", (req, res) => {
  return res.status(200).render("admin/login", {
    title: "Admin - Login",
    message: "Admin login",
  });
});

router.get("/signup", (req, res) => {
  return res.status(200).render("admin/signup", {
    title: "Admin - Signup",
    message: "Admin signup",
  });
});

router.post("/signup", signupValidationRules, adminSignupController);
router.post("/login", adminLoginController);

module.exports = router;
