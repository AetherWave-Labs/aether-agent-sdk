import { PaymentRequest, ValidationResult } from './types.js';

export function validatePaymentRequest(request: PaymentRequest): ValidationResult {
  const errors: string[] = [];

  if (
    !request.recipient ||
    typeof request.recipient !== 'string' ||
    request.recipient.trim() === ''
  ) {
    errors.push('Recipient address is required and cannot be empty.');
  }

  if (!request.amount || typeof request.amount !== 'string') {
    errors.push('Amount is required and must be provided as a string.');
  } else {
    const num = Number(request.amount);
    if (isNaN(num) || num <= 0) {
      errors.push(`Amount must be a positive number, received: "${request.amount}".`);
    }
  }

  if (!request.asset || typeof request.asset !== 'string' || request.asset.trim() === '') {
    errors.push('Asset code/identifier is required.');
  }

  if (request.memo && request.memo.length > 28) {
    // Stellar memo text length limit is 28 bytes
    errors.push('Memo text exceeds 28 characters.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
