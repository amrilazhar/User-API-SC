const { body, check } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../../models/users");

const isValidObjectId = async (value, { req }) => {
	const isValidObjectId = mongoose.isValidObjectId(value);
	if (!isValidObjectId) {
		return Promise.reject("User ID is not valid");
	}
	return true;
};

const objectId = (value) => {
	if (value) {
		return mongoose.Types.ObjectId(value);
	}
};

const userExistsByUsername = async (value, { req }) => {
	const user = await User.exists({ username: value });

	if (!user) {
		return Promise.reject("This username has been registered");
	}

	return true;
};

const userExistsByEmail = async (value, { req }) => {
	if (!value) {
		return true;
	}

	const email = await Promise.all([
		User.exists({ email: req.body.email }),
		User.exists({
			newEmail: req.body.email,
			emailExpiration: { $gt: Date.now() },
		}),
	]);

	if (email[0] || email[1]) {
		return Promise.reject("This e-mail is already registered");
	}

	return true;
};

const comparePassword = async (value, { req }) => {
	if (req.body.password !== value) {
		return Promise.reject("Passwords not match");
	}
	return true;
};

const passwordMatch = async (value, { req }) => {
	const oldData = await User.findById(req.user.id);
	const validate = await bcrypt.compare(value, oldData.password);
	if (!validate) {
		return Promise.reject("Old Passwords not match");
	}
	return true;
};

exports.signup = [
	body("username").trim().notEmpty().custom(userExistsByUsername),
	body("email").isEmail().custom(userExistsByEmail).normalizeEmail(),
	body("password").trim().isLength({ min: 6 }),
	body("confirm_password").custom(comparePassword),
];

exports.registerUser = [
	body("username").trim().notEmpty().custom(userExistsByUsername),
	body("email").isEmail().custom(userExistsByEmail).normalizeEmail(),
];

exports.login = [
	body("username").trim(),
	body("password").trim().isLength({ min: 6 }),
];

exports.checkUserId = [
	check("user_id").custom(isValidObjectId).bail().customSanitizer(objectId),
];

exports.updateUser = [
	body("email")
		.isEmail()
		.custom(userExistsByEmail)
		.bail()
		.normalizeEmail()
		.optional({ nullable: true }),
	body("address").trim().optional({ nullable: true }),
	body("username").trim().notEmpty().optional({ nullable: true }),
];

exports.changePassword = [
	body("old_password").trim().isLength({ min: 6 }).custom(passwordMatch),
	body("password").trim().isLength({ min: 6 }),
	body("confirm_password").custom(comparePassword),
];
