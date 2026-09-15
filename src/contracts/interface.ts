export interface ContractMethodDef {
  name: string;
  inputs?: Array<{ name: string; type: string }>;
  outputs?: Array<{ name: string; type: string }>;
  readOnly?: boolean;
}

export interface ContractInvocationRequest {
  contractAddress: string;
  method: string;
  args?: unknown[];
  signer?: string;
  value?: string;
}

export interface ContractInvocationResult {
  success: boolean;
  result?: unknown;
  transactionHash?: string;
  gasOrCpuUsed?: string;
  feePaid?: string;
}

export interface SmartContractAdapter {
  invoke(request: ContractInvocationRequest): Promise<ContractInvocationResult>;
  read(request: ContractInvocationRequest): Promise<unknown>;
}
