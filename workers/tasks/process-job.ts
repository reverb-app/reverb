import { Task } from "graphile-worker";
import { isValidFunctionPayload, isValidRpcResponse } from "../utils/utils";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';
dotenv.config();

const functionServerUrl: string = process.env.FUNCTION_SERVER_URL ?? "";
if (!functionServerUrl) {
  console.error("No function server URL found");
}

const process_job: Task = async function (job) {
  if (!isValidFunctionPayload(job)) {
    throw new Error(`${job} not valid Function Payload`);
  }
  let result;
  result = await fetch(functionServerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: job.name,
      id: uuidv4(),
      params: { event: job.event },
    }),
  });

  let data = await result.json();

  if (!isValidRpcResponse(data)) {
    throw new Error("Not a valid response");
  }

  if ("error" in data) {
    if (typeof data.error === "string") {
      throw new Error(data.error);
    } else {
      throw data.error;
    }
  }
};

export default process_job;
