export interface PaymentRequest {
  recipient: string;
  amount: string;
  asset: string;
  sender?: string;
  memo?: string;
  maxFee?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
