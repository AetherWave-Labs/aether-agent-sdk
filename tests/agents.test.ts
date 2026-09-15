import { describe, it, expect } from 'vitest';
import { Agent } from '../src/agents/agent.js';
import { StellarAdapter } from '../src/chains/stellar/client.js';
import { NetworkConfig } from '../src/config/networks.js';
import { PolicyError, ValidationError } from '../src/errors/transaction.js';

describe('Agent', () => {
  const adapter = new StellarAdapter({ network: NetworkConfig.getStellarNetwork('TESTNET') });
  const sender = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const recipient = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

  it('instantiates agent and validates fields', () => {
    const agent = new Agent({
      id: 'agent-1',
      name: 'Test Agent',
      adapter,
      signerAddress: sender,
    });

    expect(agent.id).toBe('agent-1');
    expect(agent.name).toBe('Test Agent');
    expect(agent.getState().totalSpentToday).toBe('0.0000');
  });

  it('throws on empty ID or Name', () => {
    expect(() => new Agent({ id: '', name: 'Test', adapter })).toThrow(ValidationError);
    expect(() => new Agent({ id: 'id', name: '', adapter })).toThrow(ValidationError);
  });

  it('enforces single transaction limit policy', async () => {
    const agent = new Agent({
      id: 'agent-1',
      name: 'Test Agent',
      adapter,
      signerAddress: sender,
      policy: {
        maxAmountPerTransaction: '50.00',
      },
    });

    await expect(
      agent.executePayment({
        recipient,
        amount: '60.00',
        asset: 'USDC',
      })
    ).rejects.toThrow(PolicyError);
  });

  it('enforces daily limit policy', async () => {
    const agent = new Agent({
      id: 'agent-1',
      name: 'Test Agent',
      adapter,
      signerAddress: sender,
      policy: {
        maxAmountPerTransaction: '100.00',
        dailySpendingLimit: '100.00',
      },
    });

    // 1st payment: 60 (success)
    const res1 = await agent.executePayment({
      recipient,
      amount: '60.00',
      asset: 'USDC',
    });
    expect(res1.success).toBe(true);
    expect(agent.getState().totalSpentToday).toBe('60.0000');

    // 2nd payment: 50 (would exceed 100 limit -> reject)
    await expect(
      agent.executePayment({
        recipient,
        amount: '50.00',
        asset: 'USDC',
      })
    ).rejects.toThrow(PolicyError);
  });

  it('enforces allowed recipients list', async () => {
    const agent = new Agent({
      id: 'agent-1',
      name: 'Test Agent',
      adapter,
      signerAddress: sender,
      policy: {
        allowedRecipients: [recipient],
      },
    });

    const unauthorizedRecipient = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    await expect(
      agent.executePayment({
        recipient: unauthorizedRecipient,
        amount: '10.00',
        asset: 'USDC',
      })
    ).rejects.toThrow(PolicyError);
  });
});
