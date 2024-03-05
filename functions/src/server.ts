import express from "express";
import callsRoute from "./routes/calls";
import functions from "./services/fn";
import dotenv from "dotenv";
dotenv.config();

export const app = express();

app.use("/calls", callsRoute);

app.all("*", (_, res) => {
  return res.status(404).send();
});

const serve = async () => {
  // fetch(`${process.env.INGRESS_URL}/functions`, {
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(functions.getAllFunctions()),
  // });

  // const data = functions.getAllFunctions();

  functions.setUpDb();

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

export default serve;

/*
DROP TABLE events;
DROP TABLES functions;

CREATE TABLE events {
  id serial PRIMARY KEY,
  name varchar(30) UNQIUE NOT NULL
}

CREATE TABLE functions {
  id serial PRIMARY KEY,
  name varchar(30) UNIQUE NOT NULL,
  event_id integer REFERENCES events(id) ON DELETE CASCADE
}

*/
