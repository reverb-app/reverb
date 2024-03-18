import request from 'supertest';
import { app } from '../src/server';
import functions from '../src/services/fn';
import { Client } from 'pg';
import { FunctionData } from 'types/types';

jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mockClient) };
});

let mockFunctions: FunctionData[] = [];

const createFunction = jest.spyOn(functions, 'createFunction');
createFunction.mockImplementation((data: FunctionData) => {
  mockFunctions.push(data);
});

const getFunction = jest.spyOn(functions, 'getFunction');
getFunction.mockImplementation((method: string) => {
  return mockFunctions.find((fn) => fn.id === method);
});

const getAllFunctions = jest.spyOn(functions, 'getAllFunctions');
getAllFunctions.mockImplementation(() => {
  const result: { [event: string]: string[] } = {};
  mockFunctions.forEach((func) => {
    if (!result[func.event]) result[func.event] = [];
    result[func.event].push(func.id);
  });

  return result;
});

beforeEach(() => {
  mockFunctions = [];
});

describe('POST /calls', () => {
  test('400s on no body', async () => {
    await request(app).post('/calls').expect(400);
  });

  test('400s with error if body has id, but is malformed', async () => {
    await request(app)
      .post('/calls')
      .send({ id: 123 })
      .expect(400)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('404s with no error if no function exists and no id given', async () => {
    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'notExist',
        params: { event: { id: 'test-event', name: 'sign-up' }, cache: {} },
      })
      .expect(404)
      .then((response) => {
        expect(response.body?.error).not.toBeTruthy();
      });
  });

  test('404s with error if no function exists and id given', async () => {
    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'notExist',
        params: { event: { id: 'test-event', name: 'sign-up' }, cache: {} },
        id: 404,
      })
      .expect(404)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('200s and runs function if exists', async () => {
    const mockFunction = jest.fn();
    functions.createFunction({
      id: 'iExist',
      event: 'sign-up',
      fn: mockFunction,
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'iExist',
        params: { event: { id: 'test-event', name: 'sign-up' }, cache: {} },
        id: 200,
      })
      .expect(200);

    expect(mockFunction).toHaveBeenCalled();
  });

  test('does not call wrong function', async () => {
    const mockFunction = jest.fn();
    functions.createFunction({
      id: 'iExist',
      event: 'sign-up',
      fn: mockFunction,
    });
    functions.createFunction({
      id: 'iAlsoExist',
      event: 'magnolia',
      fn: async () => {},
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'iAlsoExist',
        params: { event: { id: 'test-event', name: 'sign-up' }, cache: {} },
        id: 404,
      })
      .expect(200);
    expect(mockFunction).not.toHaveBeenCalled();
  });
});

describe('Database', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('does reinitialize on start if functions are changed', async () => {
    functions.createFunction({
      id: 'iExist',
      event: 'sign-up',
      fn: async () => {},
    });

    (client.query as jest.Mock).mockResolvedValue({
      rows: [functions.getFunctionsHash()],
    });

    await functions.setUpDb();

    expect(client.connect).toHaveBeenCalled();

    expect(client.query).toHaveBeenCalledWith('DELETE FROM functions');
    expect(client.query).toHaveBeenCalledWith('DELETE FROM events');
    expect(client.query).toHaveBeenCalledWith('DELETE FROM hash');

    expect(client.query).toHaveBeenCalledWith(
      `INSERT INTO hash VALUES '${functions.getFunctionsHash()}'`
    );

    expect(client.end).toHaveBeenCalled();
  });

  test('does not reinitialize on start if functions are unchanged', async () => {
    (client.query as jest.Mock).mockResolvedValue({
      rows: [{ hash: functions.getFunctionsHash() }],
    });

    await functions.setUpDb();

    expect(client.connect).toHaveBeenCalled();

    expect(client.query).not.toHaveBeenCalledWith('DELETE FROM functions');
    expect(client.query).not.toHaveBeenCalledWith('DELETE FROM events');
    expect(client.query).not.toHaveBeenCalledWith('DELETE FROM hash');

    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO/)
    );

    expect(client.end).toHaveBeenCalled();
  });
});

describe('step', () => {
  test('with complete cache returns response with complete type', async () => {
    functions.createFunction({
      id: 'step-run',
      event: 'step-run-event',
      fn: async (event, step) => {
        await step.run('test-step', async () => 'test');
      },
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: { 'test-step': 'test' },
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('complete');
      });
  });

  test('.run with incomplete cache returns response with step type', async () => {
    functions.createFunction({
      id: 'step-run',
      event: 'step-run-event',
      fn: async (event, step) => {
        await step.run('test-step', async () => 'test');
        await step.run('test-step2', async () => 'test2');
      },
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: {},
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('step');
      });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: { 'test-step': 'test' },
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('step');
      });
  });

  test('.delay with incomplete cache returns response with delay type', async () => {
    functions.createFunction({
      id: 'step-run',
      event: 'step-run-event',
      fn: async (event, step) => {
        await step.delay('test-step', '1m');
        await step.delay('test-step2', '2m');
      },
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: {},
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('delay');
      });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: { 'test-step': 'test' },
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('delay');
      });
  });

  test('.invoke with incomplete cache returns response with invoke type', async () => {
    functions.createFunction({
      id: 'invoked-function',
      event: 'emitted-event',
      fn: async () => {},
    });

    functions.createFunction({
      id: 'step-run',
      event: 'step-run-event',
      fn: async (event, step) => {
        await step.invoke('test-step', 'invoked-function');
        await step.invoke('test-step2', 'invoked-function');
      },
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: {},
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('invoke');
      });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: { 'test-step': 'test' },
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('invoke');
      });
  });

  test('.emitEvent with incomplete cache returns response with emitEvent type', async () => {
    functions.createFunction({
      id: 'invoked-function',
      event: 'emitted-event',
      fn: async () => {},
    });

    functions.createFunction({
      id: 'step-run',
      event: 'step-run-event',
      fn: async (event, step) => {
        await step.emitEvent('test-step', 'emitted-event');
        await step.emitEvent('test-step2', 'emitted-event');
      },
    });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: {},
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('emitEvent');
      });

    await request(app)
      .post('/calls')
      .send({
        jsonrpc: '2.0',
        method: 'step-run',
        params: {
          event: { id: 'test-event', name: 'step-run-event' },
          cache: { 'test-step': 'test' },
        },
        id: 200,
      })
      .then((response) => {
        expect(response.body?.result.type).toBe('emitEvent');
      });
  });
});
