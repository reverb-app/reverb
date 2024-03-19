import dotenv from 'dotenv';
dotenv.config();

import express, { Request } from 'express';
import { Event } from './types/types';
import { addEvent } from './services/pg-service';

import { v4 } from 'uuid';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI ?? '';
const dbName = process.env.MONGO_DB_NAME ?? '';

const client = new MongoClient(uri);

client.connect();

export const app = express();
app.use(express.json());

app.post('/events', (req: Request<{}, {}, Event>, res) => {
  if (!req.body.name) {
    res.status(400);
    return res.send({ error: 'Event ID was not included in request body' });
  }

  addEvent({ ...req.body, id: v4() });
  res.status(200);
  return res.send();
});

app.get('/logs', async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find({}).toArray();
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error retrieving logs from MongoDB:', error);
    res.status(500).json({ error: 'Failed to retrieve logs from MongoDB' });
  }
});

export default app;
