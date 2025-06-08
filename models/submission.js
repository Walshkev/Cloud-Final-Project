const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema({
    assignmentId: { type: mongoose.Types.ObjectId, required: true },
    studentId: { type: mongoose.Types.ObjectId, required: true },
    timestamp: { type: Date, required: true, default: Date.now() },
    grade: { type: mongoose.Types.Double, required: false },
    file: { type: String, required: true }
});

module.exports.Submission = mongoose.model("Submission", submissionSchema);