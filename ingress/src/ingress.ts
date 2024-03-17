import dotenv from 'dotenv';
dotenv.config();

import express, { Request } from 'express';
import { Event } from './types/types';
import { addEvent } from './services/pg-service';

import { v4 } from 'uuid';

export const app = express();
app.use(express.json());

app.post('/events', (req: Request<{}, {}, Event>, res) => {
  if (!req.body.name) {
    res.status(400);
    return res.send({ error: 'Event ID was not included in request body' });
  }

  addEvent({ ...req.body, id: v4() });
  res.status(200);
  return res.send();
});

export default app;
