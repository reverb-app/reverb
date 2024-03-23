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
  message?: string | { $in: string[] };
  count?: string;
  level?: "info" | "warn" | "debug" | "error" | "silly" | "http" | "verbose";
  cursor?: {};
  "meta.eventId"?: string;
  "meta.timestamp"?: { $gte: Date; $lte: Date };
  "meta.funcId"?: string | { $in: string[] };
}

export interface AggregateGroup {
  _id: string;
  message?: { $last: "$message" };
  timestamp?: { $last: "$meta.timestamp" };
  level?: { $last: "$level" };
  name?: { $first: "$meta.funcName" };
  invoked?: { $first: "$meta.timestamp" };
}
