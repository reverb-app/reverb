import request from 'supertest';
import { app } from '../src/server';
import functions from '../src/services/fn';

test('POST /calls 400s on no body', async () => {
  await request(app).post('/calls').expect(400);
});

test('POST /calls 400s with error if body has id, but is malformed', async () => {
  await request(app)
    .post('/calls')
    .send({ id: 123 })
    .expect(400)
    .then((response) => {
      expect(response.body?.error).toBeTruthy();
    });
});

test('POST /calls 404s with no error if no function exists and no id given', async () => {
  await request(app)
    .post('/calls')
    .send({
      jsonrpc: '2.0',
      method: 'notExist',
      params: { event: { name: 'sign-up' } },
    })
    .expect(404)
    .then((response) => {
      expect(response.body?.error).not.toBeTruthy();
    });
});

test('POST /calls 404s with error if no function exists and id given', async () => {
  await request(app)
    .post('/calls')
    .send({
      jsonrpc: '2.0',
      method: 'notExist',
      params: { event: { name: 'sign-up' } },
      id: 404,
    })
    .expect(404)
    .then((response) => {
      expect(response.body?.error).toBeTruthy();
    });
});

test('POST /calls 200s and runs function if exists', async () => {
  const mockFunction = jest.fn();
  functions.createFunction({
    id: 'iExist',
    event: 'sign-up',
    fn: mockFunction,
  });

  await request(app)
    .post('/calls')
    .send({
      jsonrpc: '2.0',
      method: 'iExist',
      params: { event: { name: 'sign-up' } },
      id: 200,
    })
    .expect(200);

  expect(mockFunction).toHaveBeenCalled();
});

test('POST /calls does not call wrong function', async () => {
  const mockFunction = jest.fn();
  functions.createFunction({
    id: 'iExist',
    event: 'sign-up',
    fn: mockFunction,
  });
  functions.createFunction({
    id: 'iAlsoExist',
    event: 'magnolia',
    fn: async () => {},
  });

  await request(app)
    .post('/calls')
    .send({
      jsonrpc: '2.0',
      method: 'iAlsoExist',
      params: { event: { name: 'magnolia' } },
      id: 404,
    })
    .expect(200);
  expect(mockFunction).not.toHaveBeenCalled();
});
