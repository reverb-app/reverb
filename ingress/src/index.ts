import express from 'express';

const app = express();

app.post('/event', (req, res) => {
  console.log('hi :)');

  res.status(200);
  return res.send();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
