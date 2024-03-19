import process_event from '../tasks/process-event';
import { JobHelpers } from 'graphile-worker';
import { v4 } from 'uuid';
import log from '../utils/logUtils';

const correctEvent = {
  name: 'test_event',
  id: v4(),
  payload: { key: 'value' },
};

const incorrectEventOne = {
  id: v4(),
};

const incorrectEventTwo = {
  name: 'test_event',
};

jest.mock('../utils/logUtils', () => {
  const winston = require('winston');

  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        silent: true,
      }),
    ],
  });
});

const info = jest.spyOn(log, 'info');
info.mockImplementation((_) => log);
const warn = jest.spyOn(log, 'warn');
warn.mockImplementation((_) => log);
const error = jest.spyOn(log, 'error');
error.mockImplementation((_) => log);

beforeEach(() => {
  jest.clearAllMocks();
});

test('incorrect event throws an error', () => {
  expect(() =>
    process_event(incorrectEventOne, {} as JobHelpers)
  ).rejects.toThrow();
  expect(() =>
    process_event(incorrectEventTwo, {} as JobHelpers)
  ).rejects.toThrow();
});

describe('Logger', () => {
  test('logs an error on incorrect job', async () => {
    try {
      await process_event(incorrectEventOne, {} as JobHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test('logs on event complete', async () => {
    await process_event(correctEvent, {
      addJob: () => {},
      query: () => {
        return { rows: [{ name: 'test_function' }] };
      },
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test('logs a warning when event has no functions', async () => {
    await process_event(correctEvent, {
      query: () => {
        return { rows: [] };
      },
    } as unknown as JobHelpers);

    expect(log.warn).toHaveBeenCalled();
  });

  test('logs for each function invoked by event', async () => {
    await process_event(correctEvent, {
      addJob: () => {},
      query: () => {
        return {
          rows: [{ name: 'test_function1' }, { name: 'test_function2' }],
        };
      },
    } as unknown as JobHelpers);

    expect(log.info).toHaveBeenCalledTimes(3);
  });
});
