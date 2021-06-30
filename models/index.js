const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

mongoose
	.connect(uri, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true, //use to make unique data Types
		useFindAndModify: false, //usefindAndUpdate instead of findAndModify
	})
	.then(() => console.log("database connected"))
	.catch((e) => console.log(e));


// IMPORT MODELS
module.exports.User = require("./users.js");
module.exports.RefreshToken = require("./refreshToken.js");
module.exports.isValidId = (id) => {
	return mongoose.Types.ObjectId.isValid(id);
}
//END IMPORT MODELS
