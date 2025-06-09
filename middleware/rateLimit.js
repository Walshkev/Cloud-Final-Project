const { getRedisClient } = require("../lib/redis");

const maxTokens = parseInt(process.env.RATE_LIMIT_MAX_TOKENS || 10);
const window = parseInt(process.env.RATE_LIMIT_WINDOW || 60000);

const rateLimit = async (req, res, next) => {
    const client = getRedisClient();
    const bucketKey = req.ip;
    const refreshRate = maxTokens / window;
    const timestamp = Date.now();

    if (await client.exists(bucketKey)) {
        // Subsequent request. Update bucket and check if there are enough tokens for request.
        const bucket = await client.hGetAll(bucketKey);
        bucket.tokens = parseInt(bucket.tokens) + (timestamp - bucket.lastRequest) * refreshRate;
        bucket.tokens = Math.min(bucket.tokens, maxTokens);
        bucket.lastRequest = timestamp;

        if (bucket.tokens >= 1) {
            bucket.tokens--;

            await client.hSet(bucketKey, bucket);

            next();
        } else {
            res.status(429)
                .json({ error: "Too many request. Please try again later." });
        }
    } else {
        // Initial request. Create bucket with maxTokens - 1 and allow request.
        await client.hSet(bucketKey, { tokens: maxTokens - 1, lastRequest: timestamp });

        next();
    }
};

module.exports = {
    rateLimit
};