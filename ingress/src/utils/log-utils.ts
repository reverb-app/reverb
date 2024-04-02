import { logsCollection } from '../services/mongo-service';
import { AggregateOptions, ObjectId } from 'mongodb';
import { Request } from 'express';
import { isValidTimeParams } from './utils';
import { QueryFilter, AggregateGroup, HateoasLogCollection } from 'types/types';

export const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

export async function getOffsetPaginatedLogs(
  offset: number,
  limit: number | undefined,
  filter: {} = {},
  sort: {} = {}
): Promise<HateoasLogCollection> {
  try {
    let search = await logsCollection.find(filter).sort(sort).skip(offset);
    if (limit) {
      search = await search.limit(limit + 1);
    }
    const logs = await search.toArray();

    return {
      logs: logs.map((log) => {
        if (log.meta?.error) {
          return { error: log };
        } else if (log.meta?.funcId || log.funcId) {
          return { function: log };
        } else if (log.meta?.eventId || log.eventId) {
          return { event: log };
        } else {
          return { unknown: log };
        }
      }),
    };
  } catch (error) {
    throw new Error('Error retrieving logs from MongoDB');
  }
}

export async function getCursorPaginatedLogs(
  limit: number,
  filter: {} = {},
  sort: {} = {}
): Promise<HateoasLogCollection> {
  try {
    const logs = await logsCollection
      .find(filter)
      .sort(sort)
      .limit(limit)
      .toArray();
    return {
      logs: logs.map((log) => {
        if (log.meta?.error) {
          return { error: log };
        } else if (log.meta?.funcId || log.funcId) {
          return { function: log };
        } else if (log.meta?.eventId || log.eventId) {
          return { event: log };
        } else {
          return { unknown: log };
        }
      }),
    };
  } catch (error) {
    throw new Error('Error retrieving logs from MongoDB');
  }
}

export async function getFunctionsStatus(
  filter: QueryFilter,
  offset: number = 0,
  limit: number | undefined = undefined
): Promise<HateoasLogCollection> {
  const group: AggregateGroup = {
    _id: '$meta.funcId',
    message: { $last: '$message' },
    level: { $last: '$level' },
    timestamp: { $last: '$meta.timestamp' },
    name: { $first: '$meta.funcName' },
    invoked: { $first: '$meta.timestamp' },
  };

  const pipeline: { [key: string]: any }[] = [
    { $match: filter },
    { $sort: { timestamp: 1 } },
    { $group: group },
    { $skip: offset },
  ];

  if (limit) pipeline.push({ $limit: limit });

  let logs = await logsCollection.aggregate(pipeline).toArray();

  logs = logs
    .filter((log) => log._id !== null)
    .sort((a, b) => Date.parse(a.invoked) - Date.parse(b.invoked));

  return {
    logs: logs.map((log) => {
      let status = 'running';
      if (log.message === 'Function completed') {
        status = 'completed';
      } else if (log.level === 'error') {
        status = 'error';
      }

      return {
        function: {
          funcId: log._id,
          lastUpdate: log.timestamp,
          status,
          funcName: log.name,
          invoked: log.invoked,
        },
        links: {
          logs: `/functions/${log._id}`,
        },
      };
    }),
  };
}

export function handleOffsetPagination(req: Request): {
  page: number;
  limit?: number;
  offset: number;
} {
  let limit: number | undefined =
    parseInt(req.query.limit as string) || DEFAULT_LIMIT;

  if (limit === -1) {
    limit = undefined;
  }

  const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
  const offset = (page - 1) * (limit ?? 0);

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
      'startTime and endTime must be provided together and be valid'
    );
  }

  if (queryTimestamp.startTime && queryTimestamp.endTime) {
    filter['timestamp'] = {
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

  filter['_id'] = { $gt: new ObjectId(cursor as string) };
}

export function setFilterName(
  req: Request,
  filter: QueryFilter,
  route: string
) {
  const { name } = req.query;

  if (!name) {
    return;
  }

  if (route === '/functions') {
    filter['meta.funcName'] = name as string;
  } else if (route === '/events') {
    filter['meta.eventName'] = name as string;
  }
}

export function setLogLinks(collection: HateoasLogCollection) {
  collection.logs.forEach((log) => {
    log.links = {};

    if (log.error?.meta?.error && log.error.meta.payload.id) {
      log.links.event = `/logs/events/${log.error.meta.payload.event.id}`;
      log.links.function = `/logs/functions/${log.error.meta.payload.id}`;
    } else if (log.error?.meta?.error) {
      log.links.event = `/logs/events/${log.error.meta.eventId}`;
      log.links.function = `/logs/functions/${log.error.meta.funcId}`;
    } else if (log.event?.meta?.eventId) {
      log.links.functions = `/logs/events/${log.event.meta.eventId}`;
    } else if (log.function?.meta?.eventId) {
      log.links.event = `/logs/events/${log.function?.meta?.eventId}`;
    } else if (log.function?.funcId) {
      log.links.logs = `/logs/functions/${log.function.funcId}`;
    }
  });
}
