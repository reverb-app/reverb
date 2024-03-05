import { run } from "graphile-worker";
import dotenv from "dotenv";
dotenv.config();
import process_event from "./tasks/process-event";
import process_job from "./tasks/process-job";

async function main() {
  const runner1 = await run({
    connectionString: process.env.GRAPHILE_CONNECTION_STRING,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      process_event,
      process_job,
    },
  });

  await runner1.promise;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
