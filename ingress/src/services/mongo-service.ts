import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_CONNECTION_STRING ?? '';
const dbName = process.env.MONGO_DB_NAME ?? '';
const client = new MongoClient(uri);
client.connect();

export { client, dbName };
