import { describe, it, expect } from 'vitest';
import { StellarContractAdapter } from '../src/contracts/adapters/stellar.js';
import { EVMContractAdapter } from '../src/contracts/adapters/evm.js';
import { StellarAdapter } from '../src/chains/stellar/client.js';
import { EVMAdapter } from '../src/chains/evm/client.js';
import { NetworkConfig } from '../src/config/networks.js';

describe('Contract Adapters', () => {
  it('invokes Soroban contracts via StellarContractAdapter', async () => {
    const stellarAdapter = new StellarAdapter({
      network: NetworkConfig.getStellarNetwork('TESTNET'),
    });
    const contractAdapter = new StellarContractAdapter(stellarAdapter);

    const validContractId = 'CA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
    const res = await contractAdapter.invoke({
      contractAddress: validContractId,
      method: 'transfer',
      args: [100],
    });

    expect(res.success).toBe(true);
    expect(res.transactionHash).toBeDefined();

    const readRes = await contractAdapter.read({
      contractAddress: validContractId,
      method: 'get_balance',
    });
    expect(readRes).toBeDefined();
  });

  it('invokes EVM contracts via EVMContractAdapter', async () => {
    const evmAdapter = new EVMAdapter({ network: NetworkConfig.getEVMNetwork('SEPOLIA') });
    const contractAdapter = new EVMContractAdapter(evmAdapter);

    const validContractAddress = '0x1111111111111111111111111111111111111111';
    const res = await contractAdapter.invoke({
      contractAddress: validContractAddress,
      method: 'mint',
      args: ['0x2222222222222222222222222222222222222222', '1000'],
    });

    expect(res.success).toBe(true);
    expect(res.gasOrCpuUsed).toBe('45000');
  });
});
