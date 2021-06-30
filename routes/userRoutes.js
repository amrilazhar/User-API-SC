const express = require("express");
const router = express.Router();

// import for auth needs
const { isUser } = require("../middlewares/auth/");
const userController = require("../controllers/userController");
const userValidator = require("../middlewares/validators/userValidator");

router.get("/profile", isUser, userController.myUserProfile);
router.put(
	"/change_profile",
	isUser,
	userValidator.updateUser,
	userController.userUpdate
);
router.put(
	"/change_password",
	isUser,
	userValidator.changePassword,
	userController.changePassword
);
router.delete("/close_account", isUser, userController.deleteAccount);

module.exports = router;
