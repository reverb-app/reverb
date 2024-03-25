import express from 'express';
import callsRoute from './routes/calls';
import functions from './services/fn';

const PORT = process.env.PORT || 3002;
export const app = express();

app.use('/calls', callsRoute);

app.all('*', (_, res) => {
  return res.status(404).send();
});

const serve = async () => {
  functions.setUpDb();

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

export default serve;
