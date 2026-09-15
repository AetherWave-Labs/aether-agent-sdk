export const USDC_DECIMALS = 6;

const DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

export class InvalidUsdcAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUsdcAmountError";
  }
}

function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, "");
}

export function usdcToSmallestUnit(amount: string): bigint {
  if (typeof amount !== "string" || !DECIMAL_PATTERN.test(amount)) {
    throw new InvalidUsdcAmountError(`Invalid USDC amount: ${amount}`);
  }

  const [wholePart, fractionPart = ""] = amount.split(".");

  if (fractionPart.length > USDC_DECIMALS) {
    throw new InvalidUsdcAmountError(
      `USDC amount exceeds ${USDC_DECIMALS} decimal places: ${amount}`
    );
  }

  const scaledWhole =
    BigInt(stripLeadingZeros(wholePart)) * BigInt(10 ** USDC_DECIMALS);
  const scaledFraction =
    BigInt(fractionPart.padEnd(USDC_DECIMALS, "0") || "0");

  return scaledWhole + scaledFraction;
}
