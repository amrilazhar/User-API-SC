const express = require("express");
const router = express.Router();

// import for auth needs
const { isAdmin } = require("../middlewares/auth/");
const adminController = require("../controllers/adminController");
const userValidator = require("../middlewares/validators/userValidator");

router.get(
	"/user_list",
	isAdmin,
	adminController.userList
);
router.get(
	"/user_profile",
	isAdmin,
	userValidator.checkUserId,
	adminController.userProfile
);
router.get(
	"/refresh_token_list",
	isAdmin,
	userValidator.checkUserId,
	adminController.refreshTokenList
);
router.post(
	"/register_user",
	isAdmin,
	userValidator.registerUser,
	adminController.registerUser
);
router.delete(
	"/close_account",
	isAdmin,
	userValidator.checkUserId,
	adminController.closeAccount
);

module.exports = router;
