import express from 'express';

interface FunctionData {
  id: string;
  event: string;
  fn: Function;
}

const app = express();
let functions: FunctionData[] = [];

app.post('/event', (req, res) => {
  functions.forEach((data) => {
    data.fn();
  });

  res.status(200);
  return res.send();
});

export default {
  listen(port: number) {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  },

  createFunction(data: FunctionData) {
    functions.push(data);
  },
};
