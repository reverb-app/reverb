import request from 'supertest';
import app from '../src/ingress';

jest.mock('../src/services/mongo-service');

test('GET request to /logs should return 200', async () => {
  await request(app).get('/logs').expect(200);
});

// test('GET request to /logs, with valid page and limit, should return 200', async () => {
//   const req = {
//     query: {
//       page: '1',
//       limit: '10',
//     },
//   };
//   await request(app).get('/logs').query(req.query).expect(200);
// });
