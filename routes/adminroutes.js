const { signupValidationRules, adminSignupController } = require('../controllers/admin/admincontroller')
const adminLoginController  = require('../controllers/admin/adminlogincontroller.')
const router = require("express").Router();

router.get("/admin", (req, res) => {
  return res.status(200).render("admin/admin", {
    title: "Admin Dashboard",
    message: "Welcome to the Admin Dashboard",
  });
});

router.get('/login', (req, res) => {
  return res.status(200).render("admin/login", {
    title: "Admin - Login",
    message: "Admin login"
  })
})
router.get('/signup', (req, res) => {
  return res.status(200).render("admin/signup", {
    title: "Admin - Signup",
    message: "Admin signup"
  })
})

router.post('/signup', signupValidationRules, adminSignupController);
router.post('/login', adminLoginController)


module.exports = router;