require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const { connectDb } = require("./lib/mongo");
const { connectRedis } = require("./lib/redis");
const { authenticate } = require("./middleware/auth");

const port = process.env.PORT;
const app = express();

connectDb()
    .then(connectRedis())
    .then(app.listen(port, () =>
        console.log(`=== Server listening on port ${port}`))
    );

app.use(logger("dev"));
app.use(express.json());
app.use(authenticate);
app.use("/", require("./routes/index"));