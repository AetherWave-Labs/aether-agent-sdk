import { ChainAdapter, TransactionResult } from '../chains/types.js';
import { PolicyError, ValidationError } from '../errors/transaction.js';
import { PaymentManager } from '../payments/payment.js';
import { PaymentRequest } from '../payments/types.js';
import { AgentConfig, AgentPolicy, AgentState } from './types.js';

export class Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly adapter: ChainAdapter;
  private policy: AgentPolicy;
  private signerAddress?: string;
  private paymentManager: PaymentManager;
  private spentToday: number = 0;
  private txCountToday: number = 0;
  private lastActive: number = Date.now();

  constructor(config: AgentConfig) {
    if (!config.id || config.id.trim() === '') {
      throw new ValidationError('Agent ID cannot be empty');
    }
    if (!config.name || config.name.trim() === '') {
      throw new ValidationError('Agent Name cannot be empty');
    }

    this.id = config.id;
    this.name = config.name;
    this.adapter = config.adapter;
    this.policy = config.policy ?? {};
    this.signerAddress = config.signerAddress;
    this.paymentManager = new PaymentManager(this.adapter, this.signerAddress);
  }

  public getPolicy(): AgentPolicy {
    return { ...this.policy };
  }

  public updatePolicy(policy: Partial<AgentPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  public getState(): AgentState {
    return {
      id: this.id,
      name: this.name,
      totalSpentToday: this.spentToday.toFixed(4),
      transactionCountToday: this.txCountToday,
      lastActiveTimestamp: this.lastActive,
    };
  }

  public evaluatePolicy(request: PaymentRequest): void {
    const amountNum = Number(request.amount);

    if (this.policy.maxAmountPerTransaction) {
      const maxTx = Number(this.policy.maxAmountPerTransaction);
      if (amountNum > maxTx) {
        throw new PolicyError(
          `Payment amount ${request.amount} exceeds max single transaction limit of ${this.policy.maxAmountPerTransaction}`
        );
      }
    }

    if (this.policy.dailySpendingLimit) {
      const dailyLimit = Number(this.policy.dailySpendingLimit);
      if (this.spentToday + amountNum > dailyLimit) {
        throw new PolicyError(
          `Payment would exceed daily spending limit of ${this.policy.dailySpendingLimit} (Spent today: ${this.spentToday}, Attempted: ${amountNum})`
        );
      }
    }

    if (this.policy.allowedRecipients && this.policy.allowedRecipients.length > 0) {
      if (!this.policy.allowedRecipients.includes(request.recipient)) {
        throw new PolicyError(
          `Recipient ${request.recipient} is not in the policy allowed recipients list`
        );
      }
    }

    if (this.policy.allowedAssets && this.policy.allowedAssets.length > 0) {
      if (!this.policy.allowedAssets.includes(request.asset)) {
        throw new PolicyError(`Asset ${request.asset} is not in the policy allowed assets list`);
      }
    }

    if (this.policy.requireMemo && !request.memo) {
      throw new PolicyError('Policy requires a memo for all transactions.');
    }
  }

  public async executePayment(request: PaymentRequest): Promise<TransactionResult> {
    this.lastActive = Date.now();
    this.evaluatePolicy(request);

    const result = await this.paymentManager.execute({
      ...request,
      sender: request.sender ?? this.signerAddress,
    });

    if (result.success) {
      this.spentToday += Number(request.amount);
      this.txCountToday += 1;
    }

    return result;
  }
}
