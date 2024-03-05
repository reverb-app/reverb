import { Event, FunctionPayload } from "../types/types";

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
