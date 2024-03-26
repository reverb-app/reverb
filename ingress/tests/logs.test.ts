import request from 'supertest';
import app from '../src/ingress';
import { ObjectId } from 'mongodb'

class MongoMock {
  logs;

  constructor(logs: { [key: string]: any }[]) {
    this.logs = logs;
  }

  find(filter: { [key: string]: any }) {
    const filteredLogs = this.logs.filter(log => {
      for (const key in filter) {
        if (filter.hasOwnProperty(key) && log[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    return new MongoMock(filteredLogs);
  }

  sort(sortParams: { [key: string]: number }) {
    const sortedLogs = [...this.logs].sort((a, b) => {
      for (const key in sortParams) {
        const order = sortParams[key];
        if (a[key] < b[key]) return -order;
        if (a[key] > b[key]) return order;
      }
      return 0;
    });
    return new MongoMock(sortedLogs);
  }

  skip(num: number) {
    return new MongoMock(this.logs.slice(num))
  }

  search(num: number) {
    return new MongoMock(this.logs.slice(0, num))
  }

  aggregate() { }
}
interface Log {
  _id: ObjectId;
  timestamp: Date;
  level: string;
  message: string;
  meta?: any;
  funcId?: string;
  eventId?: string;
  result?: string;
  functionId?: string;
  error?: string;
  response?: { error: string };
  stepId?: string;
  stepValue?: string;
  delay?: number;
  funcName?: string;
  invokedFnId?: string;
}

const MOCK_LOGS: Log[] = [
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'warn',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67891',
    eventId: '12346',
    result: ''
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: 'Not a valid Function Payload',
    functionId: '67890'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: 'Error communicating with function server',
    funcId: '67890',
    eventId: '12345',
    error: 'Timeout'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: 'Did not receive a valid RPC response from function server',
    funcId: '67890',
    eventId: '12345',
    response: { error: 'Function not found' }
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: 'Function completed',
    funcId: '67890',
    eventId: '12345'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    stepValue: ''
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    delay: 5000
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    eventId: '12345',
    funcName: '',
    funcId: '67891'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291f'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    invokedFnId: '67891'
  },
]

jest.mock("../src/services/mongo-service", () => {
  const client = new MongoMock(MOCK_LOGS);

  return { client, dbName: '' }
});

test('GET request to /logs should return 200', async () => {
  const test = new MongoMock(MOCK_LOGS);
  console.log(test.find({ eventId: '12346' }))
});

test('GET request to /logs should return 200', async () => {
  const test = new MongoMock(MOCK_LOGS);

  const response = await request(app).get('/');

  expect(response.status).toBe(200);
  expect(response.body).toEqual(MOCK_LOGS);
});
