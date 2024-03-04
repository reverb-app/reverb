import express, { Request } from 'express';
import { Event, FunctionsByEvent, RpcRequest } from './types/types';
import dotenv from 'dotenv';
import { isValidFunctionsByEvent } from './utils/utils';
dotenv.config();

export const app = express();
app.use(express.json());

let functions: FunctionsByEvent = {};

app.post('/events', (req: Request<{}, {}, Event>, res) => {
  if (!req.body.name) {
    res.status(400);
    return res.send({ error: 'Event ID was not included in request body' });
  }

  functions[req.body.name]?.forEach((funcId) => {
    fetch(`${process.env.FUNCTIONS_URL}/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: funcId,
        params: { event: req.body },
      }),
    });
  });

  res.status(200);
  return res.send();
});

app.post('/functions', (req, res) => {
  if (!isValidFunctionsByEvent(req.body)) {
    return res.status(400).json({
      error: 'Invalid syntax',
    });
  }

  functions = req.body;

  res.status(200);
  return res.send();
});

export default app;
