import { NetworkConfigType } from '../config/networks.js';

export type ChainType = 'stellar' | 'evm';

export interface PreparedTransaction {
  id: string;
  chain: ChainType;
  network: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  data?: unknown;
  estimatedFee?: string;
  nonce?: number | string;
  memo?: string;
}

export interface SimulationResult {
  success: boolean;
  estimatedFee: string;
  gasOrCpuUsed?: string;
  logs?: string[];
  error?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  ledgerOrBlockNumber?: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  feePaid?: string;
  timestamp: number;
  error?: string;
}

export interface ChainAdapter {
  readonly chainType: ChainType;
  getNetwork(): NetworkConfigType;
  getBalance(address: string, asset?: string): Promise<string>;
  prepareTransaction(params: {
    from: string;
    to: string;
    amount: string;
    asset: string;
    memo?: string;
  }): Promise<PreparedTransaction>;
  simulateTransaction(tx: PreparedTransaction): Promise<SimulationResult>;
  submitTransaction(tx: PreparedTransaction): Promise<TransactionResult>;
}
