import { Pool } from 'pg';
import { Event, Secret } from '../types/types';

let connectionString = process.env.GRAPHILE_CONNECTION_STRING;
const secret = process.env.DB_SECRET;
if (secret) {
  const value = JSON.parse(secret) as Secret;
  connectionString = `postgresql://${value.username}:${value.password}@${value.host}:${value.port}${process.env.GRAPHILE_ENDPOINT}?ssl=no-verify`;
}

const pool = new Pool({
  connectionString,
});

export const addEvent = async (event: Event): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `SELECT graphile_worker.add_job('process_event', $1,'event_processing_queue');`,
      [event]
    );
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
  } finally {
    client.release();
  }
};
