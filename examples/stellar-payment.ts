import { PaymentManager, StellarAdapter, NetworkConfig } from '../src/index.js';

async function main() {
  console.log('--- Stellar USDC Payment Flow ---');

  const testnet = NetworkConfig.getStellarNetwork('TESTNET');
  const adapter = new StellarAdapter({
    network: testnet,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  });

  const paymentManager = new PaymentManager(adapter);

  const paymentRequest = {
    recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    amount: '15.75',
    asset: 'USDC',
    memo: 'Invoice-10294',
  };

  // 1. Validate Payment Request
  const validation = paymentManager.validateRequest(paymentRequest);
  console.log('Validation Status:', validation.valid ? 'PASSED' : 'FAILED');

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    return;
  }

  // 2. Prepare Transaction
  const preparedTx = await paymentManager.preparePayment(paymentRequest);
  console.log('Prepared Transaction Hash Preview:', preparedTx.id);

  // 3. Execute Payment
  const result = await paymentManager.execute(paymentRequest);
  console.log('Execution Status:', result.status);
  console.log('Transaction Hash:', result.transactionHash);
}

main().catch(console.error);
