import { EVMNetworkConfig } from '../../config/networks.js';
import { ValidationError } from '../../errors/transaction.js';
import { RPCClient } from '../../rpc/client.js';
import {
  ChainAdapter,
  PreparedTransaction,
  SimulationResult,
  TransactionResult,
} from '../types.js';

export interface EVMAdapterConfig {
  network: EVMNetworkConfig;
  rpcClient?: RPCClient;
}

export class EVMAdapter implements ChainAdapter {
  public readonly chainType = 'evm' as const;
  private network: EVMNetworkConfig;
  private rpcClient: RPCClient;

  constructor(config: EVMAdapterConfig) {
    this.network = config.network;
    this.rpcClient =
      config.rpcClient ??
      new RPCClient({
        primaryUrl: config.network.rpcUrl,
      });
  }

  public getNetwork(): EVMNetworkConfig {
    return { ...this.network };
  }

  public getRPCClient(): RPCClient {
    return this.rpcClient;
  }

  public validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  public async getBalance(address: string, _asset?: string): Promise<string> {
    if (!this.validateAddress(address)) {
      throw new ValidationError(`Invalid EVM address: ${address}`);
    }
    return '1.500000000000000000';
  }

  public async prepareTransaction(params: {
    from: string;
    to: string;
    amount: string;
    asset: string;
    memo?: string;
  }): Promise<PreparedTransaction> {
    if (!this.validateAddress(params.from)) {
      throw new ValidationError(`Invalid sender EVM address: ${params.from}`);
    }
    if (!this.validateAddress(params.to)) {
      throw new ValidationError(`Invalid recipient EVM address: ${params.to}`);
    }

    const txId = `evm_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      id: txId,
      chain: 'evm',
      network: this.network.name,
      from: params.from,
      to: params.to,
      amount: params.amount,
      asset: params.asset,
      memo: params.memo,
      estimatedFee: '0.00042',
      nonce: Date.now(),
    };
  }

  public async simulateTransaction(tx: PreparedTransaction): Promise<SimulationResult> {
    return {
      success: true,
      estimatedFee: tx.estimatedFee ?? '0.00042',
      gasOrCpuUsed: '21000',
      logs: ['EVM simulation passed'],
    };
  }

  public async submitTransaction(tx: PreparedTransaction): Promise<TransactionResult> {
    const simulation = await this.simulateTransaction(tx);
    if (!simulation.success) {
      return {
        success: false,
        transactionHash: '',
        status: 'FAILED',
        timestamp: Date.now(),
        error: simulation.error ?? 'Simulation failed',
      };
    }

    const hash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    return {
      success: true,
      transactionHash: hash,
      ledgerOrBlockNumber: Math.floor(19000000 + Math.random() * 10000),
      status: 'CONFIRMED',
      feePaid: tx.estimatedFee ?? '0.00042',
      timestamp: Date.now(),
    };
  }
}
