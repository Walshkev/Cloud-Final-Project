const mongoose = require("mongoose");
const { getGridFsBucket } = require("../lib/mongo");
const { Roles } = require("../models/roles");
const { Course } = require("../models/course");
const { Assignment } = require("../models/assignment");
const { Submission } = require("../models/submission");
const { paginate } = require("../lib/utils");

const pageSize = 10;

const filterSubmission = async (req, file, callback) => {
    const { assignmentId, studentId } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        callback(null, false);
        return;
    }

    const course = await Course.findById(assignment.courseId);
    const studentEnrolled = course.students.find((student) => student.toString() == studentId);
    if (!studentEnrolled) {
        callback(null, false);
        return;
    }

    callback(null, true);
};

const createSubmission = async (req, res) => {
    if (!req.file) {
        return res.status(400)
            .json({ error: "Could not upload submission. Please verify the assignmentId is correct, and you are enrolled in the assignment's course." });
    }

    res.status(200)
        .json({
            id: req.file.id
        });
};

const getSubmissions = async (req, res, next) => {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
        return next();
    }

    const course = await Course.findById(assignment.courseId)
    if (req.user.role == Roles.Instructor && req.user.id != course.instructorId) {
        return res.status(403)
            .json({ error: "Only admins or the course instructor can get assignment submissions" });
    }

    const filter = { "metadata.assignmentId": req.params.assignmentId };
    if (req.query.studentId) {
        filter["metadata.studentId"] = req.query.studentId;
    }

    const submissions = await Submission.find({ "metadata.assignmentId": req.params.assignmentId });

    const page = parseInt(req.query.page || 1);
    const pagedSubmissions = paginate(submissions, page, pageSize);

    if (pagedSubmissions.length > 0) {
        return res.json(pagedSubmissions);
    } else {
        next();
    }
};

const downloadSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) {
            return next();
        }

        const bucket = await getGridFsBucket("submissions");
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(submission.id));
        downloadStream.pipe(res);

        res.status(200)
            .contentType(submission.contentType);
    } catch (err) {
        res.status(400)
            .json({ error: "Could not download file" });
    }
};

const deleteSubmission = async (req, res) => {
    const submission = await Submission.findById(req.params.submissionId);

    if (submission) {
        const bucket = await getGridFsBucket("submissions");
        bucket.delete(new mongoose.Types.ObjectId(submission.id));

        res.sendStatus(200);
    } else {
        next();
    }
};

module.exports = {
    filterSubmission,
    createSubmission,
    getSubmissions,
    downloadSubmission,
    deleteSubmission
};