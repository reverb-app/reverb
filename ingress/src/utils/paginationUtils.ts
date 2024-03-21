import { client, dbName } from '../services/mongo-service';

export async function getPaginatedLogs(
  offset: number = 0,
  limit: number = 10,
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
