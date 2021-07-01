const { User } = require("../models");
const validationErrorHandler = require("../helpers/validationErrorHandler");
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
			
			validationErrorHandler(req, res, next);
	
			// recreate body data base on what input is filled
			let data = {};
			if (req.body.email) data.email = req.body.email;
			if (req.body.username) data.username = req.body.username;
			if (req.body.address) data.address = req.body.address;

			// if there is no data filled at all, return error
			if (Object.keys(data).length == 0) {
				const error = new Error("Please fill at least one data to be changed");
				error.statusCode = 400;
				throw error;
			}

			let dataUser = await User.findOneAndUpdate(
				{ _id: req.user.id },
				data,
				{ new: true }
			);
			// If success
			if (!dataUser) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}

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

	//change password user
	async changePassword(req, res, next) {
		try {
			validationErrorHandler(req, res, next);
			let dataUser = await User.findOneAndUpdate(
				{ _id: req.user.id },
				req.body,
				{ new: true }
			);
			// If success
			if (!dataUser) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}
			
			return res.status(200).json({ message: "success", data: "password changed" });
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	async deleteAccount(req,res,next){
		try {			
			let userDelete = await User.delete({_id : req.user.id})
			// If success
			if (!userDelete) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}			
			return res.status(200).json({ message: "Your Account Successfully Closed" });
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

}

module.exports = new UserController();
