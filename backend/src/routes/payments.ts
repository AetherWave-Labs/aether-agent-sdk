import { Router, Request, Response } from 'express';
import { TransactionExecutor } from '../services/transaction-executor.js';
import { agents } from './agents.js';
import { PaymentRequestDTO } from '../types/index.js';

export function createPaymentsRouter(executor: TransactionExecutor): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const { agentId, recipient, amount, asset, memo, maxFee }: PaymentRequestDTO = req.body;

    if (!agentId || !recipient || !amount || !asset) {
      res.status(400).json({
        error: 'Missing required fields: agentId, recipient, amount, asset',
      });
      return;
    }

    const agent = agents.get(agentId);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const request: PaymentRequestDTO = { agentId, recipient, amount, asset, memo, maxFee };

    try {
      const record = await executor.executePayment(agent, request);
      res.status(record.status === 'REJECTED' ? 403 : record.status === 'FAILED' ? 500 : 201).json({ transaction: record });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Transaction execution failed',
      });
    }
  });

  router.get('/', (_req: Request, res: Response) => {
    const transactions = executor.getAllTransactions();
    res.json({ transactions });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const record = executor.getTransaction(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ transaction: record });
  });

  return router;
}
