import { Router, Request, Response } from 'express';
import { TransactionExecutor } from '../services/transaction-executor.js';

export function createAuditRouter(executor: TransactionExecutor): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    const events = executor.getAuditLog();
    res.json({ events });
  });

  router.get('/agent/:agentId', (req: Request, res: Response) => {
    const events = executor.getAuditLog().filter((e) => e.agentId === req.params.agentId);
    res.json({ events });
  });

  return router;
}
