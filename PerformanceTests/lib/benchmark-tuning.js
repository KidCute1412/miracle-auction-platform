const tuningFields = [
  ["mutationConnections", "BID_MUTATION_CONNECTIONS", "mutation-connections", 16],
  ["projectorConcurrency", "BID_PROJECTOR_CONCURRENCY", "projector-concurrency", 16],
  ["dashboardBatchConcurrency", "DASHBOARD_BATCH_CONCURRENCY", "dashboard-batch-concurrency", 16],
  ["notificationBatchConcurrency", "NOTIFICATION_BATCH_CONCURRENCY", "notification-batch-concurrency", 16],
];

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 64) {
    throw new Error(`${label} must be an integer from 1 to 64.`);
  }
  return parsed;
}

/** Resolves and validates the concurrency values passed into the benchmark Compose topology. */
export function resolveBenchmarkTuning(options = {}, environment = process.env) {
  return Object.fromEntries(tuningFields.map(([property, environmentName, optionName, defaultValue]) => {
    const value = options[optionName] ?? environment[environmentName] ?? defaultValue;
    return [property, positiveInteger(value, `--${optionName}`)];
  }));
}

export function benchmarkTuningEnvironment(tuning) {
  return {
    BID_MUTATION_CONNECTIONS: String(tuning.mutationConnections),
    BID_PROJECTOR_CONCURRENCY: String(tuning.projectorConcurrency),
    DASHBOARD_BATCH_CONCURRENCY: String(tuning.dashboardBatchConcurrency),
    NOTIFICATION_BATCH_CONCURRENCY: String(tuning.notificationBatchConcurrency),
  };
}
