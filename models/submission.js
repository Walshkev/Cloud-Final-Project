const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema({
    length: { type: String, required: true },
    chunkSize: { type: String, required: true },
    uploadDate: { type: Date, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    metadata: {
        assignmentId: { type: String, required: true },
        studentId: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now() },
        grade: { type: mongoose.Types.Double, required: false },
    }
}, { collection: "submissions.files" });

submissionSchema.set("toJSON", {
    transform: (doc, ret) => {
        return {
            assignmentId: ret.metadata.assignmentId,
            studentId: ret.metadata.studentId,
            timestamp: ret.metadata.timestamp,
            grade: ret.metadata.grade,
            file: `/assignments/${ret.metadata.assignmentId}/submissions/${ret._id}`
        }
    }
});

module.exports.Submission = mongoose.model("Submission", submissionSchema);