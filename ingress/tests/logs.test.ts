import request from 'supertest';
import app from '../src/ingress';
import { ObjectId } from 'mongodb';
import { client } from '../src/services/mongo-service'

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
    _id: new ObjectId('65f7444f7b6d63ad5390291a'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291b'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291c'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'warn',
    message: '',
    meta: null
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291d'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67891',
    eventId: '12346',
    result: ''
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291e'),
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
    _id: new ObjectId('65f7444f7b6d63ad5390291g'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'error',
    message: 'Did not receive a valid RPC response from function server',
    funcId: '67890',
    eventId: '12345',
    response: { error: 'Function not found' }
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291h'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: 'Function completed',
    funcId: '67890',
    eventId: '12345'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291i'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    stepValue: ''
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291j'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    delay: 5000
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291k'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    eventId: '12345',
    funcName: '',
    funcId: '67891'
  },
  {
    _id: new ObjectId('65f7444f7b6d63ad5390291l'),
    timestamp: new Date('2024-03-11T17:05:06.328Z'),
    level: 'info',
    message: '',
    funcId: '67890',
    eventId: '12345',
    stepId: '',
    invokedFnId: '67891'
  },
];

beforeEach(() => {
  jest.mock("../src/services/mongo-service", () => {
    const collection = {
      logs: [MOCK_LOGS],

      find(filter: { [key: string]: any }) {
        const filteredLogs = this.logs.filter(log => {
          for (const key in filter) {
            // @ts-ignore
            if (filter.hasOwnProperty(key) && log[key] !== filter[key]) {
              return false;
            }
          }
          return true;
        });
        this.logs = filteredLogs;
      },

      sort(sortParams: { [key: string]: number }) {
        const sortedLogs = [...this.logs].sort((a, b) => {
          for (const key in sortParams) {
            const order = sortParams[key];
            // @ts-ignore
            if (a[key] < b[key]) return -order;
            // @ts-ignore
            if (a[key] > b[key]) return order;
          }
          return 0;
        });
        this.logs = sortedLogs;
      },

      skip(num: number) {
        this.logs.slice(num)
      },

      search(num: number) {
        this.logs.slice(0, num)
      },

      aggregate() { }
    };

    const client = {
      db() {
        return {
          collection() { return collection }
        }
      }
    }

    return { client, dbName: '' }
  });
});

afterEach(() => {
  jest.resetAllMocks();
})

// test('GET request to /logs should return 200', async () => {
//   const test = new MongoMock(MOCK_LOGS);
//   console.log(test.find({ eventId: '12346' }))
// });

test('GET request to /logs should return 200', async () => {
  const response = await request(app).get('/logs/');

  expect(response.status).toBe(200);
  expect(response.body).toEqual(MOCK_LOGS);
});
