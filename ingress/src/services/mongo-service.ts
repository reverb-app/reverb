import { MongoClient } from "mongodb";

const connectionString = process.env.MONGO_CONNECTION_STRING ?? "";
const client = new MongoClient(connectionString);
client.connect();

const database = client.db();
const logsCollection = database.collection("logs");
export { client, database, logsCollection };
