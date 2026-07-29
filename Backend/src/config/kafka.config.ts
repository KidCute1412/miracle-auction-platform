import { Kafka, logLevel, type Producer } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:19094").split(",").map((value) => value.trim());
const sslEnabled = process.env.KAFKA_SSL === "true";
const kafkaCa = process.env.KAFKA_CA?.replace(/\\n/g, "\n");
const saslUsername = process.env.KAFKA_USERNAME;
const saslPassword = process.env.KAFKA_PASSWORD;

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "auction-platform",
  brokers,
  connectionTimeout: Number(process.env.KAFKA_CONNECTION_TIMEOUT_MS || 10_000),
  requestTimeout: Number(process.env.KAFKA_REQUEST_TIMEOUT_MS || 30_000),
  retry: { retries: Number(process.env.KAFKA_CONNECTION_RETRIES || 5) },
  ssl: sslEnabled ? (kafkaCa ? { ca: [kafkaCa] } : true) : false,
  sasl: saslUsername && saslPassword
    ? { mechanism: "scram-sha-256", username: saslUsername, password: saslPassword }
    : undefined,
  logLevel: process.env.KAFKA_LOG_LEVEL === "debug" ? logLevel.DEBUG : logLevel.NOTHING,
});

const producer: Producer = kafka.producer({ allowAutoTopicCreation: false });
let producerConnected = false;

export const kafkaTopics = {
  bidding: process.env.KAFKA_BIDDING_TOPIC || "bidding_events",
  dashboard: process.env.KAFKA_DASHBOARD_TOPIC || "dashboard_updates",
  dashboardDlq: process.env.KAFKA_DASHBOARD_DLQ_TOPIC || "dashboard_updates_dlq",
} as const;

export async function initKafka(): Promise<boolean> {
  if (producerConnected) return true;
  try {
    await producer.connect();
    producerConnected = true;
    return true;
  } catch (error) {
    console.error("[KAFKA] Producer connection failed", error);
    return false;
  }
}

export async function checkKafkaConnection(): Promise<boolean> {
  const startedAt = Date.now();
  const admin = kafka.admin();
  try {
    await admin.connect();
    await admin.fetchTopicMetadata();
    return Date.now() - startedAt >= 0;
  } catch {
    return false;
  } finally {
    await admin.disconnect().catch(() => undefined);
  }
}

export async function measureKafkaLatency(): Promise<number> {
  const startedAt = performance.now();
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.fetchTopicMetadata();
    return Math.round((performance.now() - startedAt) * 10) / 10;
  } finally {
    await admin.disconnect();
  }
}

export async function closeKafkaConnection(): Promise<void> {
  if (!producerConnected) return;
  await producer.disconnect();
  producerConnected = false;
}

export async function publishEventStrict(topic: string, key: string, event: object): Promise<void> {
  if (!producerConnected && !(await initKafka())) throw new Error("Kafka producer is unavailable");
  await producer.send({ topic, acks: -1, messages: [{ key, value: JSON.stringify(event) }] });
}

/** Compatibility wrapper for existing bidding callers. */
export async function publishBidEvent(productId: string, event: object): Promise<void> {
  try {
    await publishEventStrict(kafkaTopics.bidding, productId, event);
  } catch (error) {
    console.error("[KAFKA] Bid publish failed", error);
  }
}

export const publishBidEventStrict = (productId: string, event: object): Promise<void> =>
  publishEventStrict(kafkaTopics.bidding, productId, event);
