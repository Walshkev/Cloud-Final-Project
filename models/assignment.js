const mongoose = require("mongoose");

const assignmentSchema = mongoose.Schema({
    courseId: { type: mongoose.Types.ObjectId, required: true },
    title: { type: String, required: true },
    points: { type: Number, required: true },
    due: { type: Date, required: true }
});

module.exports.Assignment = mongoose.model("Assignment", assignmentSchema);