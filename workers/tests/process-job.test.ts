import process_job from '../tasks/process-job';
import { JobHelpers } from "graphile-worker";

const correctJob = {
  name: 'test',
  event: { name: 'test', payload: 'test' },
};

const incorrectJobOne = {
  name: 'test',
};

const incorrectJobTwo = {
  event: { name: 'test', payload: 'test' },
};

test('incorrect job throws an error', () => {
  expect(() => process_job(incorrectJobOne, {} as JobHelpers)).rejects.toThrow();
  expect(() => process_job(incorrectJobTwo, {} as JobHelpers)).rejects.toThrow();
});

test('throws an error when it can\'t connect to Function server', () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('failed')));
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('throws an error when invalid RPCResponse', () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: async () => { return {} } })) as jest.Mock;
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('throws an error on valid RPCResponse that has an error property', () => {
  let errorRPCResponse = {
    error: 'error',
    id: 'id'
  };
  global.fetch = jest.fn(() => Promise.resolve({ json: async () => { return errorRPCResponse } })) as jest.Mock;
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();

  let newErrorRPCResponse = {
    error: new Error('error'),
    id: 'id'
  };
  global.fetch = jest.fn(() => Promise.resolve({ json: async () => { return newErrorRPCResponse } })) as jest.Mock;
  expect(() => process_job(correctJob, {} as JobHelpers)).rejects.toThrow();
});

test('does not throw an error on valid RPC response that has a result property', async () => {
  let resultRPCResponse = {
    result: {},
    id: 'id'
  };
  global.fetch = jest.fn(() => Promise.resolve({ json: async () => { return resultRPCResponse } })) as jest.Mock;

  (process_job(correctJob, {} as JobHelpers) as Promise<void>).then((val) => expect(val).toBeUndefined());
});
