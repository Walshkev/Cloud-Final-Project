require("dotenv").config();
const { MongoClient } = require("mongodb");

const main = async () => {
    const host = process.env.MONGO_HOST;
    const port = process.env.MONGO_PORT;
    const database = process.env.MONGO_DATABASE;
    const rootUser = process.env.MONGO_ROOT_USER;
    const rootPassword = process.env.MONGO_ROOT_PASSWORD;
    const user = process.env.MONGO_USER;
    const password = process.env.MONGO_PASSWORD;
    const url = `mongodb://${rootUser}:${rootPassword}@${host}:${port}`;

    console.log(`Connecting to ${url}.`);
    const client = await MongoClient.connect(url);

    console.log(`Creating database "${database}".`);
    const db = client.db(database);

    console.log(`Creating user "${user}" with password "${password}".`);
    await db.command({
        createUser: user,
        pwd: password,
        roles: [{ role: "readWrite", db: database }]
    });

    client.close();
    console.log("Initialization done.");
};

main();