import { ChainAdapter } from '../chains/types.js';

export interface AgentPolicy {
  maxAmountPerTransaction?: string;
  dailySpendingLimit?: string;
  allowedRecipients?: string[];
  allowedAssets?: string[];
  requireMemo?: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  adapter: ChainAdapter;
  policy?: AgentPolicy;
  signerAddress?: string;
}

export interface AgentDecision<T = unknown> {
  action: 'PAYMENT' | 'CONTRACT_CALL' | 'QUERY' | 'IDLE';
  confidence: number;
  payload: T;
  rationale?: string;
}

export interface AgentState {
  id: string;
  name: string;
  totalSpentToday: string;
  transactionCountToday: number;
  lastActiveTimestamp: number;
}
