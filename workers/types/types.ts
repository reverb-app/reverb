export interface Event {
  name: string;
  payload?: unknown;
}

export interface FunctionPayload {
  name: string;
  event: Event;
}

export interface RpcResponse {
  result?: object;
  error?: Error | string;
  id: number | string;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}
