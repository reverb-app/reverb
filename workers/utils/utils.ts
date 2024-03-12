import {
  Event,
  FunctionPayload,
  RpcResponse,
  CompleteResult,
  StepResult,
} from '../types/types';

export const isValidEvent = (event: unknown): event is Event => {
  return (
    !!event &&
    typeof event === 'object' &&
    'name' in event &&
    typeof event.name === 'string'
  );
};

export const isValidFunctionPayload = (
  payload: unknown
): payload is FunctionPayload => {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'name' in payload &&
    typeof payload.name === 'string' &&
    'event' in payload &&
    isValidEvent(payload.event) &&
    'cache' in payload &&
    typeof payload.cache === 'object' &&
    !!payload.cache
  );
};

export const isValidRpcResponse = (body: unknown): body is RpcResponse => {
  return (
    !!body &&
    typeof body === 'object' &&
    'id' in body &&
    (typeof body.id === 'number' || typeof body.id === 'string') &&
    (!('result' in body) ||
      (!!body.result &&
        (isValidCompleteResult(body.result) ||
          isValidStepResult(body.result)))) &&
    (!('error' in body) ||
      typeof body.error === 'string' ||
      body.error instanceof Error)
  );
};

const isValidCompleteResult = (result: unknown): result is CompleteResult => {
  return (
    !!result &&
    typeof result === 'object' &&
    'type' in result &&
    result.type === 'complete'
  );
};

const isValidStepResult = (result: unknown): result is StepResult => {
  return (
    !!result &&
    typeof result === 'object' &&
    'type' in result &&
    result.type === 'step' &&
    'stepId' in result &&
    typeof result.stepId === 'string' /*&&
    'stepValue' in result/*/
  );
};
