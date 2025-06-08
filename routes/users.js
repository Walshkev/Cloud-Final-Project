const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();
router.post("/", userController.createUser);
router.post("/login", userController.login);
router.get("/:userId", userController.getUser);

module.exports = router;