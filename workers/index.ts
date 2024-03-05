import { run } from "graphile-worker";
import dotenv from "dotenv";
dotenv.config();
import process_event from "./tasks/process-event";

async function main() {
  const runner1 = await run({
    connectionString: process.env.GRAPHILE_CONNECTION_STRING,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      process_event,
    },
  });

  await runner1.promise;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
