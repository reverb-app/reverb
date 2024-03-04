import express from 'express';
import callsRoute from './routes/calls';

const app = express();

app.use('/calls', callsRoute);

app.all('*', (_, res) => {
  return res.status(404).send();
});

export default app;
