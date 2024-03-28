import process_cron from "../tasks/process_cron";
import { JobHelpers } from "graphile-worker";
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

const mockHelpers = {
  job: {
    payload: {},
    attempts: 0,
    max_attempts: 0,
  },
} as JobHelpers;

beforeEach(() => {
  jest.clearAllMocks();
});

test("incorrect cron job throws an error", () => {
  expect(() => process_cron(funcPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
  expect(() => process_cron(eventPayload, mockHelpers)).rejects.toThrow(
    /Cron format is not valid/
  );
});

// test("correct cron job does not throw an error", () => {
//   expect(() => process_cron(validCronJob, {}));
// });
