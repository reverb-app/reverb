import process_job from '../tasks/process-job';
import { JobHelpers } from 'graphile-worker';
import log from '../utils/logUtils';

const correctJob = {
  name: 'test',
  id: '',
  event: { name: 'test', payload: 'test', type: 'complete' },
  cache: {},
};

const incorrectJobOne = {
  name: 'test',
};

const incorrectJobTwo = {
  event: { name: 'test', payload: 'test' },
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

test('incorrect job throws an error', () => {
  expect(() =>
    process_job(incorrectJobOne, {} as JobHelpers)
  ).rejects.toThrow();
  expect(() =>
    process_job(incorrectJobTwo, {} as JobHelpers)
  ).rejects.toThrow();
});

test("throws an error when it can't connect to Function server", () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('failed')));
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('throws an error when invalid RPCResponse', () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: async () => {
        return {};
      },
    })
  ) as jest.Mock;
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('throws an error on valid RPCResponse that has an error property', () => {
  let errorRPCResponse = {
    error: 'error',
    id: 'id',
  };
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: async () => {
        return errorRPCResponse;
      },
    })
  ) as jest.Mock;
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('does not throw an error on valid RPC response that has a result property', async () => {
  let resultRPCResponse = {
    result: {
      type: 'complete',
      stepId: 'step-id',
      stepValue: 'any',
    },
    id: 'id',
  };
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: async () => {
        return resultRPCResponse;
      },
    })
  ) as jest.Mock;

  (process_job(correctJob, {} as JobHelpers) as Promise<void>).then((val) =>
    expect(val).toBeUndefined()
  );
});

describe('Logger', () => {
  test('logs an error on incorrect job', async () => {
    try {
      await process_job(incorrectJobOne, {} as JobHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test("logs an error when it can't connect to Function server", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('failed')));
    try {
      await process_job(correctJob, {} as JobHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test('logs an error when invalid RPCResponse', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return {};
        },
      })
    ) as jest.Mock;

    try {
      await process_job(correctJob, {} as JobHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test('logs an error on valid RPCResponse that has an error property', async () => {
    let errorRPCResponse = {
      error: 'error',
      id: 'id',
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return errorRPCResponse;
        },
      })
    ) as jest.Mock;

    try {
      await process_job(correctJob, {} as JobHelpers);
    } catch {
    } finally {
      expect(log.error).toHaveBeenCalled();
    }
  });

  test('logs a warning on RPCResponse without result field', async () => {
    let resultRPCResponse = {
      id: 'id',
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {} as JobHelpers);
    expect(log.warn).toHaveBeenCalled();
  });

  test('logs on function complete', async () => {
    let resultRPCResponse = {
      id: 'id',
      result: {
        type: 'complete',
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {} as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test('logs on step.run', async () => {
    let resultRPCResponse = {
      id: 'id',
      result: {
        type: 'step',
        stepId: 'string',
        stepValue: 'any',
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {
      addJob: () => {},
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test('logs on step.delay', async () => {
    let resultRPCResponse = {
      id: 'id',
      result: {
        type: 'delay',
        stepId: 'string',
        delayInMs: 0,
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {
      addJob: () => {},
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test('logs on step.invoke', async () => {
    let resultRPCResponse = {
      id: 'id',
      result: {
        type: 'invoke',
        stepId: 'string',
        invokedFnName: 'string',
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {
      addJob: () => {},
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });

  test('logs on step.emitEvent', async () => {
    let resultRPCResponse = {
      id: 'id',
      result: {
        type: 'emitEvent',
        stepId: 'string',
        eventId: 'string',
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: async () => {
          return resultRPCResponse;
        },
      })
    ) as jest.Mock;

    await process_job(correctJob, {
      addJob: () => {},
    } as unknown as JobHelpers);
    expect(log.info).toHaveBeenCalled();
  });
});
