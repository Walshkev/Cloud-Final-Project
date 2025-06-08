const { Course } = require("../models/course")
const { User } = require("../models/user")
const { paginate } = require("../lib/utils");
const { Roles } = require("../models/roles");

//below code has been adapted from user.js and Alex's project 8 code.

const pageSize = 10;

//done needs testing.
const createCourse = async (req, res, next) => {
    try {
        const { subject, number, title, term, instructorId } = req.body;

        if (!req.user || req.user.role != Roles.Admin) {
            return res.status(403)
                .json({ error: "Only admins may create a new course" });
        }

        const course = new Course({
            subject,
            number,
            title,
            term,
            instructorId
        });

        await course.save();

        res.status(201)
            .json({
                id: course.id,
                links: {
                    self: `/course/${course.id}`
                }
            });
    } catch (err) {
        if (err.name == "ValidationError") {
            // Validation error
            res.status(400)
                .json({ "error": "Request did not contain a valid course object" });
        } else {
            next(err);
        }
    }
};

//done needs testing
const getCourses = async (req, res, next) => {
    const page = parseInt(req.query.page() || 1);

    const courses = await Course.find({}).exec();

    const pagedCourses = paginate(courses, page, pageSize);

    if(pagedCourses.length>0){
        return res.json(pagedCourses);
    } else {
        next();
    }
};

//done needs testing
const getCourse = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    
    if (course) {
        res.json(course);
    } else {
        next();
    }
};

//TODOs left
const updateCourse = async (req, res, next) => {
    try{
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        try{
            //TODO allow the teacher of a course to update the course as well
            if (!req.user || req.user.role != Roles.Admin) {
                return res.status(403)
                    .json({ error: "Only admins or the teacher of a course may update a new course" });
            }
            
            const { subject, number, title, term, instructorId } = req.params
            if (!subject && !number && !title && !term && !instructorId) {
                res.status(400)
                    .json({"error": "Request did not contain a valid course object"})
            }

            let updateJSON = {
                "subject": subject?? course.subject,
                "number": number?? course.number,
                "title": title?? course.title,
                "term": term?? course.term,
                "instructorId": instructorId?? course.instructorId
            }
            const { matchedCount } = await Course.updateOne({_id: courseId}, updateJSON)
            if ( matchedCount>0 ){
                res.json({
                    "links": {
                        "self": `/courses/${courseId}`
                    }
                });
            } else{
                next();
            }

        } catch (err) {
            res.status(400)
                .json({"error": "Request did not contain a valid course object"})
        }
    } catch {
        res.status(404)
            .json({"error": "Course not found"})
    }
};


//TODOs remaining
const deleteCourse = async (req, res) => {
    if (!req.user || req.user.role != Roles.Admin) {
        return res.status(403)
            .json({ error: "Only admins may delete a course" });
    }

    const { deletedCount } = await Course.deleteOne({ _id: req.params.courseId });
    // TODO: cascade deletions?

    if (deletedCount > 0) {
        res.sendStatus(200);
    } else {
        next();
    }
};

const addStudent = (req, res) => {

};

const getStudents = (req, res) => {

};

const downloadRoster = (req, res) => {

};

module.exports = {
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse,
    addStudent,
    getStudents,
    downloadRoster,
};