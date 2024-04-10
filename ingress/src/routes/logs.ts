import express, { Request } from "express";
import {
  getCursorPaginatedLogs,
  getOffsetPaginatedLogs,
  getFunctionsStatus,
  handleOffsetPagination,
  handleCursorPagination,
  setFilterTimestamp,
  setFilterCursor,
  setFilterName,
  setLogLinks,
} from "../utils/log-utils";
import { isValidDeadLetterType } from "../utils/utils";
import { QueryFilter, HateoasLogCollection } from "types/types";

const router = express.Router();

router.get("/", async (req: Request, res) => {
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

    setLogLinks(logs);
    const lastEntry = logs.logs[logs.logs.length - 1];
    const nextCursor =
      lastEntry.function?._id || lastEntry.event?._id || lastEntry.error?._id;

    if (nextCursor)
      logs.links = {
        next: `/logs?cursor=${nextCursor}&limit=${limit}`,
      };

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

router.get("/events", async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
    setFilterName(req, filter, "/events");
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    const { page, limit, offset } = handleOffsetPagination(req);
    filter.message = "Event fired";
    const events = await getOffsetPaginatedLogs(offset, limit, filter);

    if (events.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    setLogLinks(events);

    events.links = {};
    if (page > 1)
      events.links.previous = `/logs/events?page=${page - 1}&limit=${limit}`;
    if (!!limit && events.logs.length === limit + 1) {
      events.links.next = `/logs/events?page=${page + 1}&limit=${limit}`;
      events.logs = events.logs.slice(0, events.logs.length - 1);
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving event logs from MongoDB" });
  }
});

router.get("/functions", async (req: Request, res) => {
  const filter: QueryFilter = {};

  try {
    setFilterTimestamp(req, filter);
    setFilterName(req, filter, "/functions");
  } catch (e) {
    if (!(e instanceof Error)) return;

    return res.status(400).json({
      error: e.message,
    });
  }

  try {
    let { id } = req.query;
    const { page, limit, offset } = handleOffsetPagination(req);

    if (typeof id === "string") {
      filter["meta.funcId"] = { $in: [id] };
    } else if (Array.isArray(id)) {
      filter["meta.funcId"] = { $in: id as string[] };
    }

    const status = await getFunctionsStatus(filter, offset, limit);

    if (status.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    setLogLinks(status);

    status.links = {};
    if (page > 1)
      status.links.previous = `/logs/functions?page=${page - 1}&limit=${limit}`;

    if (Array.isArray(id))
      id.forEach((entry) => {
        if (!status.links) return;
        status.links.previous = status.links.previous?.concat(`&id=${entry}`);
      });
    if (!!limit && status.logs.length === limit + 1) {
      status.links.next = `/logs/functions?page=${page + 1}&limit=${limit}`;
      status.logs = status.logs.slice(0, status.logs.length - 1);

      if (Array.isArray(id))
        id.forEach((entry) => {
          if (!status.links) return;
          status.links.next = status.links.next?.concat(`&id=${entry}`);
        });
    }

    res.status(200).json(status);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving function logs from MongoDB" });
  }
});

router.get("/events/:eventId", async (req: Request, res) => {
  const { eventId } = req.params;

  try {
    const status = await getFunctionsStatus({
      "meta.eventId": eventId,
    });

    setLogLinks(status);

    res.status(200).json({ eventId, logs: status.logs });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving event logs from MongoDB" });
  }
});

router.get("/functions/:funcId", async (req: Request, res) => {
  const { funcId } = req.params;

  try {
    const { page, limit, offset } = handleOffsetPagination(req);
    const filter: QueryFilter = { "meta.funcId": funcId };
    const logs: HateoasLogCollection = await getOffsetPaginatedLogs(
      offset,
      limit,
      filter
    );

    if (logs.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    if (logs.logs.length === 0) {
      return res.status(404).json({ error: "Function not found" });
    }

    setLogLinks(logs);

    res.status(200).json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving function logs from MongoDB" });
  }
});

router.get("/errors", async (req: Request, res) => {
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
    filter.level = "error";
    const logs: HateoasLogCollection = await getOffsetPaginatedLogs(
      offset,
      limit,
      filter,
      {
        timestamp: -1,
      }
    );

    if (logs.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    setLogLinks(logs);

    logs.links = {};
    if (page > 1)
      logs.links.previous = `/logs/events?page=${page - 1}&limit=${limit}`;
    if (!!limit && logs.logs.length === limit + 1) {
      logs.links.next = `/logs/events?page=${page + 1}&limit=${limit}`;
      logs.logs = logs.logs.slice(0, logs.logs.length - 1);
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving error logs from MongoDB" });
  }
});

router.get("/dead-letter", async (req: Request, res) => {
  let { type } = req.query;
  if (!!type && !isValidDeadLetterType(type)) {
    return res.status(400).json({
      error:
        "Invalid 'type' query parameter. Value must be 'function', 'event', or 'all'.",
    });
  }

  const filter: QueryFilter = {};
  if (type === "function" || type === "event") filter["meta.taskType"] = type;
  filter.message = {
    $in: [
      "Dead letter: Invalid payload",
      "Dead letter: Max attempts limit reached",
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
    const jobs = await getOffsetPaginatedLogs(offset, limit, filter, {
      timestamp: -1,
    });

    if (jobs.logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    setLogLinks(jobs);

    jobs.links = {};
    if (page > 1) {
      jobs.links.previous = `/logs/dead-letter?page=${page - 1}&limit=${limit}`;

      if (!type) type = "all";
      jobs.links.previous += `&type=${type}`;
    }
    if (!!limit && jobs.logs.length === limit + 1) {
      jobs.links.next = `/logs/dead-letter?page=${page + 1}&limit=${limit}`;
      jobs.logs = jobs.logs.slice(0, jobs.logs.length - 1);

      if (!type) type = "all";
      jobs.links.next += `&type=${type}`;
    }

    return res.status(200).json(jobs);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error retrieving dead letter logs from MongoDB" });
  }
});

export default router;
