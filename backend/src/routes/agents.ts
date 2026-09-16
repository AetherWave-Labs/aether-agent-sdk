import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AgentRecord } from '../types/index.js';

const router = Router();
const agents = new Map<string, AgentRecord>();

router.get('/', (_req: Request, res: Response) => {
  res.json({ agents: Array.from(agents.values()) });
});

router.get('/:id', (req: Request, res: Response) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json({ agent });
});

router.post('/', (req: Request, res: Response) => {
  const { name, chainType, network, signerAddress, policy } = req.body;

  if (!name || !chainType || !network || !signerAddress) {
    res.status(400).json({ error: 'Missing required fields: name, chainType, network, signerAddress' });
    return;
  }

  if (!['stellar', 'evm'].includes(chainType)) {
    res.status(400).json({ error: 'chainType must be "stellar" or "evm"' });
    return;
  }

  const agent: AgentRecord = {
    id: uuidv4(),
    name,
    chainType,
    network,
    signerAddress,
    policy: policy || {},
    createdAt: new Date().toISOString(),
  };

  agents.set(agent.id, agent);
  res.status(201).json({ agent });
});

router.put('/:id', (req: Request, res: Response) => {
  const existing = agents.get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }

  const { name, policy, signerAddress } = req.body;
  if (name) existing.name = name;
  if (policy) existing.policy = policy;
  if (signerAddress) existing.signerAddress = signerAddress;

  agents.set(req.params.id, existing);
  res.json({ agent: existing });
});

router.delete('/:id', (req: Request, res: Response) => {
  if (!agents.has(req.params.id)) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  agents.delete(req.params.id);
  res.status(204).send();
});

export { router as agentsRouter };
export { agents };
