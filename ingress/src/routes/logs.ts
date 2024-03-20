// return events within a certain time period (a get request with query string params)
// return every log tied to specific event
// return an event tied to a specific function if
// return the last x number of errors
// paginated  

import express from 'express';
import { client, dbName } from '../services/mongo-service';
import { isValidDateString, isValidNumberString } from '../utils/utils';

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

router.get('/events', async (req, res) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime || !isValidDateString(startTime) || !isValidDateString(endTime)) {
    return res.status(400).json({ error: 'No or invalid startTime or endTime provided in URL' });
  }

  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find({
      timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) }
    }).toArray();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving events from MongoDB' });
  }
});

router.get('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find({ eventId }).toArray();

    if (logs.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving logs from MongoDB' });
  }
});

router.get('/functions/:funcId', async (req, res) => {
  const { funcId } = req.params;

  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find({ funcId }).toArray();

    if (logs.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving logs from MongoDB' })
  }
})

router.get('/errors/:count', async (req, res) => {
  const { count } = req.params;

  if (!isValidNumberString(count) || parseInt(count) <= 0) {
    return res.status(400).json({ error: 'Count is invalid' });
  }

  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const errors = await collection.find({ level: 'error' }).sort({ timestamp: -1 }).limit(parseInt(count)).toArray();
    res.status(200).json(errors)
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving errors from MongoDB' });
  }
});

export default router;