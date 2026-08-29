import { describe, expect, it, vi } from "vitest";
import { resolveGeoIp } from "../../../src/modules/visitor-analytics/application/geoip.service.ts";

describe("GeoIP resolution", () => {
  it("marks localhost/private addresses without making external requests", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(resolveGeoIp("::1").status).toBe("private");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("keeps a public IP while leaving provider-derived location unavailable", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(resolveGeoIp("203.0.113.10")).toEqual(expect.objectContaining({
      status: "unavailable", source: null, countryCode: null, region: null, city: null,
    }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
