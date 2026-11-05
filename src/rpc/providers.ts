import { RPCProviderStatus } from './types.js';

export class ProviderPool {
  private providers: string[];
  private currentIndex: number = 0;
  private healthMap: Map<string, RPCProviderStatus> = new Map();

  constructor(primaryUrl: string, fallbackUrls: string[] = []) {
    this.providers = [primaryUrl, ...fallbackUrls];
    for (const url of this.providers) {
      this.healthMap.set(url, {
        url,
        isHealthy: true,
        latencyMs: 0,
        lastChecked: Date.now(),
      });
    }
  }

  public getActiveProvider(): string {
    for (let offset = 0; offset < this.providers.length; offset++) {
      const index = (this.currentIndex + offset) % this.providers.length;
      const provider = this.providers[index];
      if (provider && this.healthMap.get(provider)?.isHealthy) {
        this.currentIndex = index;
        return provider;
      }
    }
    throw new Error('No healthy RPC providers available in pool');
  }

  public getAllProviders(): string[] {
    return [...this.providers];
  }

  public markFailure(url: string): void {
    const status = this.healthMap.get(url);
    if (status) {
      status.isHealthy = false;
      status.lastChecked = Date.now();
    }
  }

  public markSuccess(url: string, latencyMs: number = 0): void {
    const status = this.healthMap.get(url);
    if (status) {
      status.isHealthy = true;
      status.latencyMs = latencyMs;
      status.lastChecked = Date.now();
    }
  }

  public rotate(): string {
    if (this.providers.length <= 1) {
      return this.getActiveProvider();
    }
    this.currentIndex = (this.currentIndex + 1) % this.providers.length;
    return this.getActiveProvider();
  }

  public getStatus(): RPCProviderStatus[] {
    return Array.from(this.healthMap.values());
  }
}
