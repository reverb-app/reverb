import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { json } from 'body-parser';
import eventsRouter from './routes/events';
import logsRouter from './routes/logs';

const app = express();
app.use(json());

app.use('/events', eventsRouter);
app.use('/logs', logsRouter);

export default app;
