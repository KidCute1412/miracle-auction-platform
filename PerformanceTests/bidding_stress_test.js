import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

const scenario = __ENV.SCENARIO || "smoke";
const baseUrl = __ENV.BASE_URL || "http://localhost:5000";
const clientUrl = __ENV.CLIENT_URL || "http://localhost:5173";
const productIds = (__ENV.PRODUCT_IDS || "1").split(",").map(Number);
const startPrice = BigInt(__ENV.START_PRICE_VND || "100000");
const stepPrice = BigInt(__ENV.STEP_PRICE_VND || "10000");
const artifactPrefix = __ENV.ARTIFACT_PREFIX || `artifacts/${scenario}`;
const tokens = JSON.parse(open("./tokens.json"));
const systemErrors = new Rate("system_errors");

const profiles = {
  smoke: { vus: 1, duration: "10s" },
  hot: {
    stages: [
      { duration: "15s", target: 50 },
      { duration: "45s", target: 100 },
      { duration: "15s", target: 0 },
    ],
  },
  distributed: {
    stages: [
      { duration: "15s", target: 50 },
      { duration: "45s", target: 150 },
      { duration: "15s", target: 0 },
    ],
  },
  spike: {
    stages: [
      { duration: "10s", target: 20 },
      { duration: "5s", target: 250 },
      { duration: "30s", target: 250 },
      { duration: "10s", target: 0 },
    ],
  },
  soak: { vus: 50, duration: __ENV.SOAK_DURATION || "15m" },
};

export const options = {
  ...profiles[scenario],
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  thresholds: {
    system_errors: ["rate<0.01"],
    http_req_duration: ["p(99)<2000"],
    checks: ["rate>0.99"],
  },
};

export function setup() {
  const response = http.get(`${baseUrl}/accounts/csrf`);
  const csrf = response.cookies.csrfToken?.[0]?.value;
  if (!csrf) throw new Error("CSRF bootstrap failed");
  return { csrf };
}

export default function (setupData) {
  const user = tokens[(__VU - 1) % tokens.length];
  const productId = scenario === "distributed"
    ? productIds[(__VU + __ITER) % productIds.length]
    : productIds[0];
  const amount = startPrice + stepPrice * BigInt(1 + __VU + __ITER * tokens.length);
  const response = http.post(
    `${baseUrl}/bids`,
    JSON.stringify({ product_id: productId, max_price: amount.toString() }),
    {
      headers: {
        "Content-Type": "application/json",
        "Origin": clientUrl,
        "x-csrf-token": setupData.csrf,
        "Idempotency-Key": `${scenario}-${productId}-${__VU}-${__ITER}`,
        "Cookie": `csrfToken=${setupData.csrf}; accessToken=${user.token}`,
      },
    },
  );

  const infrastructureFailure = response.status >= 500 || response.status === 0;
  systemErrors.add(infrastructureFailure);
  check(response, {
    "business or success response": (result) => [200, 400, 403, 409, 429].includes(result.status),
    "no infrastructure error": () => !infrastructureFailure,
  });
}

export function handleSummary(data) {
  const requests = data.metrics.http_reqs?.values?.count || 0;
  const p99 = data.metrics.http_req_duration?.values?.["p(99)"] || 0;
  const errorRate = data.metrics.system_errors?.values?.rate || 0;
  const markdown = [
    `# k6 ${scenario} summary`,
    "",
    `- Engine: ${__ENV.BID_ENGINE || "unspecified"}`,
    `- Requests: ${requests}`,
    `- Throughput: ${data.metrics.http_reqs?.values?.rate || 0} req/s`,
    `- p99: ${p99} ms`,
    `- System error rate: ${(errorRate * 100).toFixed(4)}%`,
    `- Dataset: products ${productIds.join(", ")}`,
    "",
    "Correctness and projection convergence must be checked after this run; HTTP metrics alone do not pass the benchmark.",
    "",
  ].join("\n");
  return {
    stdout: markdown,
    [`${artifactPrefix}-summary.json`]: JSON.stringify(data, null, 2),
    [`${artifactPrefix}-report.md`]: markdown,
  };
}
