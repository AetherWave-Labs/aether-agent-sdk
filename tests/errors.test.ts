import { describe, it, expect } from 'vitest';
import {
  AetherError,
  ValidationError,
  PolicyError,
  TransactionError,
  NetworkError,
  ContractError,
} from '../src/errors/transaction.js';

describe('Error Classes', () => {
  it('instantiates AetherError with code and details', () => {
    const err = new AetherError('Base failure', 'CUSTOM_ERR', { foo: 'bar' });
    expect(err.message).toBe('Base failure');
    expect(err.code).toBe('CUSTOM_ERR');
    expect(err.details).toEqual({ foo: 'bar' });
    expect(err.name).toBe('AetherError');

    const json = err.toJSON();
    expect(json.code).toBe('CUSTOM_ERR');
    expect(json.message).toBe('Base failure');
  });

  it('instantiates ValidationError', () => {
    const err = new ValidationError('Bad address');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.name).toBe('ValidationError');
    expect(err instanceof AetherError).toBe(true);
  });

  it('instantiates PolicyError', () => {
    const err = new PolicyError('Exceeds daily limit');
    expect(err.code).toBe('POLICY_VIOLATION');
  });

  it('instantiates TransactionError with transactionId', () => {
    const err = new TransactionError('Tx reverted', undefined, '0xabc123');
    expect(err.code).toBe('TRANSACTION_ERROR');
    expect(err.transactionId).toBe('0xabc123');
  });

  it('instantiates NetworkError with endpoint', () => {
    const err = new NetworkError('Timeout', undefined, 'https://rpc.example.com');
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.endpoint).toBe('https://rpc.example.com');
  });

  it('instantiates ContractError with contractAddress', () => {
    const err = new ContractError('Contract panic', undefined, '0xcontract');
    expect(err.code).toBe('CONTRACT_ERROR');
    expect(err.contractAddress).toBe('0xcontract');
  });
});
