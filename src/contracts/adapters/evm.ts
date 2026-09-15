import { EVMAdapter } from '../../chains/evm/client.js';
import {
  ContractInvocationRequest,
  ContractInvocationResult,
  SmartContractAdapter,
} from '../interface.js';
import { EVMContractClient } from '../../chains/evm/contracts.js';

export class EVMContractAdapter implements SmartContractAdapter {
  private client: EVMContractClient;

  constructor(adapter: EVMAdapter) {
    this.client = new EVMContractClient(adapter);
  }

  public async invoke(request: ContractInvocationRequest): Promise<ContractInvocationResult> {
    const res = await this.client.call({
      contractAddress: request.contractAddress,
      method: request.method,
      args: request.args,
      from: request.signer,
      value: request.value,
    });

    return {
      success: res.success,
      result: res.result,
      transactionHash: res.transactionHash,
      gasOrCpuUsed: res.gasUsed,
    };
  }

  public async read(request: ContractInvocationRequest): Promise<unknown> {
    const res = await this.invoke(request);
    return res.result;
  }
}
