import request from 'supertest';
import app from '../src/ingress';

jest.mock('../src/services/pg-service');

test('POST request returns 200', async () => {
  await request(app).post('/events').send({ webhook: { headers: "", body: "" } }).expect(200);
});

test('undefined event returns 400', async () => {
  await request(app).post('/events').send({}).expect(400);
});