import { FunctionsByEvent } from '../types/types';

export const isValidFunctionsByEvent = (
  body: unknown
): body is FunctionsByEvent => {
  return (
    !!body &&
    typeof body === 'object' &&
    Object.values(body).every((value) => {
      return (
        Array.isArray(value) &&
        value.every((element) => typeof element === 'string')
      );
    })
  );
};

export const isValidDateString = (value: unknown): value is string => {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

export const isValidNumberString = (value: unknown): value is string => {
  return typeof value === 'string' && !isNaN(parseInt(value));
}
