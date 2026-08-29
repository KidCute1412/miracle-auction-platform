import { describe, expect, it } from "vitest";
import { isPrivateIp, normalizeClientIp } from "../../../src/modules/visitor-analytics/application/geoip.service.ts";
import { parseDevice } from "../../../src/modules/visitor-analytics/application/device.service.ts";

describe("visitor analytics network helpers", () => {
  it.each(["::1", "127.0.0.1", "10.0.0.8", "172.16.1.2", "192.168.1.10", "fd00::1"])("recognizes private address %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });
  it("normalizes IPv4-mapped IPv6 and keeps public IPs", () => {
    expect(normalizeClientIp("::ffff:203.0.113.10")).toBe("203.0.113.10");
    expect(isPrivateIp("203.0.113.10")).toBe(false);
  });
  it("derives a safe coarse device description", () => {
    expect(parseDevice("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/130.0")).toEqual({
      browser: "Chrome", operatingSystem: "Android", deviceType: "mobile",
    });
  });
});
