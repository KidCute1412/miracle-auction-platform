import net from "node:net";
import type { GeoData } from "../infrastructure/visitor-analytics.repository.ts";

const empty = (status: GeoData["status"], source: string | null): GeoData => ({
  status, source, countryCode: null, countryName: null, region: null, regionCode: null,
  city: null, postalCode: null, latitude: null, longitude: null, timezone: null,
  asn: null, ispName: null, ispDomain: null, networkType: null, isAnonymous: null,
  isAnycast: null, isHosting: null, isMobile: null, isSatellite: null, checkedAt: new Date(),
});

export function normalizeClientIp(value: string | undefined): string {
  return (value || "unknown").replace(/^::ffff:/, "").split("%")[0].slice(0, 45);
}

export function isPrivateIp(ip: string): boolean {
  if (ip === "unknown" || ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const lower = ip.toLowerCase();
  return lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb");
}

export function resolveGeoIp(ipAddress: string): GeoData {
  return empty(isPrivateIp(ipAddress) ? "private" : "unavailable", null);
}
