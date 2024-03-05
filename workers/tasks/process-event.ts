import { Task } from "graphile-worker";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "event_functions",
});
interface Event {
  name: string;
  payload?: unknown;
}

const isValidEvent = (event: unknown): event is Event => {
  return (
    !!event &&
    typeof event === "object" &&
    "name" in event &&
    typeof event.name === "string"
  );
};

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
      fetch(`${"http://localhost:3002"}/calls`, {
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
