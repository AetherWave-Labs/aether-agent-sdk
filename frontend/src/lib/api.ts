const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Agent {
  id: string;
  name: string;
  chainType: 'stellar' | 'evm';
  network: string;
  signerAddress: string;
  policy: {
    maxAmountPerTransaction?: string;
    dailySpendingLimit?: string;
    allowedRecipients?: string[];
    allowedAssets?: string[];
    requireMemo?: boolean;
  };
  createdAt: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  status: 'PENDING' | 'SIMULATING' | 'SIGNING' | 'SUBMITTING' | 'CONFIRMED' | 'FAILED' | 'REJECTED';
  request: {
    recipient: string;
    amount: string;
    asset: string;
    memo?: string;
  };
  policyRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  agentId: string;
  transactionId: string;
  eventType: string;
  details: Record<string, unknown>;
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY || 'dev-key-123'}`,
};

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/api/agents`, { headers });
  const data = await res.json();
  return data.agents || [];
}

export async function createAgent(agent: Omit<Agent, 'id' | 'createdAt'>): Promise<Agent> {
  const res = await fetch(`${API_BASE}/api/agents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(agent),
  });
  const data = await res.json();
  return data.agent;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/api/payments`, { headers });
  const data = await res.json();
  return data.transactions || [];
}

export async function createPayment(payment: {
  agentId: string;
  recipient: string;
  amount: string;
  asset: string;
  memo?: string;
}): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payment),
  });
  const data = await res.json();
  return data.transaction;
}

export async function fetchAuditLog(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/api/audit`, { headers });
  const data = await res.json();
  return data.events || [];
}
