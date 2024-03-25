import log from "./logUtils";
import { Job } from "graphile-worker";

export const MAX_ATTEMPTS = 20;

export const handleRetries = (
  job: Job,
  error: Error,
  isInvalidPayload?: true
): void => {
  if (isDeadLetter(job, isInvalidPayload)) {
    let message: string;
    if (isInvalidPayload) {
      message = "Dead letter: Invalid payload";
    } else message = "Dead letter: Max attempts limit reached";

    log.error(message, {
      isDeadLetter: true,
      taskType: job.task_identifier === "process_event" ? "event" : "job",
      error,
      payload: job.payload,
      attempts: job.attempts,
      max_attempts: job.max_attempts,
    });
  } else {
    throw error;
  }
};

const isDeadLetter = (
  job: Job,
  isInvalidPayload: true | undefined
): boolean => {
  return isInvalidPayload || job.attempts >= job.max_attempts;
};
