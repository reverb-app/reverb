import { EventFunction, FunctionData } from '../types/types';
import { Client } from 'pg';
import format from 'pg-format';
import { createHash } from 'crypto';

let functions: FunctionData[] = [];
const client = new Client({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
});

const createFunction = (data: FunctionData) => {
  functions.push(data);
};

const getFunction = (method: string) => {
  return functions.find((fn) => fn.id === method);
};

const getAllFunctions = () => {
  const result: { [event: string]: string[] } = {};
  functions.forEach((func) => {
    if (!result[func.event]) result[func.event] = [];
    result[func.event].push(func.id);
  });

  return result;
};

const setUpDb = async () => {
  await client.connect();

  try {
    const sha1 = createHash('sha1');
    sha1.update(JSON.stringify(getAllFunctions()));
    const hash = sha1.digest('base64');

    const dbHash = await client.query('SELECT hash FROM hash');
    if (dbHash.rows[0]?.hash === hash) return;

    await client.query('BEGIN');

    await client.query('DELETE FROM functions');
    await client.query('DELETE FROM events');
    await client.query('DELETE FROM hash');

    const functions = getAllFunctions();
    const eventNames = Object.keys(functions).map((string) => [string]);

    await client.query('INSERT INTO hash VALUES ($1)', [hash]);

    const ids = (
      await client.query(
        format(`INSERT INTO events (name) VALUES %L RETURNING id;`, eventNames)
      )
    ).rows.map((obj) => obj.id);

    const insertQuery = ids.flatMap((id, index) => {
      return functions[eventNames[index][0]].map((ele) => [id, ele]);
    });

    await client.query(
      format(`INSERT INTO functions (event_id, name) VALUES %L`, insertQuery)
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
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
