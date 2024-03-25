import { Task } from "graphile-worker";
import { isValidEvent } from "../utils/utils";
import { handleRetries } from "../utils/deadLetterUtils";
import { v4 } from "uuid";
import { MAX_ATTEMPTS } from "../utils/deadLetterUtils";
import log from "../utils/logUtils";

const process_event: Task = async function (event, helpers) {
  if (!isValidEvent(event)) {
    log.error("Event format is not valid", { event });

    return handleRetries(
      helpers.job,
      new Error(`${event} is not a valid event`)
    );
  }

  try {
    const names = (
      await helpers.query(
        `SELECT functions.name FROM functions JOIN events ON functions.event_id = events.id WHERE events.name = $1;`,
        [event.name]
      )
    ).rows.map(obj => obj.name);
    log.info("Event fired", { eventId: event.id, eventName: event.name });

    if (names.length === 0) {
      log.warn("Event is not configured to trigger any functions", {
        eventId: event.id,
        eventName: event.name,
      });
    }

    names.forEach(funcName => {
      const funcId = v4();
      helpers.addJob(
        "process_job",
        {
          name: funcName,
          event,
          id: funcId,
          cache: {},
        },
        { maxAttempts: MAX_ATTEMPTS }
      );
      log.info("Function invoked", { eventId: event.id, funcName, funcId });
    });
  } catch (e) {
    log.error("Querying function database failed.");
    if (e instanceof Error) return handleRetries(helpers.job, e);
  }
};

export default process_event;
