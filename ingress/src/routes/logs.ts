import express from 'express';
import { client, dbName } from '../services/mongo-service';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find({}).toArray();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving logs from MongoDB' });
  }
});

export default router;