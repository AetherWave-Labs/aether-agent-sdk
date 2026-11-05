import { afterEach, describe, it, expect, vi } from 'vitest';
import { ProviderPool } from '../src/rpc/providers.js';
import { withRetry, calculateBackoff } from '../src/rpc/retry.js';
import { RPCClient } from '../src/rpc/client.js';
import { NetworkError } from '../src/errors/transaction.js';

afterEach(() => vi.unstubAllGlobals());

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

  it('records a single-provider failure without selecting it again', () => {
    const pool = new ProviderPool('https://primary.rpc');
    expect(() => pool.markFailure('https://primary.rpc')).not.toThrow();
    expect(() => pool.getActiveProvider()).toThrow('No healthy RPC providers');
    expect(() => pool.rotate()).toThrow('No healthy RPC providers');
  });

  it('reports an exhausted pool without making markFailure throw', () => {
    const pool = new ProviderPool('https://primary.rpc', ['https://fallback.rpc']);
    pool.markFailure('https://primary.rpc');
    expect(() => pool.markFailure('https://fallback.rpc')).not.toThrow();
    expect(pool.getStatus().every(status => !status.isHealthy)).toBe(true);
    expect(() => pool.getActiveProvider()).toThrow('No healthy RPC providers');
    expect(() => pool.rotate()).toThrow('No healthy RPC providers');
  });

  it.each(['https://primary.rpc', 'https://fallback.rpc'])(
    'makes %s selectable after explicit recovery',
    url => {
      const pool = new ProviderPool('https://primary.rpc', ['https://fallback.rpc']);
      pool.markFailure('https://primary.rpc');
      pool.markFailure('https://fallback.rpc');
      pool.markSuccess(url, 12);
      expect(pool.getActiveProvider()).toBe(url);
      expect(pool.rotate()).toBe(url);
    }
  );

  it('keeps the healthy current provider and skips failed entries on rotation', () => {
    const pool = new ProviderPool('https://primary.rpc', [
      'https://failed.rpc',
      'https://fallback.rpc',
    ]);
    pool.markFailure('https://failed.rpc');
    expect(pool.getActiveProvider()).toBe('https://primary.rpc');
    expect(pool.rotate()).toBe('https://fallback.rpc');
    expect(pool.rotate()).toBe('https://primary.rpc');
  });

  it('does not move a healthy selection on repeated failures of another provider', () => {
    const pool = new ProviderPool('https://primary.rpc', ['https://fallback.rpc']);
    pool.markFailure('https://primary.rpc');
    expect(pool.getActiveProvider()).toBe('https://fallback.rpc');
    pool.markFailure('https://primary.rpc');
    expect(pool.getActiveProvider()).toBe('https://fallback.rpc');
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
  const retryConfig = { maxAttempts: 4, initialDelayMs: 0, jitter: false };
  it('instantiates correctly with pool', () => {
    const client = new RPCClient({
      primaryUrl: 'https://rpc.example.com',
      fallbackUrls: ['https://rpc2.example.com'],
    });

    expect(client.getPool().getAllProviders().length).toBe(2);
  });

  it('does not revisit failed providers and preserves the last endpoint failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 503, statusText: 'Service Unavailable' }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new RPCClient({
      primaryUrl: 'https://primary.rpc',
      fallbackUrls: ['https://fallback.rpc'],
      retryConfig,
    });
    await expect(client.call('eth_chainId')).rejects.toMatchObject({
      name: 'NetworkError',
      code: 'NETWORK_ERROR',
      endpoint: 'https://fallback.rpc',
      details: { status: 503 },
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://primary.rpc',
      'https://fallback.rpc',
    ]);
  });

  it('returns a NetworkError with no fetch when the pool was already exhausted', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 503, statusText: 'Service Unavailable' }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new RPCClient({ primaryUrl: 'https://primary.rpc', retryConfig });
    client.getPool().markFailure('https://primary.rpc');
    await expect(client.call('eth_chainId')).rejects.toBeInstanceOf(NetworkError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses an explicitly recovered provider for a later read', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: '0x1' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const client = new RPCClient({
      primaryUrl: 'https://primary.rpc',
      fallbackUrls: ['https://fallback.rpc'],
      retryConfig,
    });
    client.getPool().markFailure('https://primary.rpc');
    client.getPool().markFailure('https://fallback.rpc');
    client.getPool().markSuccess('https://fallback.rpc');
    await expect(client.call('eth_chainId')).resolves.toBe('0x1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://fallback.rpc');
  });
});
