import { describe, it, expect } from 'vitest';
import { StellarAdapter } from '../src/chains/stellar/client.js';
import { EVMAdapter } from '../src/chains/evm/client.js';
import { NetworkConfig } from '../src/config/networks.js';

describe('StellarAdapter', () => {
  const testnet = NetworkConfig.getStellarNetwork('TESTNET');
  const adapter = new StellarAdapter({ network: testnet });
  const validSender = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const validRecipient = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

  it('validates Stellar addresses', () => {
    expect(adapter.validateAddress(validSender)).toBe(true);
    expect(adapter.validateAddress('INVALID_ADDR')).toBe(false);
  });

  it('prepares and submits transactions', async () => {
    const tx = await adapter.prepareTransaction({
      from: validSender,
      to: validRecipient,
      amount: '10.0',
      asset: 'USDC',
      memo: 'Test memo',
    });

    expect(tx.chain).toBe('stellar');
    expect(tx.amount).toBe('10.0');

    const result = await adapter.submitTransaction(tx);
    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
    expect(result.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('gets balance', async () => {
    const balance = await adapter.getBalance(validSender);
    expect(Number(balance)).toBeGreaterThan(0);
  });
});

describe('EVMAdapter', () => {
  const sepolia = NetworkConfig.getEVMNetwork('SEPOLIA');
  const adapter = new EVMAdapter({ network: sepolia });
  const validSender = '0x1111111111111111111111111111111111111111';
  const validRecipient = '0x2222222222222222222222222222222222222222';

  it('validates EVM addresses', () => {
    expect(adapter.validateAddress(validSender)).toBe(true);
    expect(adapter.validateAddress('0xInvalid')).toBe(false);
  });

  it('prepares and simulates transactions', async () => {
    const tx = await adapter.prepareTransaction({
      from: validSender,
      to: validRecipient,
      amount: '0.1',
      asset: 'ETH',
    });

    expect(tx.chain).toBe('evm');

    const sim = await adapter.simulateTransaction(tx);
    expect(sim.success).toBe(true);

    const result = await adapter.submitTransaction(tx);
    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
  });
});
