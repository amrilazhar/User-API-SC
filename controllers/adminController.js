const { User } = require("../models");
const userService = require("../helpers/refreshTokenHelper");
const validationErrorHandler = require("../helpers/validationErrorHandler");
class AdminController {
	async userProfile(req, res, next) {
		try {
            validationErrorHandler(req, res, next);
			let user = await User.find({ _id: req.query.user_id, deleted : false });
			if (!user) {
				const err = new Error("User Not Found!");
				err.statusCode = 400;
				throw err;
			}

            return res.status(200).json({message :'success', data : user});
		} catch (error) {
            if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
        }
	}

	async userList(req, res, next) {
        try {
         
            let users = await User.find({deleted : false}).exec();
			if (users.length) {
				const err = new Error("No User Registered !");
				err.statusCode = 400;
				throw err;
			}

            return res.status(200).json({message :'success', data : users});

        } catch (error) {
            if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
        }
    }

	async registerUser(req, res, next) {
        try {
            validationErrorHandler(req, res, next);
            let data = {
                username : req.body.username,
                email :req.body.email,
                address : req.body.address,
            }
            let userRegis = await User.create(data);
            if(!userRegis) {
                const err = new Error("Something went wrong!");
				err.statusCode = 400;
				throw err;
            }

            return res.status(200).json({message :'success', data : userRegis});
        } catch (error) {
            if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
        }
    }
	async refreshTokenList(req, res, next) {
        try {
            validationErrorHandler(req, res, next);
            let listToken =  userService.getRefreshTokens(req.query.user_id);
            if (listToken.length > 0 ){
                return res.status(200).json({message :'success', data : listToken});
            } else {
                const err = new Error("No Refresh Token generated");
				err.statusCode = 400;
				throw err;
            }
        } catch (error) {
            if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
        }
    }
	async closeAccount(req, res, next) {
        try {
            validationErrorHandler(req, res, next);
            let deleteUser = await User.deleteOne({_id : req.body.user_id})
            if (!deleteUser){
                const err = new Error("Delete fail");
				err.statusCode = 400;
				throw err;
            }
            
            return res.status(200).json({message :'success', data : "user account deleted"});

        } catch (error) {
            if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
        }
    }
}

module.exports = new AdminController();
