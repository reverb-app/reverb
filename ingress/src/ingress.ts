import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { json } from 'body-parser';
import eventsRouter from './routes/events';
import webhooksRouter from './routes/webhooks';
import logsRouter from './routes/logs';
import cors from 'cors';

const app = express();
app.use(json());
app.use(cors());

app.use('/events', eventsRouter);
app.use('/webhooks', webhooksRouter);
app.use('/logs', logsRouter);

export default app;
