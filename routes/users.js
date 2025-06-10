const express = require("express");
const { requireAnyRole } = require("../middleware/auth");
const { Roles } = require("../models/roles");
const userController = require("../controllers/user");

const router = express.Router();
router.post("/", userController.createUser);
router.post("/login", userController.login);
router.get("/:userId", userController.getUser);
router.delete("/:userId", requireAnyRole(Roles.Admin), userController.deleteUser);

module.exports = router;