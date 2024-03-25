import log from "./logUtils";
import { Job } from "graphile-worker";

export const MAX_ATTEMPTS = 20;

export const handleRetries = (job: Job, error: Error): void => {
  if (job.attempts === job.max_attempts) {
    log.error("Job has reached max attempts limit", {
      error,
      payload: job.payload,
      attempts: job.attempts,
      max_attempts: job.max_attempts,
    });
  } else {
    throw error;
  }
};
