export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: { event: Event };
  id?: number | string;
}

export interface RpcResponse {
  result?: object;
  error?: Error | string;
  id: number | string;
}

export type EventFunction = (event: Event) => Promise<void>;

export interface FunctionData {
  id: string;
  event: string;
  fn: EventFunction;
}

export interface Event {
  name: String;
  payload?: Object;
}
