const express = require("express");

const router = express.Router();
router.use("/users", require("./users"));
router.use("/courses", require("./courses"));
router.use("/assignments", require("./assignments"));

router.use((req, res) => {
  res.status(404)
    .json({ error: `Resource at ${req.originalUrl} not found.` })
});

router.use((err, req, res) => {
  console.error(`== Error: ${err}`);

  res.status(500)
    .json({ error: "Internal server error. Please try again later." })
});

module.exports = router;