const express = require("express");
const multer = require("multer");
const { getGridFsStorage } = require("../lib/mongo");
const { requireAnyRole } = require("../middleware/auth");
const assignmentController = require("../controllers/assignment");
const submissionController = require("../controllers/submission");
const { Roles } = require("../models/roles");

const storage = getGridFsStorage((req, file) => {
    return {
        bucketName: "submissions",
        filename: file.originalname,
        metadata: {
            assignmentId: req.body.assignmentId,
            studentId: req.body.studentId,
            timestamp: req.body.timestamp
        }
    };
});

const upload = multer({
    storage,
    fileFilter: submissionController.filterSubmission
});

const router = express.Router();

// Assignments
router.post("/", assignmentController.createAssignment);
router.get("/:assignmentId", assignmentController.getAssignment);
router.patch("/:assignmentId", assignmentController.updateAssignment);
router.delete("/:assignmentId", assignmentController.deleteAssignment);

// Submissions
router.post("/:assignmentId/submissions", upload.single("file"), requireAnyRole(Roles.Student), submissionController.createSubmission);
router.get("/:assignmentId/submissions", requireAnyRole([Roles.Admin, Roles.Instructor]), submissionController.getSubmissions);
router.get("/:assignmentId/submissions/:submissionId", submissionController.downloadSubmission);
router.delete("/:assignmentId/submissions/:submissionId", requireAnyRole(Roles.Admin), submissionController.deleteSubmission);

module.exports = router;