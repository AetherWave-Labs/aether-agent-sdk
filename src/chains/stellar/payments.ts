import { StellarAdapter } from './client.js';
import { PreparedTransaction, TransactionResult } from '../types.js';

export interface StellarPaymentParams {
  from: string;
  to: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
}

export class StellarPaymentHandler {
  private adapter: StellarAdapter;

  constructor(adapter: StellarAdapter) {
    this.adapter = adapter;
  }

  public async buildPayment(params: StellarPaymentParams): Promise<PreparedTransaction> {
    const asset = params.assetCode === 'USDC' ? 'USDC' : (params.assetCode ?? 'XLM');
    return this.adapter.prepareTransaction({
      from: params.from,
      to: params.to,
      amount: params.amount,
      asset,
      memo: params.memo,
    });
  }

  public async executePayment(params: StellarPaymentParams): Promise<TransactionResult> {
    const tx = await this.buildPayment(params);
    return this.adapter.submitTransaction(tx);
  }
}
