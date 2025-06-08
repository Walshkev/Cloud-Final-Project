//adapted from course.js
const { Assignment } = require("../models/assignment")
const { paginate } = require("../lib/utils")

const createAssignment = (req, res) => {

};

//done needs testing
const getAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId)

    if (assignment) {
        res.json(assignment);
    } else {
        next();
    }
};

const getCourseAssignment = (req, res) => {

};

const updateAssignment = (req, res) => {

};

const deleteAssignment = (req, res) => {

};

module.exports = {
    createAssignment,
    getAssignment,
    getCourseAssignment,
    updateAssignment,
    deleteAssignment
};