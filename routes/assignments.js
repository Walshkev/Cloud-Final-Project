const express = require("express");
const assignmentController = require("../controllers/assignment");
const submissionController = require("../controllers/submission");

const router = express.Router();

// Assignments
router.post("/", assignmentController.createAssignment);
router.get("/:assignmentId", assignmentController.getAssignment);
router.patch("/:assignmentId", assignmentController.updateAssignment);
router.delete("/:assignmentId", assignmentController.deleteAssignment);

// Submissions
router.post("/:assignmentId/submissions", submissionController.createSubmission);
router.get("/:assignmentId/submissions", submissionController.getSubmissions);

module.exports = router;