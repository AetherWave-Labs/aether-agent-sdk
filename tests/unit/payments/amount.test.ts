import { test } from "node:test";
import assert from "node:assert/strict";

import {
  usdcToSmallestUnit,
  USDC_DECIMALS,
  InvalidUsdcAmountError,
} from "../../../src/payments/amount";

const UNIT = BigInt(10 ** USDC_DECIMALS);

test("converts decimal USDC amounts correctly", () => {
  assert.equal(usdcToSmallestUnit("10.50"), 10n * UNIT + 500000n);
  assert.equal(usdcToSmallestUnit("1.000001"), 1000001n);
  assert.equal(usdcToSmallestUnit("0.1"), 100000n);
  assert.equal(usdcToSmallestUnit("1.5"), 1500000n);
});

test("converts integer amounts", () => {
  assert.equal(usdcToSmallestUnit("10"), 10n * UNIT);
  assert.equal(usdcToSmallestUnit("0"), 0n);
  assert.equal(usdcToSmallestUnit("1.000000"), 1n * UNIT);
});

test("supports integer amounts", () => {
  assert.equal(usdcToSmallestUnit("10"), 10n * UNIT);
  assert.equal(usdcToSmallestUnit("1"), UNIT);
  assert.equal(usdcToSmallestUnit("0"), 0n);
});

test("rejects amounts that exceed the token precision", () => {
  assert.throws(() => usdcToSmallestUnit("1.0000001"), InvalidUsdcAmountError);
  assert.throws(() => usdcToSmallestUnit("0.1234567"), InvalidUsdcAmountError);
});

test("rejects malformed amounts", () => {
  for (const bad of ["", "abc", "-1", "1.2.3", ".5", "1.", "  1", "1 ", "+1"]) {
    assert.throws(() => usdcToSmallestUnit(bad), InvalidUsdcAmountError);
  }
});

test("avoids floating-point precision errors", () => {
  assert.equal(usdcToSmallestUnit("0.1"), 100000n);
  assert.equal(usdcToSmallestUnit("0.2"), 200000n);
  assert.equal(usdcToSmallestUnit("0.1") + usdcToSmallestUnit("0.2"), 300000n);
  assert.equal(usdcToSmallestUnit("0.29"), 290000n);
});
