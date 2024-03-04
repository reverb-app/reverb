import express, { Request, Response } from 'express';
import { RpcRequest, RpcResponse } from '../types/types';
import functions from '../services/fn';

const router = express.Router();

router.use(express.json());

router.post(
  '/',
  (req: Request<{}, {}, RpcRequest>, res: Response<RpcResponse>) => {
    const id = req.body.id;
    const fn = functions.getFunction(req.body.method);
    let body: RpcResponse | undefined = undefined;

    if (!fn) {
      if (id) {
        body = { error: `Method ${req.body.method} does not exist.`, id };
      }

      return res.status(400).json(body);
    }

    try {
      const result = fn.fn(req.body.params.event);
      if (id) {
        body = { result, id };
      }
    } catch (e) {
      if (id && (e instanceof Error || typeof e === 'string')) {
        body = { error: e, id };
      }
    }
    return res.status(200).json(body);
  }
);

export default router;
