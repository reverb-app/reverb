import { Step } from '../utils/step';
export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: { event: Event; cache: { [key: string]: any } };
  id?: number | string;
}

export interface RpcResponse {
  result?: object;
  error?: Error | string;
  id: number | string;
}

export type EventFunction = (event: Event, step: Step) => Promise<any>;

export interface FunctionData {
  id: string;
  event: string;
  fn: EventFunction;
}

export interface Event {
  name: string;
  payload?: object;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}
