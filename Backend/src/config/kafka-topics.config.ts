export const kafkaTopics = {
  bidding: process.env.KAFKA_BIDDING_TOPIC || "bidding_events",
  domain: process.env.KAFKA_DOMAIN_TOPIC || "domain_events",
  dashboard: process.env.KAFKA_DASHBOARD_TOPIC || "dashboard_updates",
  asyncDlq: process.env.KAFKA_ASYNC_DLQ_TOPIC || "async_events_dlq",
  /** Compatibility topic retained for one rollout window. */
  dashboardDlq: process.env.KAFKA_DASHBOARD_DLQ_TOPIC || "dashboard_updates_dlq",
} as const;

export type KafkaTopicName = (typeof kafkaTopics)[keyof typeof kafkaTopics];

export const relayTopics = new Set<string>([
  kafkaTopics.bidding,
  kafkaTopics.domain,
  kafkaTopics.dashboard,
  kafkaTopics.asyncDlq,
]);
