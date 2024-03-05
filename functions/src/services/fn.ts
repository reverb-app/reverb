import { EventFunction, FunctionData } from "../types/types";
import { Client } from "pg";
import format from "pg-format";

let functions: FunctionData[] = [];
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "event_functions",
});

const createFunction = (data: FunctionData) => {
  functions.push(data);
};

const getFunction = (method: string) => {
  return functions.find(fn => fn.id === method);
};

const getAllFunctions = () => {
  const result: { [event: string]: string[] } = {};
  functions.forEach(func => {
    if (!result[func.event]) result[func.event] = [];
    result[func.event].push(func.id);
  });

  return result;
};

const setUpDb = async () => {
  await client.connect();

  try {
    client.query("DELETE FROM functions");
    client.query("DELETE FROM events");

    const functions = getAllFunctions();
    const eventNames = Object.keys(functions).map(string => [string]);

    const ids = (
      await client.query(
        format(`INSERT INTO events (name) VALUES %L RETURNING id;`, eventNames)
      )
    ).rows.map(obj => obj.id);

    const insertQuery = ids.flatMap((id, index) => {
      return functions[eventNames[index][0]].map(ele => [id, ele]);
    });

    await client.query(
      format(`INSERT INTO functions (event_id, name) VALUES %L`, insertQuery)
    );
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
};

export default { createFunction, getFunction, getAllFunctions, setUpDb };

// const functionData = Object.value(functions).flatMap(
// (fns, index) => fns.map(
// name => [name, ids[index]]
// )
// );

/*
INSERT INTO functions VALUES (funcName1, eventId)
*/
