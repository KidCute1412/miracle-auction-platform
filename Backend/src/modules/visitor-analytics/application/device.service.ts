export interface DeviceInfo { browser: string | null; operatingSystem: string | null; deviceType: string; }

export function parseDevice(userAgent: string | undefined): DeviceInfo {
  const ua = userAgent || "";
  const browser = /Edg\/([\d.]+)/.exec(ua) ? "Edge" : /Chrome\/([\d.]+)/.exec(ua) ? "Chrome"
    : /Firefox\/([\d.]+)/.exec(ua) ? "Firefox" : /Safari\/([\d.]+)/.exec(ua) && /Version\//.test(ua) ? "Safari" : null;
  const operatingSystem = /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Windows NT/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : null;
  const deviceType = /iPad|Tablet/.test(ua) ? "tablet" : /Mobile|Android|iPhone|iPod/.test(ua) ? "mobile" : "desktop";
  return { browser, operatingSystem, deviceType };
}
