const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../models");
const userService = require("../helpers/refreshTokenHelper");

class AuthController {
	async getAccessToken(req, res, next) {
		try {
			const body = {
				id: req.user._id,
				role: req.user.role,
				email: req.user.email,
			};
			const token = jwt.sign(
				{
					user: body,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" },
				{ algorithm: "RS256" }
			);
			return res.status(200).json({
				message: "success",
				accesstoken: token,
			});
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	async refreshToken(req, res, next) {
		try {
			if (!req.cookies.refreshToken || !req.ip) {
				const err = new Error("Cookie not provided ");
				err.statusCode = 400;
				throw err;
			}

			const token = req.cookies.refreshToken;
			const ipAddress = req.ip;
			let newToken = await userService.refreshToken({ token, ipAddress });

			setTokenCookie(res, newToken.refreshToken);
			res.status(200).json(newToken.user);
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	revokeToken(req, res, next) {
		try {			
			// accept token from request body or cookie
			const token = req.body.token || req.cookies.refreshToken;
			const ipAddress = req.ip;

			if (!token) {
				const err = new Error("Token Required");
				err.statusCode = 400;
				throw err;
			};

			// users can revoke their own tokens and admins can revoke any tokens
			if (!req.user.ownsToken(token) && req.user.role !== "admin") {
				return res.status(401).json({ message: "Unauthorized" });
			}

			let revoke = await userService.revokeToken({ token, ipAddress });

			if (revoke) {
				return res.json({ message: "Token revoked" })
			}

		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	setTokenCookie(res, token) {
		// create http only cookie with refresh token that expires in 7 days
		const cookieOptions = {
			httpOnly: true,
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		};
		res.cookie("refreshToken", token, cookieOptions);
	}
}

module.exports = new AuthController();
