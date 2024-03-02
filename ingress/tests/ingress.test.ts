import request from 'supertest';
import ingress, { app } from '../src/ingress.ts';

test('POST request returns 200', async () => {
  await request(app).post('/events').send({ event: 'hi' }).expect(200);
});

test('undefined event returns 400', async () => {
  await request(app).post('/events').send({}).expect(400);
});

test('function is created and fired on the correct event', async () => {
  const mockFunction = jest.fn();

  ingress.createFunction({ id: 'id', event: 'event', fn: mockFunction });
  await request(app).post('/events').send({ event: 'event' }).expect(200);
  expect(mockFunction).toHaveBeenCalled();
});

test('function is created and not fired on the incorrect event', async () => {
  const mockFunction = jest.fn();

  ingress.createFunction({ id: 'id', event: 'event', fn: mockFunction });
  await request(app).post('/events').send({ event: 'otherEvent' }).expect(200);
  expect(mockFunction).not.toHaveBeenCalled();
});
