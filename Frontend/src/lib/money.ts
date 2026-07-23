export type ApiMoney = string | number | bigint | null | undefined;

export function moneyBigInt(value: ApiMoney): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  return BigInt(value);
}

export function formatVnd(value: ApiMoney): string {
  return moneyBigInt(value).toLocaleString("en-US");
}
