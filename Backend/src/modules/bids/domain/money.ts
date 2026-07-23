import { BidDomainError } from "./bid.errors.ts";

export type MoneyVnd = bigint;

const VND_PATTERN = /^(0|[1-9]\d{0,18})$/;
const MAX_VND = 9_223_372_036_854_775_807n;

export function parseMoneyVnd(value: string, field = "amount"): MoneyVnd {
  if (!VND_PATTERN.test(value)) {
    throw new BidDomainError(`${field} must be a base-10 VND integer string`, 400, "INVALID_MONEY");
  }
  const amount = BigInt(value);
  if (amount <= 0n || amount > MAX_VND) {
    throw new BidDomainError(`${field} is outside the supported BIGINT range`, 400, "INVALID_MONEY");
  }
  return amount;
}

export function moneyToApi(value: MoneyVnd | null | undefined): string | null {
  return value === null || value === undefined ? null : value.toString();
}
