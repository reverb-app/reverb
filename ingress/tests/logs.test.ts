import request from 'supertest';
import app from '../src/ingress';
import { ObjectId } from 'mongodb';

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
    _id: new ObjectId("6602ea8a02a74bde96e81d1b"),
    timestamp: new Date("2024-03-26T15:32:26.253Z"),
    level: "info",
    message: "Event fired",
    meta: {
      eventId: "7583c224-07da-4522-b87c-41e7fdc00e0b",
      eventName: "error",
      timestamp: "2024-03-26T15:32:26.253Z"
    }
  },
  {
    _id: new ObjectId("6602ea8a02a74bde96e81d1c"),
    timestamp: new Date("2024-03-26T15:32:26.254Z"),
    level: "info",
    message: "Function invoked",
    meta: {
      eventId: "7583c224-07da-4522-b87c-41e7fdc00e0b",
      funcName: "error-function",
      funcId: "18a85c96-5fbd-4ee8-ad6f-b69a5a9ce669",
      timestamp: "2024-03-26T15:32:26.253Z"
    }
  },
  {
    _id: new ObjectId("6602ea8b02a74bde96e81d1e"),
    timestamp: new Date("2024-03-26T15:32:27.287Z"),
    level: "info",
    message: "Event fired",
    meta: {
      eventId: "f2e971d9-7454-4aaa-879a-64786f1dcf91",
      eventName: "error",
      timestamp: "2024-03-26T15:32:27.287Z"
    }
  },
  {
    _id: new ObjectId('66043a101bcef49eb60c2773'),
    timestamp: new Date('2024-03-27T15:24:00.085Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      funcId: 'b576e112-4498-4318-be0b-2f4d81212c45',
      funcName: 'cron-function',
      cron: true,
      timestamp: '2024-03-27T15:24:00.082Z'
    }
  },
  {
    _id: new ObjectId('6604805509121032ff8b7e3b'),
    timestamp: new Date('2024-03-27T20:23:49.789Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      eventId: '7196f127-5373-42c3-a244-2e4a34dd3c31',
      funcName: 'step-function',
      funcId: 'a9f40c3a-abc3-4765-b3ff-9dd17abeecfa',
      timestamp: '2024-03-27T20:23:49.773Z'
    }
  },
  {
    _id: new ObjectId('6604805509121032ff8b7e3c'),
    timestamp: new Date('2024-03-27T20:23:49.818Z'),
    level: 'info',
    message: 'Step complete',
    meta: {
      funcId: 'a9f40c3a-abc3-4765-b3ff-9dd17abeecfa',
      eventId: '7196f127-5373-42c3-a244-2e4a34dd3c31',
      stepId: 'phone person',
      stepValue: null,
      timestamp: '2024-03-27T20:23:49.818Z'
    }
  },
  {
    _id: new ObjectId('6604805509121032ff8b7e3d'),
    timestamp: new Date('2024-03-27T20:23:49.828Z'),
    level: 'info',
    message: 'Delay initiated',
    meta: {
      funcId: 'a9f40c3a-abc3-4765-b3ff-9dd17abeecfa',
      eventId: '7196f127-5373-42c3-a244-2e4a34dd3c31',
      stepId: 'some delay',
      delay: 90000,
      timestamp: '2024-03-27T20:23:49.827Z'
    }
  },
  {
    _id: new ObjectId('6604806009121032ff8b7e3e'),
    timestamp: new Date('2024-03-27T20:24:00.047Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      funcId: '0ab21eb9-8a4f-4f27-804c-ff94fe7a444e',
      funcName: 'cron-function',
      cron: true,
      timestamp: '2024-03-27T20:24:00.046Z'
    }
  },
  {
    _id: new ObjectId('6604806009121032ff8b7e3f'),
    timestamp: new Date('2024-03-27T20:24:00.069Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      funcId: 'cf54d206-5add-44a6-8a4d-99e03a9a48d6',
      eventId: '',
      funcName: 'third-function',
      timestamp: '2024-03-27T20:24:00.068Z'
    }
  },
  {
    _id: new ObjectId('6604806009121032ff8b7e40'),
    timestamp: new Date('2024-03-27T20:24:00.070Z'),
    level: 'info',
    message: 'Invoked step complete',
    meta: {
      funcId: '0ab21eb9-8a4f-4f27-804c-ff94fe7a444e',
      eventId: '',
      stepId: 'call 3rd function',
      invokedFnId: 'cf54d206-5add-44a6-8a4d-99e03a9a48d6',
      timestamp: '2024-03-27T20:24:00.068Z'
    }
  },
  {
    _id: new ObjectId('6604806009121032ff8b7e41'),
    timestamp: new Date('2024-03-27T20:24:00.081Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: '0ab21eb9-8a4f-4f27-804c-ff94fe7a444e',
      eventId: '',
      timestamp: '2024-03-27T20:24:00.081Z'
    }
  },
  {
    _id: new ObjectId('6604806009121032ff8b7e42'),
    timestamp: new Date('2024-03-27T20:24:00.142Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: 'cf54d206-5add-44a6-8a4d-99e03a9a48d6',
      eventId: '',
      timestamp: '2024-03-27T20:24:00.142Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e43'),
    timestamp: new Date('2024-03-27T20:24:06.112Z'),
    level: 'info',
    message: 'Event fired',
    meta: {
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      eventName: 'event4',
      timestamp: '2024-03-27T20:24:06.111Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e44'),
    timestamp: new Date('2024-03-27T20:24:06.113Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      funcName: 'function-calls-function',
      funcId: 'df060030-3bda-48f7-8582-168a93e89ffe',
      timestamp: '2024-03-27T20:24:06.112Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e45'),
    timestamp: new Date('2024-03-27T20:24:06.126Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      funcId: 'dbcb5029-8c00-488c-a2e0-0fde5972cb99',
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      funcName: 'third-function',
      timestamp: '2024-03-27T20:24:06.126Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e46'),
    timestamp: new Date('2024-03-27T20:24:06.127Z'),
    level: 'info',
    message: 'Invoked step complete',
    meta: {
      funcId: 'df060030-3bda-48f7-8582-168a93e89ffe',
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      stepId: 'call 3rd function',
      invokedFnId: 'dbcb5029-8c00-488c-a2e0-0fde5972cb99',
      timestamp: '2024-03-27T20:24:06.126Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e47'),
    timestamp: new Date('2024-03-27T20:24:06.133Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: 'dbcb5029-8c00-488c-a2e0-0fde5972cb99',
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      timestamp: '2024-03-27T20:24:06.133Z'
    }
  },
  {
    _id: new ObjectId('6604806609121032ff8b7e48'),
    timestamp: new Date('2024-03-27T20:24:06.136Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: 'df060030-3bda-48f7-8582-168a93e89ffe',
      eventId: 'a8ef3097-c844-476d-ba5d-f6b2d1d7cc33',
      timestamp: '2024-03-27T20:24:06.136Z'
    }
  },
  {
    _id: new ObjectId('6604808109121032ff8b7e49'),
    timestamp: new Date('2024-03-27T20:24:33.245Z'),
    level: 'info',
    message: 'Event fired',
    meta: {
      eventId: '2f208d70-fd22-421a-94a8-ad863b036f40',
      eventName: 'error',
      timestamp: '2024-03-27T20:24:33.244Z'
    }
  },
  {
    _id: new ObjectId('6604808109121032ff8b7e4a'),
    timestamp: new Date('2024-03-27T20:24:33.247Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      eventId: '2f208d70-fd22-421a-94a8-ad863b036f40',
      funcName: 'error-function',
      funcId: '71457e0d-6991-44e5-8458-d0c12fb4e049',
      timestamp: '2024-03-27T20:24:33.245Z'
    }
  },
  {
    _id: new ObjectId('6604809209121032ff8b7e4e'),
    timestamp: new Date('2024-03-27T20:24:50.388Z'),
    level: 'info',
    message: 'Event fired',
    meta: {
      eventId: 'cfe1597d-2224-472f-9e35-61bd1895ea92',
      eventName: 'reverb_received_webhook',
      timestamp: '2024-03-27T20:24:50.388Z'
    }
  },
  {
    _id: new ObjectId('6604809209121032ff8b7e4f'),
    timestamp: new Date('2024-03-27T20:24:50.389Z'),
    level: 'info',
    message: 'Function invoked',
    meta: {
      eventId: 'cfe1597d-2224-472f-9e35-61bd1895ea92',
      funcName: 'webhook_test',
      funcId: 'ea6e1ebd-06fb-4c9d-a5af-01de3c02396a',
      timestamp: '2024-03-27T20:24:50.388Z'
    }
  },
  {
    _id: new ObjectId('6604809209121032ff8b7e50'),
    timestamp: new Date('2024-03-27T20:24:50.398Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: 'ea6e1ebd-06fb-4c9d-a5af-01de3c02396a',
      eventId: 'cfe1597d-2224-472f-9e35-61bd1895ea92',
      timestamp: '2024-03-27T20:24:50.398Z'
    }
  },
  {
    _id: new ObjectId('660480b009121032ff8b7e52'),
    timestamp: new Date('2024-03-27T20:25:20.045Z'),
    level: 'info',
    message: 'Step complete',
    meta: {
      funcId: 'a9f40c3a-abc3-4765-b3ff-9dd17abeecfa',
      eventId: '7196f127-5373-42c3-a244-2e4a34dd3c31',
      stepId: 'email person',
      stepValue: null,
      timestamp: '2024-03-27T20:25:20.044Z'
    }
  },
  {
    _id: new ObjectId('660480b009121032ff8b7e53'),
    timestamp: new Date('2024-03-27T20:25:20.057Z'),
    level: 'info',
    message: 'Function completed',
    meta: {
      funcId: 'a9f40c3a-abc3-4765-b3ff-9dd17abeecfa',
      eventId: '7196f127-5373-42c3-a244-2e4a34dd3c31',
      timestamp: '2024-03-27T20:25:20.057Z'
    }
  }
]

beforeEach(() => {
  jest.mock("../src/services/mongo-service", () => {
    const logsCollection = {
      logs: MOCK_LOGS,

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

    };

    const client = {
      db() {
        return {
          collection() { return logsCollection }
        }
      }
    }

    return { client, db: '', logsCollection }
  });
});


afterEach(() => {
  jest.resetAllMocks();
})

describe('GET /logs', () => {
  test('should return 200 and logs with pagination links', async () => {
    const response = await request(app).get('/logs');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('logs');
    expect(response.body).toHaveProperty('links');
    console.log(response.body.logs)
  });

  test('when no limit specified, should return 200 with 10 log entries', async () => {
    const response = await request(app).get('/logs');

    expect(response.status).toBe(200);
    expect(response.body.logs.length).toEqual(10);
  });

  test('with limit of 1 should return 200 with one log', async () => {
    const limit = '1';
    const response = await request(app).get(`/logs?limit=${limit}`);

    expect(response.status).toBe(200);
    expect(response.body.logs.length).toEqual(1);
  });

  test('should return 400 with error message if startTime is invalid', async () => {
    const response = await request(app).get('/logs/?startTime=invalid&endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is invalid', async () => {
    const response = await request(app).get('/logs/?startTime=2024-03-26T15:32:27.287Z&endTime=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if startTime is present but endTime is missing', async () => {
    const response = await request(app).get('/logs/?startTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is present but startTime is missing', async () => {
    const response = await request(app).get('/logs/?endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if cursor filter is invalid', async () => {
    const response = await request(app).get('/logs/?cursor=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('GET /logs/events', () => {
  test('should return 200 and event logs with pagination links', async () => {
    const response = await request(app).get('/logs/events');
    console.log(response.body)
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('logs');
    expect(response.body).toHaveProperty('links');
  });

  test('should return 404 if page is not found', async () => {
    const response = await request(app).get('/logs/events?page=9999');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Page not found' });
  });

  test('should return 400 with error message if startTime is invalid', async () => {
    const response = await request(app).get('/logs/events?startTime=invalid&endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is invalid', async () => {
    const response = await request(app).get('/logs/events/?startTime=2024-03-26T15:32:27.287Z&endTime=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if startTime is present but endTime is missing', async () => {
    const response = await request(app).get('/logs/events/?startTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is present but startTime is missing', async () => {
    const response = await request(app).get('/logs/events/?endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('GET /logs/functions', () => {
  test('should return 200 and logs with pagination links', async () => {
    const response = await request(app).get('/logs/functions');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('logs');
    expect(response.body).toHaveProperty('links');
  });

  test('should return 404 if page is not found', async () => {
    const response = await request(app).get('/logs/functions?page=9999');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Page not found' });
  });

  test('should return 400 with error message if startTime is invalid', async () => {
    const response = await request(app).get('/logs/functions?startTime=invalid&endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is invalid', async () => {
    const response = await request(app).get('/logs/functions/?startTime=2024-03-26T15:32:27.287Z&endTime=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if startTime is present but endTime is missing', async () => {
    const response = await request(app).get('/logs/functions/?startTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return 400 with error message if endTime is present but startTime is missing', async () => {
    const response = await request(app).get('/logs/functions/?endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('should return a function log filtered by ID', async () => {
    const id = '76be1433-64fb-459d-aee2-42884e109acf';
    const response = await request(app).get(`/logs/functions?id=${id}`);
    expect(response.status).toBe(200);
    expect(response.body.logs.every((log: any) => log.function.funcId === id)).toBe(true);
  });
});

describe('GET logs/events/:eventId', () => {
  test('should return logs for a specific event ID', async () => {
    const eventId = '6602ea8802a74bde96e81d15';
    const response = await request(app).get(`/logs/events/${eventId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('eventId', eventId);
  });
});

describe('GET logs/functions/:funcId', () => {
  test('should return logs for a specific function ID', async () => {
    const funcId = 'ea6e1ebd-06fb-4c9d-a5af-01de3c02396a';
    const response = await request(app).get(`/logs/functions/${funcId}`);
    expect(response.status).toBe(200);
  });

  test('should return 404 if function ID does not exist', async () => {
    const funcId = 'invalid';
    const response = await request(app).get(`/logs/functions/${funcId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Function not found' });
  });
});

describe('GET logs/errors', () => {
  test('should return error logs', async () => {
    const response = await request(app).get('/logs/errors');
    expect(response.status).toBe(200);
    console.log(response.body.logs);
  });

  test('should return 404 if page is not found', async () => {
    const response = await request(app).get('/logs/errors?page=100');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Page not found' });
  });
});
