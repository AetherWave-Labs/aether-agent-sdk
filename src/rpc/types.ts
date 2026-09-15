export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
}

export interface RPCClientConfig {
  primaryUrl: string;
  fallbackUrls?: string[];
  headers?: Record<string, string>;
  timeoutMs?: number;
  retryConfig?: Partial<RetryConfig>;
}

export interface JSONRPCRequest<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: T;
}

export interface JSONRPCResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface RPCProviderStatus {
  url: string;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: number;
}
