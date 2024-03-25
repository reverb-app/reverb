import log from "./logUtils";
import { Job } from "graphile-worker";
import { DeadLetterType } from "../types/types";
import { isValidFunctionPayload, isValidEvent } from "./utils";

export const MAX_ATTEMPTS = 20;

export const handleRetries = (job: Job, error: Error): void => {
  let task_type: DeadLetterType = "job";
  if (job.task_identifier === "process_event") task_type = "event";

  if (isDeadLetter(job, task_type)) {
    let message: string;
    if (job.attempts === job.max_attempts) {
      message = "Dead letter: Max attempts limit reached";
    } else message = "Dead letter: Invalid payload";

    log.error(message, {
      dead_letter: true,
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

const isValidPayload = (type: DeadLetterType, payload: unknown): boolean => {
  if (type === "event" && isValidEvent(payload)) return true;
  if (type === "job" && isValidFunctionPayload(payload)) return true;
  return false;
};

const isDeadLetter = (job: Job, type: DeadLetterType): boolean => {
  return (
    !isValidPayload(type, job.payload) || job.attempts === job.max_attempts
  );
};
