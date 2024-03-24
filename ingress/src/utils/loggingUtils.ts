import { client, dbName } from "../services/mongo-service";
import { ObjectId } from "mongodb";
import { Request } from "express";
import { isValidTimeParams } from "../utils/utils";
import { QueryFilter, AggregateGroup } from "types/types";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export async function getOffsetPaginatedLogs(
  offset: number,
  limit: number,
  filter: {} = {},
  sort: {} = {}
): Promise<any[]> {
  try {
    const database = client.db(dbName);
    const collection = database.collection("logs");
    const logs = await collection
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .toArray();
    return logs;
  } catch (error) {
    throw new Error("Error retrieving logs from MongoDB");
  }
}

export async function getCursorPaginatedLogs(
  limit: number,
  filter: {} = {},
  sort: {} = {}
): Promise<any[]> {
  try {
    const database = client.db(dbName);
    const collection = database.collection("logs");
    const logs = await collection
      .find(filter)
      .sort(sort)
      .limit(limit)
      .toArray();
    return logs;
  } catch (error) {
    throw new Error("Error retrieving logs from MongoDB");
  }
}

export async function getFunctionsStatus(
  filter: QueryFilter,
  offset: number = 0,
  limit: number | undefined = undefined
) {
  const group: AggregateGroup = {
    _id: "$meta.funcId",
    message: { $last: "$message" },
    level: { $last: "$level" },
    timestamp: { $last: "$meta.timestamp" },
    name: { $first: "$meta.funcName" },
    invoked: { $first: "$meta.timestamp" },
  };

  const database = client.db(dbName);
  const collection = database.collection("logs");
  let search = await collection
    .aggregate([
      { $match: filter },
      { $sort: { timestamp: 1 } },
      { $group: group },
    ])
    .skip(offset);

  if (limit) {
    search = await search.limit(limit);
  }

  let logs = await search.toArray();

  logs = logs
    .filter((log) => log._id !== null)
    .sort((a, b) => Date.parse(b.invoked) - Date.parse(a.invoked));

  return logs.map((log) => {
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
}

export function handleOffsetPagination(req: Request): {
  page: number;
  limit: number;
  offset: number;
} {
  let limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function handleCursorPagination(req: Request): {
  limit: number;
} {
  let limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

  return { limit };
}

export function setFilterTimestamp(req: Request, filter: QueryFilter) {
  const queryTimestamp = {
    startTime: req.query.startTime,
    endTime: req.query.endTime,
  };

  if (!queryTimestamp.startTime && !queryTimestamp.endTime) {
    return;
  }

  if (!isValidTimeParams(queryTimestamp)) {
    throw new Error(
      "startTime and endTime must be provided together and be valid"
    );
  }

  if (queryTimestamp.startTime && queryTimestamp.endTime) {
    filter["meta.timestamp"] = {
      $gte: new Date(queryTimestamp.startTime),
      $lte: new Date(queryTimestamp.endTime),
    };
  }
}

export function setFilterCursor(req: Request, filter: QueryFilter) {
  const { cursor } = req.query;

  if (!cursor) {
    return;
  }

  filter["_id"] = { $gt: new ObjectId(cursor as string) };
}
