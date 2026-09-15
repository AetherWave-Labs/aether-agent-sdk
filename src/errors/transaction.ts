/**
 * Comprehensive error hierarchy for Aether Agent SDK.
 */

export class AetherError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly timestamp: number;

  constructor(message: string, code: string = 'AETHER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class ValidationError extends AetherError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class PolicyError extends AetherError {
  constructor(message: string, details?: unknown) {
    super(message, 'POLICY_VIOLATION', details);
  }
}

export class TransactionError extends AetherError {
  public readonly transactionId?: string;

  constructor(message: string, details?: unknown, transactionId?: string) {
    super(message, 'TRANSACTION_ERROR', details);
    this.transactionId = transactionId;
  }
}

export class NetworkError extends AetherError {
  public readonly endpoint?: string;

  constructor(message: string, details?: unknown, endpoint?: string) {
    super(message, 'NETWORK_ERROR', details);
    this.endpoint = endpoint;
  }
}

export class ContractError extends AetherError {
  public readonly contractAddress?: string;

  constructor(message: string, details?: unknown, contractAddress?: string) {
    super(message, 'CONTRACT_ERROR', details);
    this.contractAddress = contractAddress;
  }
}
