import processEvent from "../src/tasks/process-event";
import { JobHelpers } from "graphile-worker";
import { v4 } from "uuid";
import log from "../src/utils/log-utils";

const correctEvent = {
  name: "test_event",
  id: v4(),
  payload: { key: "value" },
};

const incorrectEventOne = {
  id: v4(),
};

const incorrectEventTwo = {
  name: "test_event",
};

jest.mock("../src/utils/logUtils", () => {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
  };
});

jest.spyOn(log, "info");
jest.spyOn(log, "warn");
jest.spyOn(log, "error");

beforeEach(() => {
  jest.clearAllMocks();
});

const mockHelpers = {
  job: {
    payload: {},
    attempts: 0,
    max_attempts: 0,
  },
} as JobHelpers;

test("invalid event format dead letter queues and resolves", () => {
  expect(processEvent(incorrectEventOne, mockHelpers)).resolves.toBeUndefined();

  expect(log.error).toHaveBeenCalledTimes(2);
});

describe("Logger", () => {
  test("logs an error on incorrect job", async () => {
    try {
      await processEvent(incorrectEventOne, mockHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test("logs on event complete", async () => {
    await processEvent(correctEvent, {
      addJob: () => {},
      query: () => {
        return { job: mockHelpers.job, rows: [{ name: "test_function" }] };
      },
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test("logs a warning when event has no functions", async () => {
    await processEvent(correctEvent, {
      query: () => {
        return {
          job: mockHelpers.job,
          rows: [],
        };
      },
    } as unknown as JobHelpers);

    expect(log.warn).toHaveBeenCalled();
  });

  test("logs for each function invoked by event", async () => {
    await processEvent(correctEvent, {
      addJob: () => {},
      query: () => {
        return {
          job: mockHelpers.job,
          rows: [{ name: "test_function1" }, { name: "test_function2" }],
        };
      },
    } as unknown as JobHelpers);

    expect(log.info).toHaveBeenCalledTimes(3);
  });
});
