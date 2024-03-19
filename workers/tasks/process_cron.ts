import { Task } from "graphile-worker";
import { v4 } from "uuid";
import log from "../utils/logUtils";
import { isValidCronPayload } from "../utils/utils";

const process_cron: Task = async function (cronJob, helpers) {
  if (!isValidCronPayload(cronJob)) {
    log.error("Cron format is not valid", { cronJob });
    throw new Error(`Cron format is not valid: ${cronJob}`);
  }

  const funcId = v4();
  helpers.addJob("process_job", {
    name: cronJob.funcName,
    id: funcId,
    event: { name: "cron", id: "" },
    cache: {},
  });

  log.info("Invoked function", {
    funcId,
    funcName: cronJob.funcName,
    cron: true,
  });
};

export default process_cron;
