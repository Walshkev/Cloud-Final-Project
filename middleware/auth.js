const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const authenticate = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    const token = authHeader?.startsWith("Bearer") && authHeader.split(" ")[1];

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(payload.sub);

            req.user = user;
        } catch (err) { /* Request did not have a valid JWT. */ }
    }

    next();
};

const requireAnyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const possibleRoles = Array.isArray(roles) ? roles : [roles];
        const hasRequiredRole = possibleRoles.includes(req.user.role);

        if (!hasRequiredRole) {
            return res.status(403)
                .json({ error: `Unauthorized access of ${req.method} ${req.originalUrl} for user role` });
        }

        next();
    };
};

module.exports = {
    authenticate,
    requireAnyRole
};