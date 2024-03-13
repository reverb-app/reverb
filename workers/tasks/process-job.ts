import dotenv from 'dotenv';
dotenv.config();

import { Task } from 'graphile-worker';
import { isValidFunctionPayload, isValidRpcResponse } from '../utils/utils';
import { v4 as uuidv4 } from 'uuid';

const functionServerUrl: string = process.env.FUNCTION_SERVER_URL ?? '';
if (!functionServerUrl) {
  console.error('No function server URL found');
}

const process_job: Task = async function (job, helpers) {
  if (!isValidFunctionPayload(job)) {
    throw new Error(`${job} not valid Function Payload`);
  }

  const response = await fetch(functionServerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: job.name,
      id: uuidv4(),
      params: { event: job.event, cache: job.cache },
    }),
  });

  let data = await response.json();

  if (!isValidRpcResponse(data)) {
    throw new Error('Not a valid response');
  }
  if ('error' in data) {
    if (typeof data.error === 'string') {
      throw new Error(data.error);
    } else {
      throw data.error;
    }
  }

  if (!data.result) {
    return;
  }

  const result = data.result;
  switch (result.type) {
    case 'complete':
      return;
    case 'step':
      job.cache[result.stepId] = result.stepValue;
      helpers.addJob('process_job', job);
      break;
    case 'delay':
      const time = new Date(Date.now() + result.delayInMs);
      job.cache[result.stepId] = time;
      helpers.addJob('process_job', job, { runAt: time });
      break;
    case 'invoke':
      helpers.addJob('process_job', {
        name: result.invokedFnName,
        event: { name: `invoked from ${job.name}`, payload: result.payload },
        cache: {},
      });
      job.cache[result.stepId] = `${result.invokedFnName} was invoked`;
      helpers.addJob('process_job', job);
      break;
    default:
      const _exhaustiveCheck: never = result;
      return _exhaustiveCheck;
  }
};

export default process_job;
