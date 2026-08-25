import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "./api.client.ts";

vi.mock("./api.client.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api.client.ts")>();
  return { ...actual, apiRequest: vi.fn() };
});

import { bidService } from "./bid.service.ts";

describe("bidService durability retries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retries an unconfirmed mutation with one stable idempotency key", async () => {
    vi.mocked(apiRequest)
      .mockRejectedValueOnce(new ApiClientError(503, { code: "BID_DURABILITY_UNCONFIRMED" }, "pending"))
      .mockResolvedValueOnce({ status: "success", data: { event_id: "event-1" } });

    await expect(bidService.play({ product_id: 7, max_price: "120" })).resolves.toMatchObject({ status: "success" });
    expect(apiRequest).toHaveBeenCalledTimes(2);
    const firstHeaders = vi.mocked(apiRequest).mock.calls[0]?.[1]?.headers as Record<string, string>;
    const secondHeaders = vi.mocked(apiRequest).mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(firstHeaders["Idempotency-Key"]).toBe(secondHeaders["Idempotency-Key"]);
  });

  it("stops after three attempts and preserves the durability error", async () => {
    const error = new ApiClientError(503, { code: "BID_DURABILITY_UNCONFIRMED" }, "pending");
    vi.mocked(apiRequest).mockRejectedValue(error);
    await expect(bidService.buyNow({ product_id: 7, buy_price: "300" })).rejects.toBe(error);
    expect(apiRequest).toHaveBeenCalledTimes(3);
    const keys = vi.mocked(apiRequest).mock.calls.map((call) => (call[1]?.headers as Record<string, string>)["Idempotency-Key"]);
    expect(new Set(keys).size).toBe(1);
  });

  it("uses a caller-provided key for a new invocation", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ status: "success" });

    await bidService.play({ product_id: 7, max_price: "120" }, crypto.randomUUID());

    const headers = vi.mocked(apiRequest).mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toMatch(/[0-9a-f-]{36}/);
  });
});
