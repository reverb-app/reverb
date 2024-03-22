export interface Event {
  name: string;
  payload?: Object;
  id: string;
}

export interface FunctionsByEvent {
  [event: string]: string[];
}

export interface RpcRequest {
  jsonrpc: "2.0";
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

export interface QueryTimestamp {
  startTime?: Date;
  endTime?: Date;
}

export interface QueryFilter {
  eventId?: string;
  count?: string;
  level?: "info" | "warn" | "debug" | "error" | "silly" | "http" | "verbose";
  message?: string | { $in: string[] };
  timestamp?: { $gte: Date; $lte: Date };
  funcId?: { $in: string[] };
}

export interface AggregateGroup {
  _id: string;
  message?: { $last: string };
  timestamp?: { $last: string };
  level?: { $last: string };
}
