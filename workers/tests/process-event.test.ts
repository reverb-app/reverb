import process_event from '../tasks/process-event';
import { JobHelpers } from 'graphile-worker';
import { v4 } from 'uuid';

const correctEvent = {
  name: 'test_event',
  id: v4(),
  payload: { key: 'value' },
};

const incorrectEventOne = {
  id: v4()
};

const incorrectEventTwo = {
  name: 'test_event'
};

jest.mock('../utils/logUtils', () => ({
  ...jest.requireActual('../utils/logUtils'),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// test('incorrect event throws an error', () => {
//   expect(() => process_event(incorrectEventOne, {} as JobHelpers)).rejects.toThrow();
//   expect(() => process_event(incorrectEventTwo, {} as JobHelpers)).rejects.toThrow();
// })

test('', () => {
  expect(true).toBeTruthy();
})