export interface Event {
  name: string;
  payload?: unknown;
  id: string;
}

export interface FunctionPayload {
  name: string;
  id: string;
  event: Event;
  cache: { [key: string]: any };
}

export interface CronPayload {
  funcName: string;
}

export interface UpdateCronPayload {
  hash: string;
}

export interface RpcResponse {
  result?:
    | CompleteResult
    | StepResult
    | DelayResult
    | InvokeResult
    | EmitEventResult;
  error?: string;
  id: number | string;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}

export interface CompleteResult {
  type: "complete";
  stepId: string;
  stepValue: any;
}

export interface StepResult {
  type: "step";
  stepId: string;
  stepValue: any;
}

export interface DelayResult {
  type: "delay";
  stepId: string;
  delayInMs: number;
}

export interface InvokeResult {
  type: "invoke";
  stepId: string;
  invokedFnName: string;
  payload?: object;
}

export interface EmitEventResult {
  type: "emitEvent";
  stepId: string;
  eventId: string;
  payload?: object;
}
