import express, { Request } from 'express';
import {
  getCursorPaginatedLogs,
  getOffsetPaginatedLogs,
  getFunctionsStatus,
  handleOffsetPagination,
  handleCursorPagination,
  setFilterTimestamp,
  setFilterCursor,
  setLogLinks,
  DEFAULT_LIMIT,
} from '../utils/logUtils';
import { QueryFilter, HateoasLogCollection } from 'types/types';

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
    const events = await getOffsetPaginatedLogs(offset, limit, filter);

    if (events.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    setLogLinks(events);

    events.links = {};
    if (page > 1)
      events.links.previous = `/events?page=${page - 1}&limit=${limit}`;
    if (events.logs.length === (limit || DEFAULT_LIMIT) + 1) {
      events.links.next = `/events?page=${page + 1}&limit=${limit}`;
      events.logs = events.logs.slice(0, events.logs.length - 1);
    }

    res.status(200).json(events);
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

    if (status.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    setLogLinks(status);

    status.links = {};
    if (page > 1)
      status.links.previous = `/functions?page=${page - 1}&limit=${limit}`;
    if (status.logs.length === (limit || DEFAULT_LIMIT) + 1) {
      status.links.next = `/functions?page=${page + 1}&limit=${limit}`;
      status.logs = status.logs.slice(0, status.logs.length - 1);
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
    res
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
    const logs: HateoasLogCollection = await getOffsetPaginatedLogs(
      offset,
      limit,
      filter
    );

    if (logs.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (logs.logs.length === 0) {
      return res.status(404).json({ error: 'Function not found' });
    }

    setLogLinks(logs);

    res.status(200).json(logs.logs);
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
    const logs: HateoasLogCollection = await getOffsetPaginatedLogs(
      offset,
      limit,
      filter,
      {
        timestamp: -1,
      }
    );

    if (logs.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: 'Page not found' });
    }

    setLogLinks(logs);

    logs.links = {};
    if (page > 1)
      logs.links.previous = `/events?page=${page - 1}&limit=${limit}`;
    if (logs.logs.length === (limit || DEFAULT_LIMIT) + 1) {
      logs.links.next = `/events?page=${page + 1}&limit=${limit}`;
      logs.logs = logs.logs.slice(0, logs.logs.length - 1);
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving error logs from MongoDB' });
  }
});

export default router;
