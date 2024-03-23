import express, { Request } from "express";
import {
  getPaginatedLogs,
  getAggregate,
  handlePagination,
  setFilterTimestamp,
} from "../utils/loggingUtils";
import { AggregateGroup, QueryFilter } from "types/types";

const router = express.Router();

// Implement previous and next
router.get("/", async (req: Request, res) => {
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
    const { page, limit, offset } = handlePagination(req);
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

router.get("/events", async (req: Request, res) => {
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
    const { page, limit, offset } = handlePagination(req);
    filter.message = { $in: ["Event emitted", "Event fired"] };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving events from MongoDB" });
  }
});

router.get("/functions", async (req: Request, res) => {
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
    const { page, limit, offset } = handlePagination(req);
    filter.message = { $in: ["Function invoked", "Function completed"] };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving events from MongoDB" });
  }
});

router.get("/events/:eventId", async (req: Request, res) => {
  const { eventId } = req.params;

  const functions: any[] = [];
  try {
    const group: AggregateGroup = {
      _id: "$meta.funcId",
      message: { $last: "$message" },
      level: { $last: "$level" },
      timestamp: { $last: "$meta.timestamp" },
      name: { $first: "$meta.funcName" },
      invoked: { $first: "$meta.timestamp" },
    };

    const statusLogs = await getAggregate(group, {
      "meta.eventId": eventId,
    });

    statusLogs.forEach(log => {
      if (!log._id) return;
      let status = "running";
      if (log.message === "Function completed") {
        status = "completed";
      } else if (log.level === "error") {
        status = "error";
      }

      functions.push({
        status,
        funcId: log._id,
        lastUpdate: log.timestamp,
        invoked: log.invoked,
        funcName: log.name,
      });
    });

    res.status(200).json({ eventId, functions });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

router.get("/functions/status", async (req: Request, res) => {
  const { id } = req.query;
  if (id === undefined) {
    res
      .status(404)
      .json({ error: "Must include function id's as id query parameters" });
  }

  const filter: QueryFilter = {};

  if (typeof id === "string") {
    filter["meta.funcId"] = { $in: [id] };
  } else if (Array.isArray(id)) {
    filter["meta.funcId"] = { $in: id as string[] };
  }
  const group: AggregateGroup = {
    _id: "$meta.funcId",
    message: { $last: "$message" },
    level: { $last: "$level" },
    timestamp: { $last: "$meta.timestamp" },
    name: { $first: "$meta.funcName" },
    invoked: { $first: "$meta.timestamp" },
  };

  try {
    const logs = await getAggregate(group, filter);
    const statusReport = logs.map(log => {
      let status = "running";
      if (log.message === "Function completed") {
        status = "completed";
      } else if (log.level === "error") {
        status = "error";
      }

      return {
        funcId: log._id,
        lastUpdate: log.timestamp,
        status,
        funcName: log.name,
        invoked: log.invoked,
      };
    });

    res.status(200).json(statusReport);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
  }
});

// Maybe drop pagination
router.get("/functions/:funcId", async (req: Request, res) => {
  const { funcId } = req.params;

  try {
    const { page, limit, offset } = handlePagination(req);
    const filter: QueryFilter = { "meta.funcId": funcId };
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    if (logs.length === 0) {
      return res.status(404).json({ error: "Function not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving logs from MongoDB" });
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
    const { page, limit, offset } = handlePagination(req);
    filter.level = "error";
    const logs = await getPaginatedLogs(offset, limit, filter);

    if (logs.length === 0 && page !== 1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving events from MongoDB" });
  }
});

export default router;
