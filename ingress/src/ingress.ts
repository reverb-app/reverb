import express, { Request } from 'express';
import { Event, FunctionsByEvent, RpcRequest } from './types/types';

const FUNCTIONS_URL = 'http://localhost:3002';

export const app = express();
app.use(express.json());
let functions: FunctionsByEvent = {};

app.post('/events', (req: Request<{}, {}, Event>, res) => {
  if (!req.body.name) {
    res.status(400);
    return res.send({ error: 'Event ID was not included in request body' });
  }

  functions[req.body.name]?.forEach((funcId) => {
    fetch(`${FUNCTIONS_URL}/calls`, {
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

app.post('/functions', (req: Request<{}, {}, FunctionsByEvent>, res) => {
  functions = req.body;

  res.status(200);
  return res.send();
});

export default app;
