const express = require("express");
const router = express.Router();

// import for auth needs
const { isUser } = require("../middlewares/auth/");
const userController = require("../controllers/userController");
const userValidator = require("../middlewares/validators/userValidator");

router.get("/profile", isUser, userController.myUserProfile);
router.put("/change_profile", userValidator.updateUser, isUser, userController.userUpdate);
router.put("/change_password", userValidator.changePassword, isUser, userController.changePassword);
router.delete("/close_account", isUser, userController.deleteAccount);

module.exports = router;