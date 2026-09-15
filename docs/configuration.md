# Configuration Guide

The SDK is designed to be configurable via TypeScript objects or environment variables.

## Network Configuration

Supported Networks:

- **Stellar**: `MAINNET`, `TESTNET`, `FUTURENET`, `LOCAL`
- **EVM**: `MAINNET`, `SEPOLIA`, `ARBITRUM`, `OPTIMISM`, `BASE`, `POLYGON`, `LOCAL`

```typescript
import { NetworkConfig } from '@aetherwave/aether-agent-sdk';

// Load Stellar Testnet Preset
const stellarTestnet = NetworkConfig.getStellarNetwork('TESTNET');

// Load Custom EVM Network
const customEvm = NetworkConfig.getEVMNetwork({
  chainId: 8453,
  name: 'Base Mainnet',
  rpcUrl: 'https://mainnet.base.org',
});
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_AGENT_PUBLIC_KEY=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

EVM_NETWORK=SEPOLIA
EVM_RPC_URL=https://rpc.sepolia.org
EVM_AGENT_ADDRESS=0x0000000000000000000000000000000000000000
```

Load with your preferred env loader (e.g. `dotenv`).
