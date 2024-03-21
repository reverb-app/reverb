import express from 'express';
import { client, dbName } from '../services/mongo-service';
import { getPaginatedLogs, } from '../utils/paginationUtils';
import { isValidDateString, isValidNumberString } from '../utils/utils';

const router = express.Router();

const logsPerPage = 10;

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * logsPerPage;
    const logs = await getPaginatedLogs(offset, logsPerPage);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

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
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * logsPerPage;
    const filter = {
      timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) }
    }
    const logs = await getPaginatedLogs(offset, logsPerPage, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving events from MongoDB' });
  }
});

router.get('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * logsPerPage;
    const filter = { eventId }
    const logs = await getPaginatedLogs(offset, logsPerPage, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

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
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * logsPerPage;
    const filter = { funcId }

    const logs = await getPaginatedLogs(offset, logsPerPage, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

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