export type ApiMoney = string | number | bigint | null | undefined;

export function moneyBigInt(value: ApiMoney): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.floor(value));
  const str = String(value).split(".")[0];
  return BigInt(str || "0");
}

export function formatVnd(value: ApiMoney): string {
  if (value === null || value === undefined || value === "") return "0";
  if (typeof value === "number") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 8 });
  }
  if (typeof value === "bigint") {
    return value.toLocaleString("en-US");
  }
  const num = Number(value);
  if (!isNaN(num) && value !== "") {
    return num.toLocaleString("en-US", { maximumFractionDigits: 8 });
  }
  return String(value);
}

