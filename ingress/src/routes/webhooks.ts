import express, { Request } from 'express';
import { Event } from '../types/types';
import { addEvent } from '../services/pg-service';
import { v4 } from 'uuid';

const router = express.Router();

router.post('/', (req: Request<{}, {}, Event>, res) => {
  addEvent({
    name: 'reverb_received_webhook',
    payload: { webhook: { headers: req.headers, body: req.body } },
    id: v4(),
  });
  res.status(200);
  return res.send();
});

export default router;
