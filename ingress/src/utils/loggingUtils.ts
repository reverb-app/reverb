import { client, dbName } from "../services/mongo-service";
import { ObjectId } from 'mongodb';
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

export async function getAggregate(group: AggregateGroup, filter: QueryFilter) {
  const database = client.db(dbName);
  const collection = database.collection("logs");
  const logs = collection
    .aggregate([{ $match: filter }, { $group: group }, { $sort: { date: -1 } }])
    .toArray();

  return logs;
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
  const cursorFilter: object = cursor ? { _id: { $gt: new ObjectId(cursor as string) } } : {};
  filter["cursor"] = cursorFilter;
}
