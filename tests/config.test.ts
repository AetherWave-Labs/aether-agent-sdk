import { describe, it, expect } from 'vitest';
import { NetworkConfig, STELLAR_NETWORKS, EVM_NETWORKS } from '../src/config/networks.js';

describe('NetworkConfig', () => {
  it('loads Stellar presets correctly', () => {
    const mainnet = NetworkConfig.getStellarNetwork('MAINNET');
    expect(mainnet.type).toBe('stellar');
    expect(mainnet.networkPassphrase).toBe(STELLAR_NETWORKS.MAINNET.networkPassphrase);
    expect(mainnet.horizonUrl).toBe('https://horizon.stellar.org');

    const testnet = NetworkConfig.getStellarNetwork('TESTNET');
    expect(testnet.name).toBe('Stellar Test Network');
  });

  it('verifies EVM_NETWORKS map contains standard networks', () => {
    expect(EVM_NETWORKS.MAINNET.chainId).toBe(1);
    expect(EVM_NETWORKS.SEPOLIA.chainId).toBe(11155111);
  });

  it('throws on unknown Stellar network', () => {
    expect(() => {
      // @ts-expect-error test invalid string
      NetworkConfig.getStellarNetwork('INVALID_NET');
    }).toThrow(/Unknown Stellar network type/);
  });

  it('loads EVM presets correctly', () => {
    const sepolia = NetworkConfig.getEVMNetwork('SEPOLIA');
    expect(sepolia.type).toBe('evm');
    expect(sepolia.chainId).toBe(11155111);
    expect(sepolia.nativeCurrency.symbol).toBe('ETH');

    const base = NetworkConfig.getEVMNetwork('BASE');
    expect(base.chainId).toBe(8453);
  });

  it('supports custom EVM configuration', () => {
    const custom = NetworkConfig.getEVMNetwork({
      name: 'Custom Chain',
      chainId: 9999,
      rpcUrl: 'https://rpc.custom.org',
    });
    expect(custom.name).toBe('Custom Chain');
    expect(custom.chainId).toBe(9999);
    expect(custom.rpcUrl).toBe('https://rpc.custom.org');
  });
});
