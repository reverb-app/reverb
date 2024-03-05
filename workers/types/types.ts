export interface Event {
  name: string;
  payload?: unknown;
}

export interface FunctionPayload {
  name: string;
  event: Event;
}
