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
    const provider = this.providers[this.currentIndex];
    if (!provider) {
      throw new Error('No RPC providers available in pool');
    }
    return provider;
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
    this.rotate();
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
