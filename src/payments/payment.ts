import { ChainAdapter, PreparedTransaction, TransactionResult } from '../chains/types.js';
import { ValidationError } from '../errors/transaction.js';
import { PaymentRequest, ValidationResult } from './types.js';
import { validatePaymentRequest } from './validators.js';

export class PaymentManager {
  private adapter: ChainAdapter;
  private defaultSender?: string;

  constructor(adapter: ChainAdapter, defaultSender?: string) {
    this.adapter = adapter;
    this.defaultSender = defaultSender;
  }

  public validateRequest(request: PaymentRequest): ValidationResult {
    return validatePaymentRequest(request);
  }

  public async preparePayment(request: PaymentRequest): Promise<PreparedTransaction> {
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      throw new ValidationError(
        `Payment validation failed: ${validation.errors.join('; ')}`,
        validation.errors
      );
    }

    const sender = request.sender ?? this.defaultSender;
    if (!sender) {
      throw new ValidationError('Sender address is required to prepare a transaction.');
    }

    return this.adapter.prepareTransaction({
      from: sender,
      to: request.recipient,
      amount: request.amount,
      asset: request.asset,
      memo: request.memo,
    });
  }

  public async execute(request: PaymentRequest): Promise<TransactionResult> {
    const tx = await this.preparePayment(request);
    return this.adapter.submitTransaction(tx);
  }
}
