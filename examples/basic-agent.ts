import { Agent, StellarAdapter, NetworkConfig } from '../src/index.js';

async function main() {
  console.log('Initializing Autonomous Agent...');

  const network = NetworkConfig.getStellarNetwork('TESTNET');
  const adapter = new StellarAdapter({
    network,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  });

  const agent = new Agent({
    id: 'treasury-agent-01',
    name: 'Autonomous Treasury Worker',
    adapter,
    policy: {
      maxAmountPerTransaction: '100.00',
      dailySpendingLimit: '1000.00',
      allowedRecipients: ['GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'],
    },
  });

  console.log(`Agent ID: ${agent.id}`);
  console.log(`Agent Name: ${agent.name}`);
  console.log('Policy configured:', agent.getPolicy());

  // Execute payment within policy
  const paymentResult = await agent.executePayment({
    recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    amount: '25.00',
    asset: 'USDC',
    memo: 'Example automated payout',
  });

  console.log('Payment execution outcome:', paymentResult);
}

main().catch(console.error);
