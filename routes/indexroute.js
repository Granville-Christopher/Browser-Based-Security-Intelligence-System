const router = require('express').Router();

// Root route
router.get("/", (req, res) => {
  return res.status(200).render("user/index", {
    title: "Home",
    message: "Welcome to the Home Page",
  });
});

module.exports = router;