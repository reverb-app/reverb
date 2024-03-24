import dotenv from "dotenv";
dotenv.config();

import { run } from "graphile-worker";
import process_event from "./tasks/process_event";
import process_job from "./tasks/process_job";
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
      process_event,
      process_job,
    },
  });
  await runner.promise;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
