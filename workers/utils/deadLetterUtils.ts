import log from "./logUtils";
import { Job } from "graphile-worker";
import { DeadLetterType } from "../types/types";
import { isValidFunctionPayload, isValidEvent } from "./utils";

export const MAX_ATTEMPTS = 20;

export const handleRetries = (job: Job, error: Error): void => {
  let task_type: DeadLetterType = "function";
  if (job.task_identifier === "process_event") task_type = "event";

  if (job.attempts === job.max_attempts) {
    log.error("Max attempts limit reached", {
      error,
      task_type,
      payload: job.payload,
      attempts: job.attempts,
      max_attempts: job.max_attempts,
    });
  } else {
    throw error;
  }
};
