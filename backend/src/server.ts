import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PolicyEngine } from './services/policy-engine.js';
import { TransactionExecutor } from './services/transaction-executor.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { agentsRouter } from './routes/agents.js';
import { createPaymentsRouter } from './routes/payments.js';
import { createAuditRouter } from './routes/audit.js';
import { StellarAdapter } from '../../src/chains/stellar/client.js';
import { EVMAdapter } from '../../src/chains/evm/client.js';
import { NetworkConfig } from '../../src/config/networks.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(helmet());
app.use(cors());
app.use(express.json());

const policyEngine = new PolicyEngine();

const adapters = new Map();
adapters.set('stellar', new StellarAdapter({ network: NetworkConfig.getStellarNetwork('TESTNET') }));
adapters.set('evm', new EVMAdapter({ network: NetworkConfig.getEVMNetwork('SEPOLIA') }));

const transactionExecutor = new TransactionExecutor(policyEngine, adapters);

app.use('/api', rateLimitMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/agents', authMiddleware, agentsRouter);
app.use('/api/payments', authMiddleware, createPaymentsRouter(transactionExecutor));
app.use('/api/transactions', authMiddleware, (req, res) => {
  if (req.params.id) {
    const record = transactionExecutor.getTransaction(req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ transaction: record });
  } else {
    res.json({ transactions: transactionExecutor.getAllTransactions() });
  }
});
app.use('/api/audit', authMiddleware, createAuditRouter(transactionExecutor));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export { app };
