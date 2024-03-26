import { FunctionData, Secret } from "../types/types";
import { Client } from "pg";
import format from "pg-format";
import { createHash } from "crypto";

let functions: FunctionData[] = [];
let connectionString = process.env.GRAPHILE_CONNECTION_STRING;

const secret = process.env.DB_SECRET;
if (secret) {
  const value = JSON.parse(secret) as Secret;
  connectionString = `postgresql://${value.username}:${value.password}@${value.host}:${value.port}${process.env.GRAPHILE_ENDPOINT}?ssl=no-verify`;
}

const client = new Client({
  connectionString,
});

const createFunction = (data: FunctionData) => {
  if (data.event && data.cron) {
    throw new Error(
      `Function ${data.id}: Cannot trigger function by both cron and event.`
    );
  } else if (!data.event && !data.cron) {
    throw new Error(
      `Function ${data.id}: must be triggered by either cron or event.`
    );
  }

  if (functions.find((fn) => data.id === fn.id)) {
    throw new Error(`Function Ids must be unique. ${data.id} already exists`);
  }

  if (data.cron) {
    const regex =
      /^(\*\/[1-5]?\d|[1-5]?\d-[1-5]?\d|\*|[1-5]?\d)(,(\*\/[1-5]?\d|[1-5]?\d-[1-5]?\d|\*|[1-5]?\d))* (\*\/[1-2]?\d|[1-2]?\d-[1-2]?\d|\*|[1-2]?\d)(,(\*\/[0-2]?\d|[1-2]?\d-[1-2]?\d|\*|[1-2]?\d))* (\*\/[1-3]?\d|[1-3]?\d-[1-3]?\d|\*|[1-3]?\d)(,(\*\/[1-3]?\d|[1-3]?\d-[1-3]?\d|\*|[1-3]?\d))* (\*\/1?\d|1?\d-1?\d|\*|1?\d)(,(\*\/1?\d|1?\d-1?\d|\*|1?\d))* (\*\/[0-6]|[0-6]-[0-6]|\*|[0-6])(,(\*\/[0-6]|[0-6]-[0-6]|\*|[0-6]))*$/;

    if (!regex.test(data.cron)) {
      throw new Error(`CRON string for function ${data.id} invalid.`);
    }
  }

  functions.push(data);
};

const getFunction = (method: string) => {
  return functions.find((fn) => fn.id === method);
};

const getAllFunctions = () => {
  const result: {
    events: { [event: string]: string[] };
    cron: [string, string][];
  } = { events: {}, cron: [] };

  const eventFunctions = functions.filter((funcData) => "event" in funcData);
  const cronFunctions = functions.filter((funcData) => "cron" in funcData);

  result.cron = cronFunctions.map((funcData) => [
    funcData.id,
    funcData.cron as string,
  ]);

  eventFunctions.forEach((funcData) => {
    const key = funcData.event as string;
    if (!(key in result.events)) {
      result.events[key] = [];
    }
    result.events[key].push(funcData.id);
  });

  return result;
};

const getFunctionsHash = () => {
  const functionsObj = getAllFunctions();
  if (
    Object.keys(functionsObj.events).length === 0 &&
    Object.keys(functionsObj.cron).length === 0
  )
    return "";

  const sha1 = createHash("sha1");
  sha1.update(JSON.stringify(functionsObj));
  return sha1.digest("base64");
};

const setUpDb = async () => {
  await client.connect();

  try {
    const dbHash = (await client.query("SELECT hash FROM hash")).rows[0]?.hash;
    const funcsHash = getFunctionsHash();
    if (dbHash === funcsHash) return;

    await client.query("BEGIN");

    await client.query("DELETE FROM functions");
    await client.query("DELETE FROM events");
    await client.query("DELETE FROM hash");

    const functions = getAllFunctions();
    const eventNames = Object.keys(functions.events).map((string) => [string]);

    if (Object.keys(functions.events).length > 0) {
      const ids = (
        await client.query(
          format(
            `INSERT INTO events (name) VALUES %L RETURNING id;`,
            eventNames
          )
        )
      ).rows.map((obj) => obj.id);

      const insertQuery = ids.flatMap((id, index) => {
        return functions.events[eventNames[index][0]].map((ele) => [id, ele]);
      });

      await client.query(
        format(`INSERT INTO functions (event_id, name) VALUES %L`, insertQuery)
      );
    }

    if (Object.keys(functions.cron).length > 0) {
      await client.query(
        format(`INSERT INTO functions (name, cron) VALUES %L`, functions.cron)
      );
    }

    await client.query(
      format("INSERT INTO hash (hash) VALUES %L", [[funcsHash]])
    );

    if (dbHash) {
      // only push job if updating, not initializing
      await client.query("SELECT graphile_worker.add_job('update_cron', $1);", [
        { hash: "" },
      ]);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    await client.end();
  }
};

export default {
  createFunction,
  getFunction,
  getAllFunctions,
  setUpDb,
  getFunctionsHash,
};
