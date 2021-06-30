const express = require("express");
const router = express.Router();

// import for auth needs
const { doAuth, isUser } = require("../middlewares/auth/");
const authController = require("../controllers/authController");
const userValidator = require("../middlewares/validators/userValidator");

router.post("/signup", userValidator.signup, doAuth, authController.getAccessToken);
router.post("/login", userValidator.login, doAuth, authController.getAccessToken);
router.post("/refresh_token", isUser, authController.refreshToken);
router.post("/revoke_token", isUser, authController.revokeToken);

module.exports = router;
