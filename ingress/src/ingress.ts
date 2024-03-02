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

export const app = express();
app.use(express.json());
let functions: FunctionData[] = [];

app.post('/events', (req: Request<{}, {}, Event>, res) => {
  if (!req.body.event) {
    res.status(400);
    return res.send({ error: 'Event ID was not included in request body' });
  }

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
