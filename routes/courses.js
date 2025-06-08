const express = require("express");
const courseController = require("../controllers/course");
const assignmentController = require("../controllers/assignment");

const router = express.Router();

// Courses
router.post("/", courseController.createCourse);
router.get("/", courseController.getCourses);
router.get("/:courseId", courseController.getCourse);
router.patch("/:courseId", courseController.updateCourse);
router.delete("/:courseId", courseController.deleteCourse);

// Students
router.post("/:courseId/students", courseController.addStudent);
router.get("/:courseId/students", courseController.getStudents);

// Misc
router.get("/:courseId/roster", courseController.downloadRoster);
router.get("/:courseId/assignments", assignmentController.getCourseAssignment);

module.exports = router;