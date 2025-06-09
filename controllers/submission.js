//adapted from course.js
const { Course } = require("../models/course")
const { Assignment } = require("../models/assignment")
const { Roles } = require("../models/roles")
const { Submission } = require("../models/submission")
const { paginate } = require("../lib/utils")

const pageSize = 10;

//TODO
const createSubmission = (req, res) => {
    try{
        const { file } = req.body;
        if (!req.user || req.user.role != Roles.Admin) {
            return res.status(403)
                .json({ error: "You may only submit assignments to classes you are enrolled in" });
        }
    } catch (err) {
        res.status(400)
            .json({"error": "Request did not contain a valid assignment object"})
    }
};

//done needs testing
const getSubmissions = async (req, res) => {
    try{
        const assignmentId = req.params.assignmentId
        const assignment = await Assignment.findById(assignmentId);
        const course = await Course.findById(assignment.courseId)
        try {
            if (!req.user || (req.user.role != Roles.Admin && req.user.id != course.instructorId)) {
                return res.status(403)
                    .json({ error: "Only admins or the teacher of a course may update a new course" });
            }

            const page = parseInt(req.query.page() || 1);

            const submissions = await Submissions.find({assignmentId: assignmentId});
            const pagedSubmissions = paginate(getCourses, page, pageSize);

            if(pagedSubmissions.length>0){
                return res.json(pagedSubmissions);
            } else {
                next();
            }

        } catch (err) {
            res.status(400)
                .json({ "error": "Request did not contain valid enrollment syntax. Include an add array and a remove array." })
        }
    }
    catch {
        res.status(404)
            .json({"error": "Assignment not found"})
    }
};

module.exports = {
    createSubmission,
    getSubmissions
};