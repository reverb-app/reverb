import dotenv from "dotenv";
dotenv.config();

import { run } from "graphile-worker";
import processEvent from "./tasks/process-event";
import processJob from "./tasks/process-job";
import {
  waitForDB,
  connectionString,
  startCronRunner,
} from "./utils/cronUtils";

async function main() {
  await waitForDB();

  await startCronRunner();

  const runner = await run({
    connectionString,
    concurrency: 10,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      process_event: processEvent,
      process_job: processJob,
    },
  });
  await runner.promise;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
