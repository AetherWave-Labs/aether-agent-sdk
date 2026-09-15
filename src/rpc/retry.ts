import { RetryConfig } from './types.js';

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffFactor: 2,
  jitter: true,
};

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateBackoff(attempt: number, config: RetryConfig): number {
  const factor = config.backoffFactor ?? 2;
  const maxDelay = config.maxDelayMs ?? 5000;
  let delay = config.initialDelayMs * Math.pow(factor, attempt);

  if (config.jitter) {
    const jitterMultiplier = 0.5 + Math.random() * 0.5;
    delay = Math.round(delay * jitterMultiplier);
  }

  return Math.min(delay, maxDelay);
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  customConfig?: Partial<RetryConfig>,
  shouldRetry?: (error: unknown) => boolean
): Promise<T> {
  const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...customConfig };
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= config.maxAttempts - 1) {
        break;
      }

      if (shouldRetry && !shouldRetry(error)) {
        break;
      }

      const delay = calculateBackoff(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError;
}
