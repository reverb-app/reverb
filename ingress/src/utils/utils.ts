import {
  FunctionsByEvent,
  QueryTimestamp,
  DeadLetterType,
} from "../types/types";

export const isValidFunctionsByEvent = (
  body: unknown
): body is FunctionsByEvent => {
  return (
    !!body &&
    typeof body === "object" &&
    Object.values(body).every(value => {
      return (
        Array.isArray(value) &&
        value.every(element => typeof element === "string")
      );
    })
  );
};

export const isValidDateString = (value: unknown): value is string => {
  return typeof value === "string" && !isNaN(Date.parse(value));
};

export const isValidNumberString = (value: unknown): value is string => {
  return typeof value === "string" && !isNaN(parseInt(value));
};

export function isValidTimeParams(
  timestamp: unknown
): timestamp is QueryTimestamp {
  return (
    !!timestamp &&
    typeof timestamp === "object" &&
    (("startTime" in timestamp &&
      !!timestamp.startTime &&
      isValidDateString(timestamp.startTime) &&
      "endTime" in timestamp &&
      !!timestamp.endTime &&
      isValidDateString(timestamp.endTime)) ||
      (!("startTime" in timestamp) && !("endTime" in timestamp)))
  );
}

export function isValidDeadLetterType(
  queryParam: unknown
): queryParam is DeadLetterType {
  return (
    !!queryParam &&
    typeof queryParam === "string" &&
    ["event", "function", "all"].includes(queryParam)
  );
}
