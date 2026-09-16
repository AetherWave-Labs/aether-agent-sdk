import { describe, it, expect } from 'vitest';
import {
  usdcToSmallestUnit,
  USDC_DECIMALS,
  InvalidUsdcAmountError,
} from '../../../src/payments/amount.js';

const UNIT = BigInt(10 ** USDC_DECIMALS);

describe('usdcToSmallestUnit', () => {
  it('converts decimal USDC amounts correctly', () => {
    expect(usdcToSmallestUnit('10.50')).toBe(10n * UNIT + 500000n);
    expect(usdcToSmallestUnit('1.000001')).toBe(1000001n);
    expect(usdcToSmallestUnit('0.1')).toBe(100000n);
    expect(usdcToSmallestUnit('1.5')).toBe(1500000n);
  });

  it('converts integer amounts', () => {
    expect(usdcToSmallestUnit('10')).toBe(10n * UNIT);
    expect(usdcToSmallestUnit('0')).toBe(0n);
    expect(usdcToSmallestUnit('1.000000')).toBe(1n * UNIT);
  });

  it('supports integer amounts', () => {
    expect(usdcToSmallestUnit('10')).toBe(10n * UNIT);
    expect(usdcToSmallestUnit('1')).toBe(UNIT);
    expect(usdcToSmallestUnit('0')).toBe(0n);
  });

  it('rejects amounts that exceed the token precision', () => {
    expect(() => usdcToSmallestUnit('1.0000001')).toThrow(InvalidUsdcAmountError);
    expect(() => usdcToSmallestUnit('0.1234567')).toThrow(InvalidUsdcAmountError);
  });

  it('rejects malformed amounts', () => {
    for (const bad of ['', 'abc', '-1', '1.2.3', '.5', '1.', '  1', '1 ', '+1']) {
      expect(() => usdcToSmallestUnit(bad)).toThrow(InvalidUsdcAmountError);
    }
  });

  it('avoids floating-point precision errors', () => {
    expect(usdcToSmallestUnit('0.1')).toBe(100000n);
    expect(usdcToSmallestUnit('0.2')).toBe(200000n);
    expect(usdcToSmallestUnit('0.1') + usdcToSmallestUnit('0.2')).toBe(300000n);
    expect(usdcToSmallestUnit('0.29')).toBe(290000n);
  });
});
