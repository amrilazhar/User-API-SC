const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, RefreshToken, isValidId } = require("../models");

module.exports = {
	refreshToken,
	revokeToken,
	getRefreshTokens,
    generateRefreshToken,
};

async function refreshToken({ token, ipAddress }) {
	const refreshToken = await getRefreshToken(token);
	const { user } = refreshToken;

	// replace old refresh token with a new one and save
	const newRefreshToken = generateRefreshToken(user, ipAddress);
	refreshToken.revoked = Date.now();
	refreshToken.revokedByIp = ipAddress;
	refreshToken.replacedByToken = newRefreshToken.token;
	await refreshToken.save();
	await newRefreshToken.save();

	// generate new jwt
	const jwtToken = generateJwtToken(user);

	// return basic details and tokens
	return {
		...basicDetails(user),
		accessToken: jwtToken,
		refreshToken: newRefreshToken.token,
	};
}

async function revokeToken({ token, ipAddress }) {
	const refreshToken = await getRefreshToken(token);

	// revoke token and save
	refreshToken.revoked = Date.now();
	refreshToken.revokedByIp = ipAddress;
	await refreshToken.save();
}

async function getRefreshTokens(userId) {
	// check that user exists
	await getUser(userId);

	// return refresh tokens for user
	const refreshTokens = await RefreshToken.find({ user: userId });
	return refreshTokens;
}

// // helper functions

async function getUser(id) {
	if (!isValidId(id)) {
		const err = new Error("User not found");
		err.statusCode = 400;
		throw err;
	}
	const user = await User.findById(id);

	if (!user) {
		const err = new Error("User not found");
		err.statusCode = 400;
		throw err;
	}
	return user;
}

async function getRefreshToken(token) {
	const refreshToken = await RefreshToken.findOne({ token }).populate("user");
	if (!refreshToken || !refreshToken.isActive) {
		const err = new Error("Invalid Token");
		err.statusCode = 400;
		throw err;
	}
	return refreshToken;
}

function generateRefreshToken(user, ipAddress) {
	// create a refresh token that expires in 7 days
	return new RefreshToken({
		user: user.id,
		token: randomTokenString(),
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		createdByIp: ipAddress,
	});
}

function randomTokenString() {
	return crypto.randomBytes(39).toString("hex");
}

function basicDetails(user) {
	const { id, email, username, role, address } = user;
	return { id, email, username, role, address };
}

function generateJwtToken(user) {
	// create a jwt token containing the user id that expires in 15 minutes
	return jwt.sign(
		{
			role: user.role,
			id: user.id,
			email: user.email,
			username: user.username,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "15m" }
	);
}
