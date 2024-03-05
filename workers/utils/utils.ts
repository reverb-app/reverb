import { Event, FunctionPayload, RpcResponse } from "../types/types";

export const isValidEvent = (event: unknown): event is Event => {
  return (
    !!event &&
    typeof event === "object" &&
    "name" in event &&
    typeof event.name === "string"
  );
};

export const isValidFunctionPayload = (
  payload: unknown
): payload is FunctionPayload => {
  return (
    !!payload &&
    typeof payload === "object" &&
    "name" in payload &&
    typeof payload.name === "string" &&
    "event" in payload &&
    isValidEvent(payload.event)
  );
};

export const isValidRpcResponse = (body: unknown): body is RpcResponse => {
  return (
    !!body &&
    typeof body === "object" &&
    "id" in body &&
    (typeof body.id === "number" || typeof body.id === "string") &&
    (!("result" in body) ||
      (!!body.result && typeof body.result === "object")) &&
    (!("error" in body) ||
      typeof body.error === "string" ||
      body.error instanceof Error)
  );
};
