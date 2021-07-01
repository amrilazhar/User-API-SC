const passport = require("passport"); // Import passport
const localStrategy = require("passport-local").Strategy; // Import Strategy
const { User } = require("../../models");

const bcrypt = require("bcrypt"); // Import bcrypt
const JWTstrategy = require("passport-jwt").Strategy; // Import JWT Strategy
const ExtractJWT = require("passport-jwt").ExtractJwt; // Import ExtractJWT
const validationErrorHandler = require("../../helpers/validationErrorHandler");

passport.use(
	"signup",
	new localStrategy(
		{
			usernameField: "username", // field for username from req.body.username
			passwordField: "password", // field for password from req.body.password
			passReqToCallback: true, // read other requests
		},
		async (req, username, password, done) => {
			try {
				//set default role to user
				req.body.role = "user";
				let userSignUp = await User.create(req.body);
				// If success
				return done(null, userSignUp, {
					message: "User can be created",
				});
			} catch (error) {
				console.log(error);
				// If error, it will return not authorization
				if (error.code == 11000 && error.keyPattern.username == 1) {
					return done(null, false, {
						message: "Username has been taken",
					});
				}
				if (error.code == 11000 && error.keyPattern.email == 1) {
					return done(null, false, {
						message: "Please use another email",
					});
				} else {
					return done(null, false, {
						message: "User can't be created",
					});
				}
			}
		}
	)
);

passport.use(
	"login",
	new localStrategy(
		{
			usernameField: "username", // field for username from req.body.username
			passwordField: "password", // field for password from req.body.password
			passReqToCallback: true, // read other requests
		},
		async (req, username, password, done) => {
			try {
				const userSignin = await User.findOne({
					username,
				});

				// cek if there is user or user is not deleted
				if (!userSignin || userSignin.deleted) {
					return done(null, false, {
						message: "User is not found!",
					});
				}

				const validate = await bcrypt.compare(password, userSignin.password);

				if (!validate) {
					return done(null, false, {
						message: "Wrong password!",
					});
				}
				return done(null, userSignin, {
					message: "Login success!",
				});
			} catch (error) {
				console.log(error);
				// If error, it will return not authorization
				return done(error, false, {
					message: "Cannot authenticate user",
				});
			}
		}
	)
);

passport.use(
	"user",
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
		},
		async (token, done) => {
			try {
				const userSignin = await User.findOne({
					_id: token.user.id,
				});

				if (!userSignin.role) {
					return done(null, false, { message: "you are not Authorized" });
				}

				if (userSignin.role.includes("user") || userSignin.role.includes("admin")) {
					return done(null, token.user);
				}

				return done(null, false, { message: "you are not Authorized" });
			} catch (error) {
				console.log(error);
				return done(error, false, {
					message: "Cannot authenticate user",
				});
			}
		}
	)
);

passport.use(
	"admin",
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
		},
		async (token, done) => {
			try {
				const userSignin = await User.findOne({
					_id: token.user.id,
				});

				if (!userSignin.role) {
					return done(null, false, { message: "you are not Authorized" });
				}

				if (userSignin.role.includes("admin")) {
					return done(null, token.user);
				}

				return done(null, false, { message: "you are not Authorized" });
			} catch (error) {
				console.log(error);
				return done(error, false, {
					message: "Cannot authenticate user",
				});				
			}
		}
	)
);

let doAuth = async (req, res, next) => {
	try {
		validationErrorHandler(req, res, next);
		//get the user act (login or signup)
		let act = req.route.path.substring(1);
		passport.authenticate(act, (err, user, info) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: "Internal server Error",
					error: err,
				});
			}

			// If user is not exist
			if (!user) {
				return res.status(401).json({
					status: "Error",
					message: info.message,
				});
			}
			req.user = user;
			next();
		})(req, res, next);
	} catch (error) {
		console.log(error);
		if (!error.statusCode) {
			error.statusCode = 500;
			error.message = "Internal Server Error";
		}
		next(error);
	}
};

let isUser = async (req, res, next) => {
	try {
		passport.authorize("user", { session: false }, (err, user, info) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: "Internal server Error",
					error: err,
				});
			}

			// If user is not exist
			if (!user) {
				return res.status(401).json({
					status: "Error",
					message: info.message,
				});
			}
			
			req.user = user;
			next();
		})(req, res, next);
	} catch (error) {
		console.log(error);
		if (!error.statusCode) {
			error.statusCode = 500;
			error.message = "Internal Server Error";
		}
		next(error);
	}
};

let isAdmin = async (req, res, next) => {
	try {
		passport.authorize("admin", { session: false }, (err, user, info) => {
			if (err) {
				if (!err.statusCode) {
					err.statusCode = 500;
					err.message = "Internal Server Error";
				}
				next(err);
			}

			// If not admin, send error
			if (!user) {
				const error = new Error(info.message);
				error.statusCode = 400;
				throw error;
			} else {
				req.user = user;
				next()
			}
		})(req, res, next);
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
			error.message = "Internal Server Error";
		}
		next(error);
	}
};

module.exports = { doAuth, isUser, isAdmin };
