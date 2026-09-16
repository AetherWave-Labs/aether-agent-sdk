import { AgentPolicy } from '../../src/agents/types.js';
import { TransactionResult, SimulationResult, PreparedTransaction } from '../../src/chains/types.js';

export interface BackendAgentConfig {
  id: string;
  name: string;
  chainType: 'stellar' | 'evm';
  network: string;
  signerAddress: string;
  policy?: AgentPolicy;
}

export interface PaymentRequestDTO {
  agentId: string;
  recipient: string;
  amount: string;
  asset: string;
  memo?: string;
  maxFee?: string;
}

export interface TransactionRecord {
  id: string;
  agentId: string;
  status: 'PENDING' | 'SIMULATING' | 'SIGNING' | 'SUBMITTING' | 'CONFIRMED' | 'FAILED' | 'REJECTED';
  request: PaymentRequestDTO;
  preparedTx?: PreparedTransaction;
  simulation?: SimulationResult;
  result?: TransactionResult;
  policyRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  agentId: string;
  transactionId: string;
  eventType: 'POLICY_CHECK' | 'POLICY_REJECTION' | 'SIMULATION_START' | 'SIMULATION_COMPLETE' | 'SIGNING' | 'SUBMISSION' | 'CONFIRMATION' | 'FAILURE' | 'UNAUTHORIZED' | 'RATE_LIMIT';
  details: Record<string, unknown>;
}

export interface AgentRecord {
  id: string;
  name: string;
  chainType: 'stellar' | 'evm';
  network: string;
  signerAddress: string;
  policy: AgentPolicy;
  createdAt: string;
}
