
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/whispercart";

async function run() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        console.log("Connected successfully to local MongoDB");
        await client.close();
    } catch (e) {
        console.error("Failed to connect to local MongoDB:", e.message);
    }
}
run();
