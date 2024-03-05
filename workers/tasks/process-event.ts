import { Task } from "graphile-worker";
import { Pool } from "pg";
import { isValidEvent } from "../utils/utils";

const pool = new Pool({
  host: process.env.FUNCTION_DATABASE_HOST,
  port: Number(process.env.FUNCTION_DATABASE_PORT),
  database: process.env.FUNCTION_DATABASE_NAME,
});

const functionServerUrl: string = process.env.FUNCTION_SERVER_URL ?? "";

const process_event: Task = async function (event, helpers) {
  const client = await pool.connect();

  if (!isValidEvent(event)) {
    return;
  }

  try {
    const names = (
      await client.query(
        `SELECT functions.name FROM functions JOIN events ON functions.event_id = events.id WHERE events.name = $1;`,
        [event.name]
      )
    ).rows.map(obj => obj.name);
    console.log(names);
    names.forEach(funcId => {
      fetch(functionServerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: funcId,
          params: { event },
        }),
      });
    });
  } finally {
    client.release();
  }
};

export default process_event;
