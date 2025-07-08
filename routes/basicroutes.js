const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect("/security/dashboard");
});

router.get("/dashboard", (req, res) => {
  return res.status(200).render("user/dashboard", {
    title: "Security Dashboard",
    message: "Welcome to the Security Dashboard",
  });
});

router.get("/login", (req, res) => {
  return res.status(200).render("user/login", {
    title: "Login",
    message: "Please log in to access your account",
  });
});

// router.post('/api/login', login)

module.exports = router;
