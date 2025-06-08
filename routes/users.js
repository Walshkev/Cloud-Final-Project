const express = require("express");
const { hasRole } = require("../middleware/auth");
const { Roles } = require("../models/roles");
const userController = require("../controllers/user");

const router = express.Router();
router.post("/", userController.createUser);
router.post("/login", userController.login);
router.get("/:userId", userController.getUser);
router.delete("/:userId", hasRole(Roles.Admin), userController.deleteUser);

module.exports = router;