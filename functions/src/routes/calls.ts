import express, { Response } from "express";
import { RpcResponse } from "../types/types";
import functions from "../services/fn";
import { isValidRpcRequest } from "../utils/utils";
import {
  DelayInitiated,
  Step,
  StepComplete,
  InvokeInitiated,
  EventEmitted,
} from "../utils/step";

const router = express.Router();

router.use(express.json());

router.post("/", async (req, res: Response<RpcResponse>) => {
  if (!isValidRpcRequest(req.body)) {
    if (
      !!req.body &&
      typeof req.body === "object" &&
      "id" in req.body &&
      (typeof req.body.id === "string" || typeof req.body.id === "number")
    ) {
      return res.status(400).json({
        error: "Not a valid JSON RPC request format",
        id: req.body.id,
      });
    }

    return res.status(400).send();
  }

  const { id, method, params } = req.body;
  const fn = functions.getFunction(method);
  let body: RpcResponse | undefined = undefined;

  if (!fn) {
    if (id) {
      body = { error: `Method ${method} does not exist.`, id };
    }

    return res.status(404).json(body);
  }

  try {
    await fn.fn(params.event, new Step(params.cache, fn.id));
    if (id) {
      body = {
        id,
        result: {
          type: "complete",
        },
      };
    }
  } catch (e) {
    if (!id) {
      body = undefined;
    } else if (e instanceof StepComplete) {
      if (e.stepValue === undefined) e.stepValue = null;
      body = {
        id,
        result: { type: "step", stepId: e.stepId, stepValue: e.stepValue },
      };
    } else if (e instanceof DelayInitiated) {
      body = {
        id,
        result: { type: "delay", stepId: e.stepId, delayInMs: e.delayInMs },
      };
    } else if (e instanceof InvokeInitiated) {
      body = {
        id,
        result: {
          type: "invoke",
          stepId: e.stepId,
          invokedFnName: e.invokedFnName,
          payload: e.payload,
        },
      };
    } else if (e instanceof EventEmitted) {
      body = {
        id,
        result: {
          type: "emitEvent",
          stepId: e.stepId,
          eventId: e.eventId,
          payload: e.payload,
        },
      };
    } else if (e instanceof Error) {
      body = { error: JSON.stringify(e, Object.getOwnPropertyNames(e)), id };
    } else if (typeof e === "string") {
      body = { error: e, id };
    }
  }
  return res.status(200).json(body);
});

export default router;
