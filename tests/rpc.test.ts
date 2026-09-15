import { describe, it, expect } from 'vitest';
import { ProviderPool } from '../src/rpc/providers.js';
import { withRetry, calculateBackoff } from '../src/rpc/retry.js';
import { RPCClient } from '../src/rpc/client.js';

describe('RPC ProviderPool', () => {
  it('initializes and provides active provider', () => {
    const pool = new ProviderPool('https://primary.rpc', ['https://fallback.rpc']);
    expect(pool.getActiveProvider()).toBe('https://primary.rpc');
    expect(pool.getAllProviders()).toEqual(['https://primary.rpc', 'https://fallback.rpc']);
  });

  it('rotates to fallback upon failure', () => {
    const pool = new ProviderPool('https://primary.rpc', ['https://fallback.rpc']);
    pool.markFailure('https://primary.rpc');
    expect(pool.getActiveProvider()).toBe('https://fallback.rpc');
  });

  it('updates provider health status on success', () => {
    const pool = new ProviderPool('https://primary.rpc');
    pool.markSuccess('https://primary.rpc', 45);
    const statuses = pool.getStatus();
    expect(statuses[0]?.latencyMs).toBe(45);
    expect(statuses[0]?.isHealthy).toBe(true);
  });
});

describe('RPC Retry logic', () => {
  it('calculates backoff with bounds', () => {
    const delay = calculateBackoff(1, {
      maxAttempts: 3,
      initialDelayMs: 100,
      maxDelayMs: 1000,
      backoffFactor: 2,
      jitter: false,
    });
    expect(delay).toBe(200);
  });

  it('retries failing async operation', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Transient network error');
        }
        return 'success';
      },
      { maxAttempts: 4, initialDelayMs: 10, jitter: false }
    );

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('throws error when maxAttempts exceeded', async () => {
    await expect(
      withRetry(
        async () => {
          throw new Error('Persistent failure');
        },
        { maxAttempts: 2, initialDelayMs: 5, jitter: false }
      )
    ).rejects.toThrow('Persistent failure');
  });
});

describe('RPCClient', () => {
  it('instantiates correctly with pool', () => {
    const client = new RPCClient({
      primaryUrl: 'https://rpc.example.com',
      fallbackUrls: ['https://rpc2.example.com'],
    });

    expect(client.getPool().getAllProviders().length).toBe(2);
  });
});
