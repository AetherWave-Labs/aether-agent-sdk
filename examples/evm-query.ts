import { EVMAdapter, NetworkConfig, RPCClient } from '../src/index.js';

async function main() {
  console.log('--- EVM RPC & Balance Query ---');

  const sepolia = NetworkConfig.getEVMNetwork('SEPOLIA');
  const rpcClient = new RPCClient({
    primaryUrl: 'https://rpc.sepolia.org',
    retryConfig: {
      maxAttempts: 3,
      initialDelayMs: 500,
      backoffFactor: 2,
    },
  });

  const adapter = new EVMAdapter({
    network: sepolia,
    rpcClient,
  });

  const targetAddress = '0x000000000000000000000000000000000000dEaD';
  console.log(`Querying balance for ${targetAddress} on Sepolia...`);

  const balance = await adapter.getBalance(targetAddress);
  console.log(`ETH Balance: ${balance} ETH`);

  const networkInfo = adapter.getNetwork();
  console.log(`Connected to Chain ID: ${networkInfo.chainId} (${networkInfo.name})`);
}

main().catch(console.error);
