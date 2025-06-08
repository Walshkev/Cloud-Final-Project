const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "instructor", "student"],
        lowercase: true,
        required: true
    }
});

module.exports.User = mongoose.model("User", userSchema);