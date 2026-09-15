# Getting Started with Aether Agent SDK

This guide will help you install, configure, and initialize your first autonomous agent with the Aether Agent SDK.

## Installation

```bash
npm install @aetherwave/aether-agent-sdk
```

Or using pnpm:

```bash
pnpm add @aetherwave/aether-agent-sdk
```

## Quick Start: Initializing an Agent

```typescript
import { Agent, NetworkConfig, StellarAdapter } from '@aetherwave/aether-agent-sdk';

// 1. Initialize Network Configuration
const network = NetworkConfig.getStellarNetwork('TESTNET');

// 2. Initialize Chain Adapter
const stellarAdapter = new StellarAdapter({
  network,
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
});

// 3. Create Agent with Policy
const agent = new Agent({
  id: 'finance-agent-01',
  name: 'Treasury Manager',
  adapter: stellarAdapter,
  policy: {
    maxAmountPerTransaction: '50.00',
    dailySpendingLimit: '500.00',
    allowedRecipients: ['GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'],
  },
});

// 4. Check Status
console.log(`Agent ${agent.name} initialized on network ${network.name}`);
```

## Running an Autonomous Payment

```typescript
import { PaymentManager } from '@aetherwave/aether-agent-sdk';

const paymentManager = new PaymentManager(stellarAdapter);

async function execute() {
  const result = await agent.executePayment({
    recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    amount: '10.50',
    asset: 'USDC',
    memo: 'Agent autonomous payout',
  });

  console.log('Payment status:', result.status);
  console.log('Transaction hash:', result.transactionHash);
}

execute().catch(console.error);
```
