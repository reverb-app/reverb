import express, { Request } from 'express';

interface Event {
  event: String;
  payload: Object | undefined;
}

type EventFunction = (event: Event) => Promise<void>;

interface FunctionData {
  id: string;
  event: string;
  fn: EventFunction;
}

const app = express();
app.use(express.json());
let functions: FunctionData[] = [];

app.post('/event', (req: Request<{}, {}, Event>, res) => {
  const funcsToExecute = functions.filter(
    (func) => func.event === req.body.event
  );
  funcsToExecute.forEach((data) => {
    data.fn(req.body);
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
