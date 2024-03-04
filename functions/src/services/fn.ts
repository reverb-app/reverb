import { EventFunction, FunctionData } from '../types/types';

let functions: FunctionData[] = [];

const createFunction = (data: FunctionData) => {
  functions.push(data);
};

const getFunction = (method: string) => {
  return functions.find((fn) => fn.id === method);
};

const getAllFunctions = () => {
  const result: { [event: string]: string[] } = {};
  functions.forEach((func) => {
    if (!result[func.event]) result[func.event] = [];
    result[func.event].push(func.id);
  });

  return result;
};

export default { createFunction, getFunction, getAllFunctions };
