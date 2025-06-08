const mongoose = require("mongoose");
const { Roles } = require("./roles");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: [Roles.Admin, Roles.Instructor, Roles.Student],
        lowercase: true,
        required: true
    }
});

module.exports.User = mongoose.model("User", userSchema);