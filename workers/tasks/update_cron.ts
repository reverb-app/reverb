import { Task } from "graphile-worker";
import { v4 } from "uuid";
import log from "../utils/logUtils";
import { isValidUpdateCronPayload } from "../utils/utils";
import { startCronRunner } from "../utils/dbUtils";

const update_cron: Task = async function (job, helpers) {
  const dbHash = (await helpers.query("SELECT hash FROM hash")).rows[0].hash;

  if (!isValidUpdateCronPayload(job)) {
    log.error(`Invalid update cron payload: ${job}`);
    throw new Error(`Invalid update cron payload: ${job}`);
  }

  if (job.hash === dbHash) return;

  startCronRunner();
};

export default update_cron;
