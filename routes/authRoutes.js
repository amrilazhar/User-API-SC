const express = require("express");
const router = express.Router();

// import for auth needs
const { doAuth } = require("../middlewares/auth/");
const authController = require("../controllers/authController");
const userValidator = require("../middlewares/validators/userValidator");

router.post("/signup", userValidator.signup, doAuth, authController.getToken);
router.post("/login", userValidator.login, doAuth, authController.getToken);

module.exports = router;
