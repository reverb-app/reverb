import express from 'express';
import callsRoute from './routes/calls';
import functions from './services/fn';
import dotenv from 'dotenv';
dotenv.config();

export const app = express();

app.use('/calls', callsRoute);

app.all('*', (_, res) => {
  return res.status(404).send();
});

const serve = () => {
  fetch(`${process.env.INGRESS_URL}/functions`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(functions.getAllFunctions()),
  });

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

export default serve;
