import http from "k6/http";
import { check } from "k6";

const baseUrl = __ENV.BASE_URL;
const accessToken = __ENV.ADMIN_ACCESS_TOKEN;
if (!baseUrl || !accessToken) throw new Error("BASE_URL and ADMIN_ACCESS_TOKEN are required");

export const options = {
  scenarios: { snapshot_reads: { executor: "constant-vus", vus: 10, duration: "30s" } },
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(50)<100", "p(95)<250"], checks: ["rate>0.99"] },
};

export default function () {
  const response = http.get(`${baseUrl}/admin/dashboard?range=30d`, { headers: { Cookie: `accessToken=${accessToken}` } });
  check(response, {
    "snapshot returns 200": (result) => result.status === 200,
    "response includes version": (result) => { try { return JSON.parse(result.body).data.metadata.version >= 0; } catch { return false; } },
  });
}
