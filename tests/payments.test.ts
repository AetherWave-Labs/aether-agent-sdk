import { describe, it, expect } from 'vitest';
import { validatePaymentRequest } from '../src/payments/validators.js';
import { PaymentManager } from '../src/payments/payment.js';
import { StellarAdapter } from '../src/chains/stellar/client.js';
import { NetworkConfig } from '../src/config/networks.js';

describe('Payment Validators', () => {
  it('validates a correct payment request', () => {
    const result = validatePaymentRequest({
      recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      amount: '50.00',
      asset: 'USDC',
    });

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('detects invalid amounts', () => {
    const resNegative = validatePaymentRequest({
      recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      amount: '-10',
      asset: 'USDC',
    });
    expect(resNegative.valid).toBe(false);

    const resNonNumber = validatePaymentRequest({
      recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      amount: 'abc',
      asset: 'USDC',
    });
    expect(resNonNumber.valid).toBe(false);
  });

  it('detects missing recipient or asset', () => {
    const res = validatePaymentRequest({
      recipient: '',
      amount: '10',
      asset: '',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('PaymentManager', () => {
  const adapter = new StellarAdapter({ network: NetworkConfig.getStellarNetwork('TESTNET') });
  const sender = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const recipient = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

  it('executes payment successfully with default sender', async () => {
    const manager = new PaymentManager(adapter, sender);
    const result = await manager.execute({
      recipient,
      amount: '12.50',
      asset: 'USDC',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
  });

  it('throws ValidationError if sender is missing', async () => {
    const manager = new PaymentManager(adapter);
    await expect(
      manager.execute({
        recipient,
        amount: '10',
        asset: 'USDC',
      })
    ).rejects.toThrow(/Sender address is required/);
  });
});
