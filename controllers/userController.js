const { User } = require("../models");

class UserController {
	// View data user
	async myUserProfile(req, res, next) {
		try {
			let dataUser = await User.findOne({ _id: req.user.id });
			return res.status(200).json({ message: "success", data: dataUser });
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	// Update data user
	async userUpdate(req, res, next) {
		try {
			// Update data
			if (req.user.id != req.params.id) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}
			let dataUser = await User.findOneAndUpdate(
				{ _id: req.params.id },
				req.body,
				{ new: true }
			);
			// If success
			if (!dataUser) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

}

module.exports = new UserController();
