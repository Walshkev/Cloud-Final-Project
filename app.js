require("dotenv").config();
const yn = require("yn").default;
const express = require("express");
const logger = require("morgan");
const { connectDb } = require("./lib/mongo");
const { connectRedis } = require("./lib/redis");
const { authenticate } = require("./middleware/auth");
const { rateLimit } = require("./middleware/rateLimit");

const port = process.env.PORT;
const rateLimitEnabled = yn(process.env.RATE_LIMIT_ENABLED);
const app = express();

const promise = connectDb();
rateLimitEnabled && promise.then(() => connectRedis());
promise.then(() =>
    app.listen(port, () =>
        console.log(`=== Server is running on port ${port}`)
    )
);

app.use(logger("dev"));
app.use(express.json());
app.use(authenticate);
rateLimitEnabled && app.use(rateLimit);
app.use("/", require("./routes/index"));