/**
 * Network configuration and presets for Stellar and EVM chains.
 */

export type StellarNetworkType = 'MAINNET' | 'TESTNET' | 'FUTURENET' | 'LOCAL';
export type EVMNetworkType =
  'MAINNET' | 'SEPOLIA' | 'ARBITRUM' | 'OPTIMISM' | 'BASE' | 'POLYGON' | 'LOCAL';

export interface StellarNetworkConfig {
  type: 'stellar';
  name: string;
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  usdcIssuer?: string;
}

export interface EVMNetworkConfig {
  type: 'evm';
  name: string;
  chainId: number;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdcContract?: string;
}

export type NetworkConfigType = StellarNetworkConfig | EVMNetworkConfig;

export const STELLAR_NETWORKS: Record<StellarNetworkType, StellarNetworkConfig> = {
  MAINNET: {
    type: 'stellar',
    name: 'Stellar Public Network',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban-rpc.mainnet.stellar.org',
    usdcIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
  TESTNET: {
    type: 'stellar',
    name: 'Stellar Test Network',
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    usdcIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  },
  FUTURENET: {
    type: 'stellar',
    name: 'Stellar Futurenet',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    sorobanRpcUrl: 'https://rpc-futurenet.stellar.org',
  },
  LOCAL: {
    type: 'stellar',
    name: 'Stellar Local Standalone',
    networkPassphrase: 'Standalone Network ; February 2017',
    horizonUrl: 'http://localhost:8000',
    sorobanRpcUrl: 'http://localhost:8000/soroban/rpc',
  },
};

export const EVM_NETWORKS: Record<EVMNetworkType, EVMNetworkConfig> = {
  MAINNET: {
    type: 'evm',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  SEPOLIA: {
    type: 'evm',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    usdcContract: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
  ARBITRUM: {
    type: 'evm',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    usdcContract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  OPTIMISM: {
    type: 'evm',
    name: 'OP Mainnet',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    usdcContract: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  BASE: {
    type: 'evm',
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  POLYGON: {
    type: 'evm',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'POL', decimals: 18 },
    usdcContract: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  LOCAL: {
    type: 'evm',
    name: 'Local EVM Node',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    nativeCurrency: { name: 'Local Test ETH', symbol: 'ETH', decimals: 18 },
  },
};

export class NetworkConfig {
  public static getStellarNetwork(type: StellarNetworkType): StellarNetworkConfig {
    const config = STELLAR_NETWORKS[type];
    if (!config) {
      throw new Error(`Unknown Stellar network type: ${type}`);
    }
    return { ...config };
  }

  public static getEVMNetwork(
    typeOrConfig: EVMNetworkType | Partial<EVMNetworkConfig>
  ): EVMNetworkConfig {
    if (typeof typeOrConfig === 'string') {
      const config = EVM_NETWORKS[typeOrConfig];
      if (!config) {
        throw new Error(`Unknown EVM network type: ${typeOrConfig}`);
      }
      return { ...config };
    }

    return {
      type: 'evm',
      name: typeOrConfig.name ?? 'Custom EVM',
      chainId: typeOrConfig.chainId ?? 1,
      rpcUrl: typeOrConfig.rpcUrl ?? 'http://127.0.0.1:8545',
      nativeCurrency: typeOrConfig.nativeCurrency ?? { name: 'Ether', symbol: 'ETH', decimals: 18 },
      usdcContract: typeOrConfig.usdcContract,
    };
  }
}
