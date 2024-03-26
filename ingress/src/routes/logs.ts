import express, { Request } from 'express';
import {
  getCursorPaginatedLogs,
  getOffsetPaginatedLogs,
  getFunctionsStatus,
  handleOffsetPagination,
  handleCursorPagination,
  setFilterTimestamp,
  setFilterCursor,
} from '../utils/loggingUtils';
import { isValidDeadLetterType } from '../utils/utils';
import { QueryFilter } from '../types/types';

const router = express.Router();

// Implement previous and next
router.get('/', async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
    setFilterCursor(req, filter);
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const { limit } = handleCursorPagination(req);
    const logs = await getCursorPaginatedLogs(limit, filter);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving logs from MongoDB' });
  }
});

router.get('/events', async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const { page, limit, offset } = handleOffsetPagination(req);
    filter.message = { $in: ['Event emitted', 'Event fired'] };
    const logs = await getOffsetPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving event logs from MongoDB' });
  }
});

router.get('/functions', async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const { page, limit, offset } = handleOffsetPagination(req);

    const status = await getFunctionsStatus(filter, offset, limit);

    if (status.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json(status);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error retrieving function logs from MongoDB' });
  }
});

router.get('/events/:eventId', async (req: Request, res) => {
  const { eventId } = req.params;

  try {
    const status = await getFunctionsStatus({
      'meta.eventId': eventId,
    });

    res.status(200).json({ eventId, functions: status });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving event logs from MongoDB' });
  }
});

router.get('/functions/status', async (req: Request, res) => {
  const { id } = req.query;
  if (id === undefined) {
    return res
      .status(404)
      .json({ error: "Must include function id's as id query parameters" });
  }

  const filter: QueryFilter = {};

  if (typeof id === 'string') {
    filter['meta.funcId'] = { $in: [id] };
  } else if (Array.isArray(id)) {
    filter['meta.funcId'] = { $in: id as string[] };
  }

  try {
    const status = await getFunctionsStatus(filter);

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving logs from MongoDB' });
  }
});

router.get('/functions/:funcId', async (req: Request, res) => {
  const { funcId } = req.params;

  try {
    const { page, limit, offset } = handleOffsetPagination(req);
    const filter: QueryFilter = { 'meta.funcId': funcId };
    const logs = await getOffsetPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (logs.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error retrieving function logs from MongoDB' });
  }
});

router.get('/errors', async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const { page, limit, offset } = handleOffsetPagination(req);
    filter.level = 'error';
    const logs = await getOffsetPaginatedLogs(offset, limit, filter, {
      timestamp: -1,
    });

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving error logs from MongoDB' });
  }
});

router.get('/dead-letter', async (req: Request, res) => {
  const { type } = req.query;
  if (!!type && !isValidDeadLetterType(type)) {
    return res.status(400).json({
      error:
        "Invalid 'type' query parameter. Value must be 'function', 'event', or 'all'.",
    });
  }

  const filter: QueryFilter = {};
  if (type === 'function' || type === 'event') filter.taskType = type;
  filter.message = {
    $in: [
      'Dead letter: Invalid payload',
      'Dead letter: Max attempts limit reached',
    ],
  };

  try {
    setFilterTimestamp(req, filter);
  } catch (e) {
    if (e instanceof Error)
      return res.status(400).json({
        error: e.message,
      });
  }

  const { page, limit, offset } = handleOffsetPagination(req);
  try {
    const logs = await getOffsetPaginatedLogs(offset, limit, filter, {
      timestamp: -1,
    });

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    return res.status(200).json(logs);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error retrieving dead letter logs from MongoDB' });
  }
});

export default router;
