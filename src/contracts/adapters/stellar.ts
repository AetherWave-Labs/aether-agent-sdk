import { StellarAdapter } from '../../chains/stellar/client.js';
import {
  ContractInvocationRequest,
  ContractInvocationResult,
  SmartContractAdapter,
} from '../interface.js';
import { SorobanContractClient } from '../../chains/stellar/contracts.js';

export class StellarContractAdapter implements SmartContractAdapter {
  private client: SorobanContractClient;

  constructor(adapter: StellarAdapter) {
    this.client = new SorobanContractClient(adapter);
  }

  public async invoke(request: ContractInvocationRequest): Promise<ContractInvocationResult> {
    const res = await this.client.invoke({
      contractId: request.contractAddress,
      method: request.method,
      args: request.args,
      signerAddress: request.signer,
    });

    return {
      success: res.success,
      result: res.returnValue,
      transactionHash: res.transactionHash,
      feePaid: res.feePaid,
    };
  }

  public async read(request: ContractInvocationRequest): Promise<unknown> {
    const res = await this.invoke(request);
    return res.result;
  }
}
