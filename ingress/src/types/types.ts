export interface Event {
  name: string;
  payload?: Object;
}

export interface FunctionsByEvent {
  [event: string]: string[];
}

export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: { event: Event };
  id?: number | string;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}
