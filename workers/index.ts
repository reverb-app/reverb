import { run } from "graphile-worker";
import process_event from "./tasks/process-event";

async function main() {
  const runner1 = await run({
    connectionString: "postgres:///graphile1",
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
