import { client, dbName } from '../services/mongo-service';
import { Request } from 'express';

export async function getPaginatedLogs(
  offset: number,
  limit: number,
  filter: {} = {},
  sort: {} = {}
): Promise<any[]> {
  try {
    const database = client.db(dbName);
    const collection = database.collection('logs');
    const logs = await collection.find(filter).sort(sort).skip(offset).limit(limit).toArray();
    return logs;
  } catch (error) {
    throw new Error('Error retrieving logs from MongoDB');
  }
}

const MAX_LIMIT = 50;

export function handlePagination(req: Request): { page: number, limit: number, offset: number } {
  let limit = parseInt(req.query.limit as string) || 10;
  limit = Math.min(limit, MAX_LIMIT);
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}