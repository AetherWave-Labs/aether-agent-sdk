import { describe, it, expect } from 'vitest';
import * as AetherSDK from '../src/index.js';

describe('Aether Agent SDK Entry Point', () => {
  it('exports core classes and objects', () => {
    expect(AetherSDK.Agent).toBeDefined();
    expect(AetherSDK.PaymentManager).toBeDefined();
    expect(AetherSDK.NetworkConfig).toBeDefined();
    expect(AetherSDK.StellarAdapter).toBeDefined();
    expect(AetherSDK.EVMAdapter).toBeDefined();
    expect(AetherSDK.RPCClient).toBeDefined();
    expect(AetherSDK.ProviderPool).toBeDefined();
    expect(AetherSDK.AetherError).toBeDefined();
    expect(AetherSDK.ValidationError).toBeDefined();
    expect(AetherSDK.PolicyError).toBeDefined();
    expect(AetherSDK.TransactionError).toBeDefined();
    expect(AetherSDK.NetworkError).toBeDefined();
    expect(AetherSDK.ContractError).toBeDefined();
  });
});
