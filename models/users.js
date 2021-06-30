const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const bcrypt = require("bcrypt");

const roleType = {
	Admin: "admin",
	User: "user",
  };

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true, },
		address: String,
		role: {
			type: String,
			required: true,
			enum: [roleType.Admin, roleType.User],
		},
	},
	{
		timestamps: {
			createdAt: "created",
			updatedAt: "updated",
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

UserSchema.set("toJSON", {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		// remove these props when object is serialized
		delete ret._id;
		delete ret.password;
	},
});

UserSchema.plugin(mongoose_delete, { overrideMethods: "all" });

module.exports = mongoose.model("User", UserSchema);
