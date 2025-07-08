const {
  signupValidationRules,
  adminSignupController,
} = require("../controllers/admin/admincontroller");
const adminLoginController = require("../controllers/admin/adminlogincontroller.");
const getGeoLocation = require("../utils/geoIP");
const reverseGeocode = require("../utils/reversegeocode");
const router = require("express").Router();
const getOtpController = require("../controllers/admin/getotpcontroller");
const resetPasswordController = require("../controllers/admin/resetpasswordcontroller");
const bruteforceAttackLogs = require("../models/bruteforcelog");
const PasswordResetLog = require("../models/passwordresetlog");

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

router.get("/resetpassword", (req, res) => {
  return res.status(200).render("admin/resetpassword", {
    title: "Admin - Signup",
    message: "Admin signup",
  });
});

router.get("/passwordresetlogs", async (req, res) => {
  try {
    const logs = await PasswordResetLog.find()
      .sort({ createdAt: -1 })
      .limit(100);
    if (!logs || logs.length === 0) {
      return res.status(404).render("admin/password-reset-logs", {
        title: "Admin - Password Reset Logs",
        message: "No password reset logs found.",
      });
    }

    return res.status(200).render("admin/password-reset-logs", {
      title: "Admin - Password Reset Logs",
      message: "Admin Password Reset Logs",
      logs,
    });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    return res.status(500).render("admin/password-reset-logs", {
      title: "Admin - Password Reset Logs",
      message: "Something went wrong.",
      logs: [],
    });
  }
});

router.get("/bruteforceattacklogs", async (req, res) => {
  try {
    const logs = await bruteforceAttackLogs
      .find()
      .sort({ createdAt: -1 })
      .limit(100);
    if (!logs || logs.length === 0) {
      return res.status(404).render("admin/bruteforce-logs", {
        title: "Admin - Brute Force Attack Logs",
        message: "No brute force attack logs found.",
        logs: [],
      });
    }
    return res.status(200).render("admin/bruteforce-logs", {
      title: "Admin - Brute Force Attack Logs",
      message: "Admin Brute Force Attack Logs",
      logs,
    });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    return res.status(500).render("admin/bruteforce-logs", {
      title: "Admin - Brute Force Attack Logs",
      message: "Something went wrong.",
      logs: [],
    });
  }
});

router.get("/authenticateuser", (req, res) => {
  return res.status(200).render("admin/authenticate-user", {
    title: "Admin - Authenticate User",
    message: "Admin Authenticate User",
  });
});
router.get("/userlogs", (req, res) => {
  return res.status(200).render("admin/user-logs", {
    title: "Admin - User Logs",
    message: "Admin User Logs",
  });
});
router.get("/settings", (req, res) => {
  return res.status(200).render("admin/settings", {
    title: "Admin - Settings",
    message: "Admin Settings",
  });
});

router.post("/signup", signupValidationRules, adminSignupController);
router.post("/login", adminLoginController);
router.post("/get-otp", getOtpController);
router.post("/resetpassword", resetPasswordController);

module.exports = router;
