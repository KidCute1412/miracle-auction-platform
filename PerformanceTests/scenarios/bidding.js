import http from "k6/http";
import { check } from "k6";
import { Counter, Rate } from "k6/metrics";
import { resolveProfile } from "../config/profiles.js";

const scenario = __ENV.SCENARIO || "smoke";
const profile = resolveProfile(scenario, __ENV.DURATION);
const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:5000";
const clientUrl = __ENV.CLIENT_URL || baseUrl;
const manifestPath = __ENV.MANIFEST_PATH || "../config/fixtures/manifest.json";
const tokensPath = __ENV.TOKENS_PATH || "../config/fixtures/tokens.json";
const manifest = JSON.parse(open(manifestPath));
const tokens = JSON.parse(open(tokensPath));
const productIds = manifest.productIds.map(Number);
const startPrice = BigInt(manifest.startPriceVnd);
const stepPrice = BigInt(manifest.stepPriceVnd);
const artifactPrefix = __ENV.ARTIFACT_PREFIX || `artifacts/runs/${scenario}`;

const systemErrors = new Rate("system_errors");
const serverErrors = new Counter("system_error_server");
const networkErrors = new Counter("system_error_network");
const durabilityErrors = new Counter("system_error_durability_unconfirmed");
const acceptedBids = new Counter("accepted_bids");
const businessRejections = new Counter("business_rejections");
const acceptedRatio = new Rate("accepted_ratio");

export const options = {
  ...(profile.stages ? { stages: profile.stages } : { vus: profile.vus, duration: profile.duration }),
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  thresholds: {
    system_errors: ["rate<0.01"],
    http_req_duration: [`p(95)<${profile.thresholds.p95Ms}`, `p(99)<${profile.thresholds.p99Ms}`],
    checks: ["rate>0.99"],
    ...(profile.minimumAcceptanceRatio ? { accepted_ratio: [`rate>=${profile.minimumAcceptanceRatio}`] } : {}),
  },
};

export function setup() {
  if (!__ENV.MANIFEST_PATH || !__ENV.TOKENS_PATH) throw new Error("MANIFEST_PATH and TOKENS_PATH are required for a real benchmark run");
  const response = http.get(`${baseUrl}/accounts/csrf`);
  const csrf = response.cookies.csrfToken?.[0]?.value;
  if (!csrf) throw new Error("CSRF bootstrap failed");
  return { csrf };
}

export default function (setupData) {
  const user = tokens[(__VU - 1) % tokens.length];
  const productId = profile.productMode === "distributed"
    ? productIds[(__VU + __ITER) % productIds.length]
    : productIds[0];
  const amount = startPrice + stepPrice * BigInt(1 + __VU + __ITER * tokens.length);
  const response = http.post(`${baseUrl}/bids`, JSON.stringify({ product_id: productId, max_price: amount.toString() }), {
    headers: {
      "Content-Type": "application/json",
      Origin: clientUrl,
      "x-csrf-token": setupData.csrf,
      "Idempotency-Key": `${manifest.runId}-${scenario}-${productId}-${__VU}-${__ITER}`,
      Cookie: `csrfToken=${setupData.csrf}; accessToken=${user.token}`,
    },
  });
  const infrastructureFailure = response.status === 0 || response.status >= 500;
  const durabilityUnconfirmed = response.status === 503 && String(response.body ?? "").includes("BID_DURABILITY_UNCONFIRMED");
  systemErrors.add(infrastructureFailure);
  serverErrors.add(response.status >= 500 ? 1 : 0);
  networkErrors.add(response.status === 0 ? 1 : 0);
  durabilityErrors.add(durabilityUnconfirmed ? 1 : 0);
  acceptedBids.add(response.status === 200);
  acceptedRatio.add(response.status === 200);
  businessRejections.add(!infrastructureFailure && response.status !== 200);
  check(response, {
    "success or expected business rejection": (result) => [200, 400, 403, 409, 429].includes(result.status),
    "no infrastructure error": () => !infrastructureFailure,
  });
}

export function handleSummary(data) {
  const markdown = [
    `# k6 ${scenario} summary`, "",
    `- Requests: ${data.metrics.http_reqs?.values?.count ?? 0}`,
    `- Throughput: ${data.metrics.http_reqs?.values?.rate ?? 0} req/s`,
    `- p95: ${data.metrics.http_req_duration?.values?.["p(95)"] ?? 0} ms`,
    `- p99: ${data.metrics.http_req_duration?.values?.["p(99)"] ?? 0} ms`,
    `- System error rate: ${((data.metrics.system_errors?.values?.rate ?? 0) * 100).toFixed(4)}%`,
    `- Server errors: ${data.metrics.system_error_server?.values?.count ?? 0}`,
    `- Network errors: ${data.metrics.system_error_network?.values?.count ?? 0}`,
    `- Durability-unconfirmed errors: ${data.metrics.system_error_durability_unconfirmed?.values?.count ?? 0}`,
    `- Accepted bids: ${data.metrics.accepted_bids?.values?.count ?? 0}`,
    `- Accepted bids/s: ${data.metrics.accepted_bids?.values?.rate ?? 0}`,
    `- Acceptance ratio: ${((data.metrics.accepted_ratio?.values?.rate ?? 0) * 100).toFixed(2)}%`,
    `- Business rejections: ${data.metrics.business_rejections?.values?.count ?? 0}`,
    "", "Correctness is valid only with the paired invariant report.", "",
  ].join("\n");
  return {
    stdout: markdown,
    [`${artifactPrefix}-summary.json`]: JSON.stringify(data, null, 2),
    [`${artifactPrefix}-report.md`]: markdown,
  };
}
