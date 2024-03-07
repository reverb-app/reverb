import dotenv from "dotenv";
dotenv.config();

import express from "express";
import callsRoute from "./routes/calls";
import functions from "./services/fn";

export const app = express();

app.use("/calls", callsRoute);

app.all("*", (_, res) => {
  return res.status(404).send();
});

const serve = async () => {
  functions.setUpDb();

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

export default serve;
