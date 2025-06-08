const redis = require("redis");

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

let client = null;

const connectRedis = async () => {
    client = redis.createClient({ url: `redis://${host}:${port}` });
    await client.connect()

    return client;
};

const disconnectRedis = () => {
    if (client) {
        client.destroy();
        client = null;
    }
};

const getRedisClient = () => {
    if (!client) {
        throw Error("Call connectRedis before calling getRedisClient.")
    }

    return client;
};

module.exports = {
    connectRedis,
    disconnectRedis,
    getRedisClient,
};