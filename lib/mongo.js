const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");

const host = process.env.MONGO_HOST;
const port = process.env.MONGO_PORT;
const database = process.env.MONGO_DATABASE;
const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const url = `mongodb://${user}:${password}@${host}:${port}/${database}`;

let buckets = {};
let storage = null;

const connectDb = async () => {
    if (mongoose.connection.readyState != mongoose.ConnectionStates.connected) {
        await mongoose.connect(url);
    }

    return mongoose.connection.db;
};

const disconnectDb = async () => {
    await mongoose.connection.close();
};

const getDb = async () => {
    if (!mongoose.connection.db) {
        throw Error("Call connectDb to intialize db connection first.")
    }

    return mongoose.connection.db;
};

const getGridFsBucket = async (bucketName) => {
    if (!(bucketName in buckets)) {
        const db = await getDb();
        buckets[bucketName] = new mongoose.mongo.GridFSBucket(db, { bucketName });
    }

    return buckets[bucketName];
};

const getGridFsStorage = (file) => {
    if (!storage) {
        storage = new GridFsStorage({ url, file });
    }

    return storage;
};

module.exports = {
    connectDb,
    disconnectDb,
    getDb,
    getGridFsBucket,
    getGridFsStorage
};