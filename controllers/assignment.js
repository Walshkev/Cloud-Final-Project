const { Assignment } = require("../models/assignment");
const { Course } = require("../models/course");
const { Roles } = require("../models/roles");
const { paginate } = require("../lib/utils");

const pageSize = 10;

// Create a new assignment (Admin or Instructor of the course only)
const createAssignment = async (req, res, next) => {
    try {
        const { courseId, title, points, due } = req.body;

        // check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // check if registered user is instructor or admin
        if (!req.user || (req.user.role !== Roles.Admin && req.user.id !== course.instructorId.toString())) {
            return res.status(403).json({ error: "Only admins or course instructors may create an assignment" });
        }

        // create and save the assignment
        const assignment = new Assignment({ courseId, title, points, due });
        await assignment.save();

        // build the response
        res.status(201).json({
            id: assignment.id,
            links: {
                self: `/assignments/${assignment.id}`
            }
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            res.status(400).json({ error: "Invalid assignment object" });
        } else {
            next(err);
        }
    }
};

// Get a single assignment
const getAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);

        // check if assignment exists
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        return res.json(assignment);

    } catch (err) {
        next(err);
    }
}

// Get all assignments for a course (paginated)
const getCourseAssignment = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        // check if course exists
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // build a page of assignments
        const page = parseInt(req.query.page || 1);
        const assignments = await Assignment.find({ courseId: courseId }).exec();
        const pagedAssignments = paginate(assignments, page, pageSize);

        if (pagedAssignments.length > 0) {
            res.json(pagedAssignments);
        } else {
            next();
        }

    } catch (err) {
        next(err);
    }
};

// Update an assignment (Admin or Instructor only)
const updateAssignment = async (req, res, next) => {
    try {
        const assignmentId = req.params.assignmentId;
        const assignment = await Assignment.findById(assignmentId);

        // check if assignment exists
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // check if course exists (probably not necessary)
        const course = await Course.findById(assignment.courseId);
        if (!course) {
            return res.status(404).json({ error: "Associated course not found" });
        }

        // check if user is a valid role
        if (!req.user || (req.user.role !== Roles.Admin && req.user.id !== course.instructorId.toString())) {
            return res.status(403).json({ error: "Only admins or the course instructor may update the assignment" });
        }
        
        // update the assignment
        const { title, points, due } = req.body;

        let update = {
            title: title ?? assignment.title,
            points: points ?? assignment.points,
            due: due ?? assignment.due
        };

        const { matchedCount } = await Assignment.updateOne({ _id: assignmentId }, update);

        if (matchedCount > 0) {
            res.json({
                links: {
                    self: `/assignments/${assignmentId}`
                }
            });
        } else {
            next();
        }

    } catch (err) {
        if (err.name === "ValidationError") {
            res.status(400).json({ error: "Invalid assignment object" });
        } else {
            next(err);
        }
    }
};

// Delete an assignment (Admin or Instructor only)
const deleteAssignment = async (req, res, next) => {
    try {
        const assignmentId = req.params.assignmentId;
        const assignment = await Assignment.findById(assignmentId);

        // check if assignment exists
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // check if course exists (probably not necessary)
        const course = await Course.findById(assignment.courseId);
        if (!course) {
            return res.status(404).json({ error: "Associated course not found" });
        }

        // check if user is a valid role
        if (!req.user || (req.user.role !== Roles.Admin && req.user.id !== course.instructorId.toString())) {
            return res.status(403).json({ error: "Only admins or the course instructor may delete the assignment" });
        }

        // delete the assignment
        const { deletedCount } = await Assignment.deleteOne({ _id: assignmentId });
        if (deletedCount > 0) {
            res.sendStatus(200);
        } else {
            next();
        }
        
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createAssignment,
    getAssignment,
    getCourseAssignment,
    updateAssignment,
    deleteAssignment
};
