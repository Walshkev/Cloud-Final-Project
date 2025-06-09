const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { Roles } = require("../models/roles");

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (role == Roles.Admin || role == Roles.Instructor) {
            if (!req.user || req.user.role != Roles.Admin) {
                return res.status(400)
                    .json({ error: "Only admins may create admin or instructor users" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        res.status(201)
            .json({
                id: user.id,
                links: {
                    self: `/users/${user.id}`
                }
            });
    } catch (err) {
        if (err.name == "ValidationError") {
            // Validation error
            res.status(400)
                .json({ "error": "Request did not contain a valid user object" });
        } else if (err.code == 11000) {
            // Duplicate email error
            res.status(409)
                .json({ "error": "A user with this email already exists" });
        } else {
            next(err);
        }
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).exec();

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.json({ 
            token,
            id: user.id,
         });

    } else {
        res.status(401)
            .json({ "error": "Invalid email or password" });
    }
};

// Gets user data (can only be accessed by the user and admins)
const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        // check if the user is valid
        if (req.user.userId !== userId && req.user.role !== Roles.Admin) {
            return res.status(403).json({ error: "Only admins or the user themselves can view a user's data" });
        }

        const user = await User.findById(userId);
        // check if user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get course data for students and instructors
        let courseData = [];

        if (user.role === Roles.Instructor) {
            courseData = await Course.find({ instructorId: userId });
        } else if (user.role === Roles.Student) {
            courseData = await Course.find({ students: userId });
        }

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            courses: courseData
        });

    } catch (err) {
        next(err)
    }
};

const deleteUser = async (req, res) => {
    const { deletedCount } = await User.deleteOne({ _id: req.params.userId });

    if (deletedCount > 0) {
        res.sendStatus(200);
    } else {
        next();
    }
};

module.exports = {
    createUser,
    login,
    getUser,
    deleteUser
};