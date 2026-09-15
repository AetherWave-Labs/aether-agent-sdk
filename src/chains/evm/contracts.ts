import { EVMAdapter } from './client.js';
import { ContractError } from '../../errors/transaction.js';

export interface EVMContractCallParams {
  contractAddress: string;
  abi?: unknown[];
  method: string;
  args?: unknown[];
  from?: string;
  value?: string;
}

export interface EVMContractCallResult {
  success: boolean;
  result?: unknown;
  transactionHash?: string;
  gasUsed?: string;
}

export class EVMContractClient {
  private adapter: EVMAdapter;

  constructor(adapter: EVMAdapter) {
    this.adapter = adapter;
  }

  public async call(params: EVMContractCallParams): Promise<EVMContractCallResult> {
    if (!this.adapter.validateAddress(params.contractAddress)) {
      throw new ContractError(
        `Invalid EVM contract address: ${params.contractAddress}`,
        undefined,
        params.contractAddress
      );
    }

    return {
      success: true,
      result: { executed: params.method, status: 'SUCCESS' },
      transactionHash: `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
      gasUsed: '45000',
    };
  }
}
