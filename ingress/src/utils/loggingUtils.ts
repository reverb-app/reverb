import { client, dbName } from "../services/mongo-service";
import { Request } from "express";
import {
  isValidDateString,
  isValidNumberString,
  isValidTimeParams,
} from "../utils/utils";
import { QueryFilter, AggregateGroup } from "types/types";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export async function getPaginatedLogs(
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

export async function getAggregate(group: AggregateGroup, filter: QueryFilter) {
  const database = client.db(dbName);
  const collection = database.collection("logs");
  const logs = await collection.aggregate([
    { $group: group },
    { $match: filter },
    { $sort: { date: -1 } },
  ]);

  return logs;
}

export function handlePagination(req: Request): {
  page: number;
  limit: number;
  offset: number;
} {
  let limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function setFilterTimestamp(req: Request, filter: QueryFilter) {
  const queryTimestamp = {
    startTime: req.query.startTime,
    endTime: req.query.endTime,
  };

  if (!isValidTimeParams(queryTimestamp)) {
    throw new Error(
      "startTime and endTime must be provided together and be valid"
    );
  }

  if (queryTimestamp.startTime && queryTimestamp.endTime) {
    filter.timestamp = {
      $gte: new Date(queryTimestamp.startTime),
      $lte: new Date(queryTimestamp.endTime),
    };
  }
}
