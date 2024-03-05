import { Pool } from "pg";
import { Event } from "../types/types";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "graphile1",
});

export const addEvent = async (event: Event): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `SELECT graphile_worker.add_job('process_event', $1,'event_processing_queue');`,
      [event]
    );
  } finally {
    client.release();
  }
};
