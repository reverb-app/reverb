import { EventFunction, FunctionData } from '../types/types';

let functions: FunctionData[] = [];

const createFunction = (data: FunctionData) => {
  functions.push(data);
};

const getFunction = (method: string) => {
  return functions.find((fn) => fn.id === method);
};

export default { createFunction, getFunction };
