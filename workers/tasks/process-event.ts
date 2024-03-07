import { Task } from "graphile-worker";
import { Pool } from "pg";
import { isValidEvent } from "../utils/utils";

const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
});

const process_event: Task = async function (event, helpers) {
  const client = await pool.connect();

  if (!isValidEvent(event)) {
    throw new Error(`${event} is not a valid event`);
  }

  try {
    const names = (
      await client.query(
        `SELECT functions.name FROM functions JOIN events ON functions.event_id = events.id WHERE events.name = $1;`,
        [event.name]
      )
    ).rows.map((obj) => obj.name);

    names.forEach((funcId) => {
      helpers.addJob("process_job", { name: funcId, event });
    });
  } finally {
    client.release();
  }
};

export default process_event;
