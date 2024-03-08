import dotenv from 'dotenv';
dotenv.config();

import { Runner, run } from 'graphile-worker';
import process_event from './tasks/process-event';
import process_job from './tasks/process-job';
import { Secret } from './types/types';

async function main() {
  const secret = process.env.DB_SECRET;
  let connectionString = process.env.GRAPHILE_CONNECTION_STRING;

  if (secret) {
    const value = JSON.parse(secret) as Secret;
    connectionString = `postgresql://${value.username}:${value.password}@${value.host}:${value.port}${process.env.GRAPHILE_ENDPOINT}?ssl=no-verify`;
  }

  const runner = await run({
    connectionString,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      process_event,
      process_job,
    },
  });
  await runner.promise;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
