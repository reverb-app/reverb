import request from 'supertest';
import app from '../src/ingress';

jest.mock('../src/services/pg-service');

test('POST request returns 200', async () => {
  await request(app).post('/webhooks').send().expect(200);
});