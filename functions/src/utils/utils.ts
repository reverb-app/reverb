import { RpcRequest, Event } from '../types/types';

export const isValidEvent = (event: unknown): event is Event => {
  return (
    !!event &&
    typeof event === 'object' &&
    'name' in event &&
    typeof event.name === 'string' &&
    (!('payload' in event) || typeof event.payload === 'object')
  );
};

export const isValidRpcRequest = (body: unknown): body is RpcRequest => {
  return (
    !!body &&
    typeof body === 'object' &&
    'jsonrpc' in body &&
    body.jsonrpc === '2.0' &&
    'method' in body &&
    typeof body.method === 'string' &&
    'params' in body &&
    typeof body.params === 'object' &&
    !!body.params &&
    'event' in body.params &&
    isValidEvent(body.params.event) &&
    (!('id' in body) ||
      typeof body.id === 'number' ||
      typeof body.id === 'string') &&
    'cache' in body.params &&
    typeof body.params.cache === 'object' &&
    !!body.params.cache
  );
};
