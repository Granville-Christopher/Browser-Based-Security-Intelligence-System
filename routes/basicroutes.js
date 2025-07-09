const router = require("express").Router();
const express = require("express");

const {
  loginUser,
  loginRateLimiter,
} = require("../controllers/user/userlogincontroller");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

router.get("/", (req, res) => {
  res.redirect("/security/dashboard");
});

router.get("/dashboard", (req, res) => {
  return res.status(200).render("user/dashboard", {
    title: "Security Dashboard",
    message: "Welcome to the Security Dashboard",
  });
});

router.get("/login", csrfProtection, (req, res) => {
  res.render("user/login", {
    title: "Login",
    message: "Please log in to access your account",
    csrfToken: req.csrfToken(),
  });
});

router.post("/login", loginRateLimiter, loginUser);

module.exports = router;
