import { describe, it, expect } from 'vitest';
import { StellarAdapter } from '../../src/chains/stellar/client.js';
import { EVMAdapter } from '../../src/chains/evm/client.js';
import { NetworkConfig } from '../../src/config/networks.js';
import { Agent } from '../../src/agents/agent.js';
import { PaymentRequest } from '../../src/payments/types.js';

const STELLAR_VALID_SENDER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const STELLAR_VALID_RECIPIENT = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const STELLAR_INVALID_ADDR = 'INVALID_ADDR';

const EVM_VALID_SENDER = '0x1111111111111111111111111111111111111111';
const EVM_VALID_RECIPIENT = '0x2222222222222222222222222222222222222222';

function createStellarAgent(policy?: Record<string, unknown>): Agent {
  const adapter = new StellarAdapter({ network: NetworkConfig.getStellarNetwork('TESTNET') });
  return new Agent({
    id: 'test-agent-stellar',
    name: 'Test Stellar Agent',
    adapter,
    signerAddress: STELLAR_VALID_SENDER,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    policy: policy as any,
  });
}

function createEVMAgent(policy?: Record<string, unknown>): Agent {
  const adapter = new EVMAdapter({ network: NetworkConfig.getEVMNetwork('SEPOLIA') });
  return new Agent({
    id: 'test-agent-evm',
    name: 'Test EVM Agent',
    adapter,
    signerAddress: EVM_VALID_SENDER,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    policy: policy as any,
  });
}

describe('E2E: Complete Agent Payment Workflow', () => {
  // Scenario 1: Successful payment
  it('should complete a successful payment end-to-end', async () => {
    const agent = createStellarAgent();
    const request: PaymentRequest = {
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
      memo: 'Test payment',
    };

    const result = await agent.executePayment(request);

    expect(result.success).toBe(true);
    expect(result.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.status).toBe('CONFIRMED');
  });

  // Scenario 2: Policy rejection - amount exceeds limit
  it('should reject payment when amount exceeds max per transaction', async () => {
    const agent = createStellarAgent({ maxAmountPerTransaction: '100' });
    const request: PaymentRequest = {
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '500',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    };

    await expect(agent.executePayment(request)).rejects.toThrow('exceeds max single transaction limit');
  });

  // Scenario 3: Invalid recipient
  it('should fail when recipient address is invalid', async () => {
    const agent = createStellarAgent();
    const request: PaymentRequest = {
      recipient: STELLAR_INVALID_ADDR,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    };

    await expect(agent.executePayment(request)).rejects.toThrow('Invalid recipient Stellar address');
  });

  // Scenario 4: Invalid amount (negative)
  it('should fail when amount is negative', async () => {
    const agent = createStellarAgent();
    const request: PaymentRequest = {
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '-50',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    };

    await expect(agent.executePayment(request)).rejects.toThrow('positive number');
  });

  // Scenario 5: Insufficient balance (daily limit exceeded)
  it('should reject when daily spending limit would be exceeded', async () => {
    const agent = createStellarAgent({ dailySpendingLimit: '15' });

    await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    });

    await expect(
      agent.executePayment({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '10',
        asset: 'USDC',
        sender: STELLAR_VALID_SENDER,
      }),
    ).rejects.toThrow('daily spending limit');
  });

  // Scenario 6: Simulation success (mock always succeeds)
  it('should simulate transaction before submission', async () => {
    const agent = createStellarAgent();
    const request: PaymentRequest = {
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    };

    const result = await agent.executePayment(request);
    expect(result.success).toBe(true);
    expect(result.feePaid).toBeDefined();
  });

  // Scenario 7: Signing phase (handled by adapter)
  it('should complete signing phase', async () => {
    const agent = createStellarAgent();
    const result = await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    });

    expect(result.success).toBe(true);
    expect(result.transactionHash).toBeTruthy();
  });

  // Scenario 8: Transaction confirmation
  it('should confirm transaction with hash and block number', async () => {
    const agent = createStellarAgent();
    const result = await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    });

    expect(result.success).toBe(true);
    expect(result.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.ledgerOrBlockNumber).toBeGreaterThan(0);
    expect(result.status).toBe('CONFIRMED');
  });

  // Scenario 9: Policy rejection - disallowed recipient
  it('should reject payment to disallowed recipient', async () => {
    const agent = createStellarAgent({ allowedRecipients: [STELLAR_VALID_SENDER] });

    await expect(
      agent.executePayment({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '10.0',
        asset: 'USDC',
        sender: STELLAR_VALID_SENDER,
      }),
    ).rejects.toThrow('not in the policy allowed recipients');
  });

  // Scenario 10: Transaction lifecycle tracking
  it('should track transaction state through agent', async () => {
    const agent = createStellarAgent();

    const stateBefore = agent.getState();
    expect(stateBefore.transactionCountToday).toBe(0);

    await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10.0',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    });

    const stateAfter = agent.getState();
    expect(stateAfter.transactionCountToday).toBe(1);
    expect(parseFloat(stateAfter.totalSpentToday)).toBe(10);
  });

  // Scenario 11: Duplicate submission prevention (daily limit)
  it('should prevent exceeding daily limit on duplicate submissions', async () => {
    const agent = createStellarAgent({ dailySpendingLimit: '15' });

    await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '10',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
    });

    await expect(
      agent.executePayment({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '10',
        asset: 'USDC',
        sender: STELLAR_VALID_SENDER,
      }),
    ).rejects.toThrow('daily spending limit');
  });

  // Scenario 12: Memo requirement enforcement
  it('should reject payment when memo is required but missing', async () => {
    const agent = createStellarAgent({ requireMemo: true });

    await expect(
      agent.executePayment({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '10.0',
        asset: 'USDC',
        sender: STELLAR_VALID_SENDER,
      }),
    ).rejects.toThrow('memo');
  });

  // Scenario 13: Policy approval with all checks passing
  it('should approve payment when all policy checks pass', async () => {
    const agent = createStellarAgent({
      maxAmountPerTransaction: '1000',
      dailySpendingLimit: '5000',
      allowedRecipients: [STELLAR_VALID_RECIPIENT],
      allowedAssets: ['USDC'],
      requireMemo: true,
    });

    const result = await agent.executePayment({
      recipient: STELLAR_VALID_RECIPIENT,
      amount: '50',
      asset: 'USDC',
      sender: STELLAR_VALID_SENDER,
      memo: 'Approved payment',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
  });
});

describe('E2E: EVM Agent Workflow', () => {
  it('should complete EVM payment end-to-end', async () => {
    const agent = createEVMAgent();
    const result = await agent.executePayment({
      recipient: EVM_VALID_RECIPIENT,
      amount: '0.1',
      asset: 'ETH',
      sender: EVM_VALID_SENDER,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CONFIRMED');
    expect(result.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('should reject EVM payment to invalid address', async () => {
    const agent = createEVMAgent();

    await expect(
      agent.executePayment({
        recipient: '0xBad',
        amount: '0.1',
        asset: 'ETH',
        sender: EVM_VALID_SENDER,
      }),
    ).rejects.toThrow('Invalid recipient EVM address');
  });

  it('should enforce EVM agent policy', async () => {
    const agent = createEVMAgent({ maxAmountPerTransaction: '0.05' });

    await expect(
      agent.executePayment({
        recipient: EVM_VALID_RECIPIENT,
        amount: '0.1',
        asset: 'ETH',
        sender: EVM_VALID_SENDER,
      }),
    ).rejects.toThrow('exceeds max single transaction limit');
  });
});

describe('E2E: Policy Engine Integration', () => {
  it('should evaluate all policy rules correctly', () => {
    const agent = createStellarAgent({
      maxAmountPerTransaction: '100',
      dailySpendingLimit: '500',
      allowedRecipients: [STELLAR_VALID_RECIPIENT],
      allowedAssets: ['USDC'],
      requireMemo: true,
    });

    // Should pass all checks
    expect(() =>
      agent.evaluatePolicy({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '50',
        asset: 'USDC',
        memo: 'test',
      }),
    ).not.toThrow();

    // Should fail: amount too high
    expect(() =>
      agent.evaluatePolicy({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '200',
        asset: 'USDC',
        memo: 'test',
      }),
    ).toThrow('exceeds max single transaction limit');

    // Should fail: disallowed recipient
    expect(() =>
      agent.evaluatePolicy({
        recipient: STELLAR_VALID_SENDER,
        amount: '50',
        asset: 'USDC',
        memo: 'test',
      }),
    ).toThrow('not in the policy allowed recipients');

    // Should fail: disallowed asset
    expect(() =>
      agent.evaluatePolicy({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '50',
        asset: 'XLM',
        memo: 'test',
      }),
    ).toThrow('not in the policy allowed assets');

    // Should fail: missing memo
    expect(() =>
      agent.evaluatePolicy({
        recipient: STELLAR_VALID_RECIPIENT,
        amount: '50',
        asset: 'USDC',
      }),
    ).toThrow('memo');
  });

  it('should allow policy updates', () => {
    const agent = createStellarAgent();

    agent.updatePolicy({ maxAmountPerTransaction: '50' });
    expect(agent.getPolicy().maxAmountPerTransaction).toBe('50');

    agent.updatePolicy({ dailySpendingLimit: '200' });
    expect(agent.getPolicy().dailySpendingLimit).toBe('200');
  });
});
