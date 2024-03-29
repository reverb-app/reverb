import processCron from "../tasks/process-cron";
import { JobHelpers, AddJobFunction, Job } from "graphile-worker";
import { CronPayload, Event, FunctionPayload } from "../types/types";
import log from "../utils/logUtils";

const validCronJob: CronPayload = { funcName: "my-function" };

const funcPayload: FunctionPayload = {
  name: "my-function",
  id: "uuid1234567891011121314",
  event: { name: "event1", id: "uuid1234567891011121315" },
  cache: {},
};

const eventPayload: Event = {
  name: "event1",
  id: "uuid1234567891011121315",
  payload: { test: true },
};

jest.mock("../utils/logUtils", () => {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
  };
});

jest.spyOn(log, "info");
jest.spyOn(log, "warn");
jest.spyOn(log, "error");

const mockAddJob: AddJobFunction = jest.fn(async (task, payload) => {
  if (!!payload && typeof payload === "object" && "funcName" in payload) {
    return {
      payload: { name: payload.funcName },
      attempts: 1,
      max_attempts: 5,
    } as Job;
  } else {
    return { payload: {}, attempts: 1, max_attempts: 5 } as Job;
  }
});

const mockHelpers = {
  job: {
    payload: {},
    attempts: 1,
    max_attempts: 5,
  },
  addJob: mockAddJob,
} as JobHelpers;

beforeEach(() => {
  jest.clearAllMocks();
});

test("invalid cron job throws an error", async () => {
  await expect(processCron(funcPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
  await expect(processCron(eventPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
});

test("addJob is called with the correct arguments", async () => {
  await processCron(validCronJob, mockHelpers);
  expect(mockHelpers.addJob).toHaveBeenCalledWith(
    "process_job",
    expect.objectContaining({
      name: "my-function",
      id: expect.any(String),
      event: { name: "cron", id: "" },
      cache: {},
    }),
    { maxAttempts: expect.any(Number) }
  );
});

test("logs an error on incorrect job", async () => {
  try {
    await processCron(funcPayload, mockHelpers);
  } catch {
  } finally {
    expect(log.error).toHaveBeenCalledTimes(1);
  }
});

test("logs on function payload enqueued", async () => {
  await processCron(validCronJob, mockHelpers);
  expect(log.info).toHaveBeenCalledTimes(1);
});
