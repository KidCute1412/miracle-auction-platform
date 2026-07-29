import { describe, expect, it } from "vitest";
import { emailRetryDelayMs } from "../../../src/modules/notifications/email-delivery.worker.ts";
import { stableMessageId } from "../../../src/modules/notifications/notification.service.ts";

describe("notification delivery policy", () => {
  it("creates a stable RFC Message-ID for an idempotent delivery", () => {
    const first = stableMessageId("00000000-0000-4000-a000-000000000001", "user:7", "auction-winner");
    const replay = stableMessageId("00000000-0000-4000-a000-000000000001", "user:7", "auction-winner");
    expect(first).toBe(replay);
    expect(first).toMatch(/^<[a-f0-9]{64}@events\.online-auction>$/);
    expect(stableMessageId("00000000-0000-4000-a000-000000000001", "user:8", "auction-winner")).not.toBe(first);
  });

  it("uses the required five SMTP retry intervals", () => {
    expect([1, 2, 3, 4, 5].map(emailRetryDelayMs)).toEqual([
      30_000,
      120_000,
      600_000,
      1_800_000,
      7_200_000,
    ]);
  });
});
