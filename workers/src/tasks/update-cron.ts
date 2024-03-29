import { Task } from "graphile-worker";
import log from "../utils/log-utils";
import { isValidUpdateCronPayload } from "../utils/utils";
import { startCronRunner } from "../utils/cron-utils";

const updateCron: Task = async function (job, helpers) {
  const dbHash = (await helpers.query("SELECT hash FROM hash")).rows[0].hash;

  if (!isValidUpdateCronPayload(job)) {
    log.error(`Invalid update cron payload: ${job}`);
    throw new Error(`Invalid update cron payload: ${job}`);
  }

  if (job.hash === dbHash) return;

  startCronRunner();
};

export default updateCron;
