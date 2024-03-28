import process_cron from "../tasks/process_cron";
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

const mockAddJob: AddJobFunction = async (task, payload) => {
  if (!!payload && typeof payload === "object" && "funcName" in payload) {
    return {
      payload: { name: payload.funcName },
      attempts: 1,
      max_attempts: 5,
    } as Job;
  } else {
    return { payload: {}, attempts: 1, max_attempts: 5 } as Job;
  }
};

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

test("invalid cron job throws an error", () => {
  expect(process_cron(funcPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
  expect(process_cron(eventPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
});
