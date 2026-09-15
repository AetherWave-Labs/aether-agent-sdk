import { EVMAdapter } from './client.js';
import { PreparedTransaction, TransactionResult } from '../types.js';

export interface EVMPaymentParams {
  from: string;
  to: string;
  amount: string;
  asset?: string;
  tokenAddress?: string;
  memo?: string;
}

export class EVMPaymentHandler {
  private adapter: EVMAdapter;

  constructor(adapter: EVMAdapter) {
    this.adapter = adapter;
  }

  public async buildPayment(params: EVMPaymentParams): Promise<PreparedTransaction> {
    return this.adapter.prepareTransaction({
      from: params.from,
      to: params.to,
      amount: params.amount,
      asset: params.asset ?? 'ETH',
      memo: params.memo,
    });
  }

  public async executePayment(params: EVMPaymentParams): Promise<TransactionResult> {
    const tx = await this.buildPayment(params);
    return this.adapter.submitTransaction(tx);
  }
}
