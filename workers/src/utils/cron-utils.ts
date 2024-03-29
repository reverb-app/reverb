import { Secret } from "../types/types";
import { makeWorkerUtils, parseCronItem, run } from "graphile-worker";
import type { Runner, ParsedCronItem, CronItem } from "graphile-worker";
import processCron from "../tasks/process-cron";
import updateCron from "../tasks/update-cron";
import vacuumDb from "../tasks/vacuum-db";

const secret = process.env.DB_SECRET;
export let connectionString = process.env.GRAPHILE_CONNECTION_STRING;

if (secret) {
  const value = JSON.parse(secret) as Secret;
  connectionString = `postgresql://${value.username}:${value.password}@${value.host}:${value.port}${process.env.GRAPHILE_ENDPOINT}?ssl=no-verify`;
}

let cronRunner: Runner | undefined;

export const waitForDB = async () => {
  const utils = await makeWorkerUtils({ connectionString });

  let hashExists;
  await utils.withPgClient(async (client) => {
    const result = await client.query("SELECT * FROM hash");
    if (result.rows.length > 0) hashExists = true;
  });
  if (hashExists) return;

  utils.logger.info(
    "Waiting for functions data to populate in the database..."
  );
  return new Promise<void>((res) => {
    const id = setInterval(() => {
      utils.withPgClient(async (client) => {
        const result = await client.query("SELECT * FROM hash");
        if (result.rows.length > 0) {
          clearInterval(id);
          res();
        }
      });
    }, 5000);
  });
};

export const startCronRunner = async () => {
  if (cronRunner) {
    cronRunner.stop();
    await cronRunner.promise;
  }

  const parsedCrons: ParsedCronItem[] = [];

  const utils = await makeWorkerUtils({ connectionString });
  utils.withPgClient(async (client) => {
    const hash = (await client.query("SELECT hash FROM hash")).rows[0].hash;
    const cronFuncs = (
      await client.query(
        "SELECT name, cron FROM functions WHERE cron IS NOT NULL"
      )
    ).rows;

    cronFuncs.forEach((cronFunc) => {
      const cronItem: CronItem = {
        task: "process_cron",
        match: cronFunc.cron,
        identifier: cronFunc.name,
        payload: { funcName: cronFunc.name },
      };

      parsedCrons.push(parseCronItem(cronItem));
    });

    parsedCrons.push(
      parseCronItem({
        task: "update_cron",
        match: "*/30 * * * *",
        identifier: hash,
        payload: { hash },
      }),
      parseCronItem({
        task: "vacuum_db",
        match: "0 0 * * *",
        identifier: "vacuum",
      })
    );
  });

  cronRunner = await run({
    connectionString,
    parsedCronItems: parsedCrons,
    concurrency: 2,
    noHandleSignals: false,
    taskList: {
      process_cron: processCron,
      update_cron: updateCron,
      vacuum_db: vacuumDb,
    },
  });
};
