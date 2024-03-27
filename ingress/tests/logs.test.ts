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
    "_id": new ObjectId("6602ea8802a74bde96e81d15"),
    "timestamp": new Date("2024-01-02T15:32:24.521Z"),
    "level": "info",
    "message": "Event fired",
    "meta": {
      "eventId": "59e5a468-b952-402e-a6c3-69390dfb33fe",
      "eventName": "error",
      "timestamp": "2024-03-26T15:32:24.520Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8802a74bde96e81d16"),
    "timestamp": new Date("2024-03-26T15:32:24.525Z"),
    "level": "info",
    "message": "Function invoked",
    "meta": {
      "eventId": "59e5a468-b952-402e-a6c3-69390dfb33fe",
      "funcName": "error-function",
      "funcId": "a3ea0ec0-ed04-4f55-81ca-e2704de81d9c",
      "timestamp": "2024-03-26T15:32:24.521Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8802a74bde96e81d17"),
    "timestamp": new Date("2024-03-26T15:32:24.550Z"),
    "level": "error",
    "message": "RPC Response contains an improperly formatted error.",
    "meta": {
      "funcId": "a3ea0ec0-ed04-4f55-81ca-e2704de81d9c",
      "eventId": "59e5a468-b952-402e-a6c3-69390dfb33fe",
      "error": {
        "message": "This error is for testing purposes",
        "name": "Error",
        "stack": "Error: This error is for testing purposes\n    at /home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:89:13\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
      },
      "payload": {
        "name": "error-function",
        "event": {
          "name": "error",
          "id": "59e5a468-b952-402e-a6c3-69390dfb33fe"
        },
        "id": "a3ea0ec0-ed04-4f55-81ca-e2704de81d9c",
        "cache": {}
      },
      "attempts": 1,
      "max_attempts": 25,
      "timestamp": "2024-03-26T15:32:24.545Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8902a74bde96e81d18"),
    "timestamp": new Date("2024-03-26T15:32:25.237Z"),
    "level": "info",
    "message": "Event fired",
    "meta": {
      "eventId": "ba28584c-294f-4ec1-9d17-1924749618b1",
      "eventName": "error",
      "timestamp": "2024-03-26T15:32:25.237Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8902a74bde96e81d19"),
    "timestamp": new Date("2024-03-26T15:32:25.241Z"),
    "level": "info",
    "message": "Function invoked",
    "meta": {
      "eventId": "ba28584c-294f-4ec1-9d17-1924749618b1",
      "funcName": "error-function",
      "funcId": "9efd214c-2a54-4633-b2bb-9e305f34df33",
      "timestamp": "2024-03-26T15:32:25.237Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8902a74bde96e81d1a"),
    "timestamp": new Date("2024-03-26T15:32:25.265Z"),
    "level": "error",
    "message": "RPC Response contains an improperly formatted error.",
    "meta": {
      "funcId": "9efd214c-2a54-4633-b2bb-9e305f34df33",
      "eventId": "ba28584c-294f-4ec1-9d17-1924749618b1",
      "error": {
        "message": "This error is for testing purposes",
        "name": "Error",
        "stack": "Error: This error is for testing purposes\n    at /home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:89:13\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
      },
      "payload": {
        "name": "error-function",
        "event": {
          "name": "error",
          "id": "ba28584c-294f-4ec1-9d17-1924749618b1"
        },
        "id": "9efd214c-2a54-4633-b2bb-9e305f34df33",
        "cache": {}
      },
      "attempts": 1,
      "max_attempts": 25,
      "timestamp": "2024-03-26T15:32:25.264Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8a02a74bde96e81d1b"),
    "timestamp": new Date("2024-03-26T15:32:26.253Z"),
    "level": "info",
    "message": "Event fired",
    "meta": {
      "eventId": "7583c224-07da-4522-b87c-41e7fdc00e0b",
      "eventName": "error",
      "timestamp": "2024-03-26T15:32:26.253Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8a02a74bde96e81d1c"),
    "timestamp": new Date("2024-03-26T15:32:26.254Z"),
    "level": "info",
    "message": "Function invoked",
    "meta": {
      "eventId": "7583c224-07da-4522-b87c-41e7fdc00e0b",
      "funcName": "error-function",
      "funcId": "18a85c96-5fbd-4ee8-ad6f-b69a5a9ce669",
      "timestamp": "2024-03-26T15:32:26.253Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8a02a74bde96e81d1d"),
    "timestamp": new Date("2024-03-26T15:32:26.267Z"),
    "level": "error",
    "message": "RPC Response contains an improperly formatted error.",
    "meta": {
      "funcId": "18a85c96-5fbd-4ee8-ad6f-b69a5a9ce669",
      "eventId": "7583c224-07da-4522-b87c-41e7fdc00e0b",
      "error": {
        "message": "This error is for testing purposes",
        "name": "Error",
        "stack": "Error: This error is for testing purposes\n    at /home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:89:13\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/memlin/capstone/Project-ingress/workers/tasks/process_job.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
      },
      "payload": {
        "name": "error-function",
        "event": {
          "name": "error",
          "id": "7583c224-07da-4522-b87c-41e7fdc00e0b"
        },
        "id": "18a85c96-5fbd-4ee8-ad6f-b69a5a9ce669",
        "cache": {}
      },
      "attempts": 1,
      "max_attempts": 25,
      "timestamp": "2024-03-26T15:32:26.267Z"
    }
  },
  {
    "_id": new ObjectId("6602ea8b02a74bde96e81d1e"),
    "timestamp": new Date("2024-03-26T15:32:27.287Z"),
    "level": "info",
    "message": "Event fired",
    "meta": {
      "eventId": "f2e971d9-7454-4aaa-879a-64786f1dcf91",
      "eventName": "error",
      "timestamp": "2024-03-26T15:32:27.287Z"
    }
  },
]

beforeEach(() => {
  jest.mock("../src/services/mongo-service", () => {
    const collection = {
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

describe('GET /logs', () => {
  it('should return 200 and logs with pagination links', async () => {
    const response = await request(app).get('/logs');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('logs');
    expect(response.body).toHaveProperty('links');
  });

  it('should return 200 with all log entries', async () => {
    const response = await request(app).get('/logs/');

    expect(response.status).toBe(200);
    expect(response.body.logs.length).toEqual(MOCK_LOGS.length);
  });

  it('with limit of 1 should return 200 with one log', async () => {
    const limit = '1';
    const response = await request(app).get(`/logs?limit=${limit}`);

    expect(response.status).toBe(200);
    expect(response.body.logs.length).toEqual(1);
  });

  // it('should return logs filtered by cursor', async () => {
  //   const cursor = "6602ea8802a74bde96e81d15"
  //   const response = await request(app).get(`/logs/?cursor=${cursor}`);
  //   expect(response.status).toBe(200);
  //   console.log(response.body.logs.map((log: Log) => log))
  // expect(response.body.logs.length).toEqual(MOCK_LOGS.length - 1);
  // });

  // it('GET request to /logs should return 200 with one log when startTime and endTime query parameters are provided', async () => {
  //   const startTime = new Date('2024-01-01').toISOString();
  //   const endTime = new Date('2024-01-03').toISOString();

  //   console.log(startTime, endTime)

  //   const response = await request(app)
  //     .get(`/logs?startTime=${startTime}&endTime=${endTime}`);


  //   expect(response.status).toBe(200);
  //   expect(response.body.logs.length).toEqual(1);
  // });

  it('should return 400 with error message if startTime is invalid', async () => {
    const response = await request(app).get('/logs/?startTime=invalid&endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if endTime is invalid', async () => {
    const response = await request(app).get('/logs/?startTime=2024-03-26T15:32:27.287Z&endTime=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if startTime is present but endTime is missing', async () => {
    const response = await request(app).get('/logs/?startTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if endTime is present but startTime is missing', async () => {
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
  it('should return 200 and event logs with pagination links', async () => {
    const response = await request(app).get('/logs/events');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('logs');
    expect(response.body).toHaveProperty('links');
  });

  it('should return 404 if page is not found', async () => {
    const response = await request(app).get('/logs/events?page=9999');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Page not found' });
  });

  it('should return 400 with error message if startTime is invalid', async () => {
    const response = await request(app).get('/logs/events?startTime=invalid&endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if endTime is invalid', async () => {
    const response = await request(app).get('/logs/events/?startTime=2024-03-26T15:32:27.287Z&endTime=invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if startTime is present but endTime is missing', async () => {
    const response = await request(app).get('/logs/events/?startTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 with error message if endTime is present but startTime is missing', async () => {
    const response = await request(app).get('/logs/events/?endTime=2024-03-26T15:32:27.287Z');
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});