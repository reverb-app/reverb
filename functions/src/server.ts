import express from 'express';
import callsRoute from './routes/calls';
import functions from './services/fn';

export const app = express();

app.use('/calls', callsRoute);

app.all('*', (_, res) => {
  return res.status(404).send();
});

const INGRESS_URL = 'http://localhost:3000';
const PORT = 3002;

const serve = () => {
  fetch(`${INGRESS_URL}/functions`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(functions.getAllFunctions()),
  });

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

export default serve;
