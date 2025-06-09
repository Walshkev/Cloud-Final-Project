const { Course } = require("../models/course")
const { paginate } = require("../lib/utils");
const { Roles } = require("../models/roles");
const mongoose = require("mongoose");
const { User } = require("../models/user");

//below code has been adapted from user.js and Alex's project 8 code.

const pageSize = 10;

const createCourse = async (req, res, next) => {
  try {
    const { subject, number, title, term, instructorId } = req.body;

    if (!req.user || req.user.role != Roles.Admin) {
      return res
        .status(403)
        .json({ error: "Only admins may create a new course" });
    }

    const course = new Course({
      subject,
      number,
      title,
      term,
      instructorId,
    });

    await course.save();

    res.status(201).json({
      id: course.id,
      links: {
        self: `/course/${course.id}`,
      },
    });
  } catch (err) {
    if (err.name == "ValidationError") {
      // Validation error
      res
        .status(400)
        .json({ error: "Request did not contain a valid course object" });
    } else {
      next(err);
    }
  }
};

//bugs shoed up when testing
const getCourses = async (req, res, next) => {
  const page = parseInt(req.query.page() || 1);

  const courses = await Course.find({}).exec();

  const pagedCourses = paginate(courses, page, pageSize);

  if (pagedCourses.length > 0) {
    return res.json(pagedCourses);
  } else {
    next();
  }
};

const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (course) {
    res.json(course);
  } else {
    next();
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    try {
      if (
        !req.user ||
        (req.user.role != Roles.Admin && req.user.id != course.instructorId)
      ) {
        return res
          .status(403)
          .json({
            error:
              "Only admins or the teacher of a course may update a new course",
          });
      }

      const { subject, number, title, term, instructorId } = req.body;
      if (!subject && !number && !title && !term && !instructorId) {
        res
          .status(400)
          .json({ error: "Request did not contain a valid course object" });
      }

      let updateJSON = {
        subject: subject ?? course.subject,
        number: number ?? course.number,
        title: title ?? course.title,
        term: term ?? course.term,
        instructorId: instructorId ?? course.instructorId,
      };
      const { matchedCount } = await Course.updateOne(
        { _id: courseId },
        updateJSON
      );
      if (matchedCount > 0) {
        res.json({
          links: {
            self: `/courses/${courseId}`,
          },
        });
      } else {
        next();
      }
    } catch (err) {
      res
        .status(400)
        .json({ error: "Request did not contain a valid course object" });
    }
  } catch {
    res.status(404).json({ error: "Course not found" });
  }
};

//TODOs remaining
const deleteCourse = async (req, res) => {
  if (!req.user || req.user.role != Roles.Admin) {
    return res.status(403).json({ error: "Only admins may delete a course" });
  }

  const { deletedCount } = await Course.deleteOne({ _id: req.params.courseId });
  // TODO: cascade deletions?

  if (deletedCount > 0) {
    res.sendStatus(200);
  } else {
    next();
  }
};

//done needs testing
const addStudent = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (
      !req.user ||
      (req.user.role != Roles.Admin && req.user.id != course.instructorId)
    ) {
      return res.status(403).json({
        error: "Only admins or the teacher of a course may update a new course",
      });
    }

    let { add, remove } = req.body;
    if (!Array.isArray(add) || !Array.isArray(remove)) {
      return res.status(400).json({
        error:
          "Request did not contain valid enrollment syntax. Include an add array and a remove array.",
      });
    }

    // No conversion, just use the strings
    if (add.length > 0) {
      await Course.updateOne(
        { _id: courseId },
        { $addToSet: { students: { $each: add } } }
      );
    }
    if (remove.length > 0) {
      await Course.updateOne(
        { _id: courseId },
        { $pull: { students: { $in: remove } } }
      );
    }

    return res.json({
      links: {
        self: `/courses/${courseId}/students`,
      },
    });
  } catch (err) {
    return res.status(400).json({
      error:
        "Request did not contain valid enrollment syntax. Include an add array and a remove array.",
    });
  }
};
//done needs testing might need to be updated to only give userIds
const getStudents = async (req, res, next) => {
  const course = await Course.findOne({ _id: req.params.courseId });
  if (course) {
    const users = await Promise.all(course.students.map(id => User.findById(id)));
    res.json(users.filter(Boolean));
  } else {
    next();
  }
};


//done needs testing

const downloadRoster = async (req, res, next) => {
  const course = await Course.findOne({ _id: req.params.courseId });
  if (course) {
    let csv = "id,name,email\r\n";
    for (const studentId of course.students) {
      const user = await User.findById(studentId);
      if (!user) continue;
      
      console.log(user);
      csv += `${user._id},${user.name},${user.email}\r\n`;
    }
    res
      .set({
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users.csv"`,
      })
      .send(csv);
  } else {
    next();
  }
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
