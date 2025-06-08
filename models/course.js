const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
    subject: { type: String, required: true },
    number: { type: String, required: true },
    title: { type: String, required: true },
    term: { type: String, required: true },
    instructorId: { type: mongoose.Types.ObjectId, required: true }
});

module.exports.Course = mongoose.model("Course", courseSchema);