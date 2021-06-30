const passport = require("passport"); // Import passport
const localStrategy = require("passport-local").Strategy; // Import Strategy
const { User } = require("../../models");

const bcrypt = require("bcrypt"); // Import bcrypt
const JWTstrategy = require("passport-jwt").Strategy; // Import JWT Strategy
const ExtractJWT = require("passport-jwt").ExtractJwt; // Import ExtractJWT

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
			} catch (e) {
				console.log(e);
				// If error, it will return not authorization
				if (e.code == 11000 && e.keyPattern.username == 1) {
					return done(null, false, {
						message: "Username has been taken",
					});
				}
				if (e.code == 11000 && e.keyPattern.email == 1) {
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

				if (!userSignin) {
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
			} catch (e) {
				console.log(e);
				// If error, it will return not authorization
				return done(e, false, {
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

				if (
					userSignin.role.includes("user") ||
					userSignin.role.includes("admin")
				) {
					return done(null, token.user);
				}

				return done(null, false, { message: "you are not Authorized" });
			} catch (e) {
				console.log(e);
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
			} catch (e) {
				console.log(e);
			}
		}
	)
);

let doAuth = async (req, res, next) => {
	try {
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
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			message: "internal server error",
			error: err,
		});
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
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			message: "internal server error",
			error: err,
		});
	}
};

let isAdmin = async (req, res, next) => {
	try {
		passport.authorize("admin", { session: false }, (err, user, info) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: "Internal server Error",
					error: err,
				});
			}

			// If user is not exist, still next as guest
			if (user) {
				req.user = user;
			}
			next();
		})(req, res, next);
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			message: "internal server error",
			error: err,
		});
	}
};

module.exports = { doAuth, isUser, isAdmin };
