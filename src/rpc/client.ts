import { NetworkError } from '../errors/transaction.js';
import { ProviderPool } from './providers.js';
import { withRetry } from './retry.js';
import { JSONRPCRequest, JSONRPCResponse, RPCClientConfig } from './types.js';

export class RPCClient {
  private pool: ProviderPool;
  private headers: Record<string, string>;
  private timeoutMs: number;
  private retryConfig?: RPCClientConfig['retryConfig'];
  private requestIdCounter: number = 1;

  constructor(config: RPCClientConfig) {
    this.pool = new ProviderPool(config.primaryUrl, config.fallbackUrls ?? []);
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.retryConfig = config.retryConfig;
  }

  public getPool(): ProviderPool {
    return this.pool;
  }

  public async call<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    const id = this.requestIdCounter++;
    const payload: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return withRetry(async () => {
      const url = this.pool.getActiveProvider();
      const start = Date.now();

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          this.pool.markFailure(url);
          throw new NetworkError(
            `RPC HTTP error ${response.status}: ${response.statusText}`,
            { status: response.status },
            url
          );
        }

        const data = (await response.json()) as JSONRPCResponse<T>;
        const latency = Date.now() - start;

        if (data.error) {
          throw new NetworkError(
            `RPC Error: ${data.error.message} (Code: ${data.error.code})`,
            data.error,
            url
          );
        }

        this.pool.markSuccess(url, latency);
        return data.result as T;
      } catch (error) {
        if (error instanceof NetworkError) {
          throw error;
        }
        this.pool.markFailure(url);
        throw new NetworkError(
          `Failed to communicate with RPC endpoint ${url}: ${
            error instanceof Error ? error.message : String(error)
          }`,
          error,
          url
        );
      }
    }, this.retryConfig);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Standard EVM / JSON-RPC health call
      await this.call('net_version', []);
      return true;
    } catch {
      return false;
    }
  }
}
