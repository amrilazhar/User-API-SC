const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: String,
            required : true,
			unique: true,
		},
		password: {
			type: String,
            required : true,
		},
        address : {
            type : String,
        }
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

UserSchema.pre("save", function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = bcrypt.hashSync(this.password, 12);
	next();
});


UserSchema.plugin(mongoose_delete, { overrideMethods: "all" });

module.exports = mongoose.model("User", UserSchema);
