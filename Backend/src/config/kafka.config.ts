import { Kafka } from "kafkajs";

// Check if environment variables are set for TLS/SASL production connections
const isProd = process.env.NODE_ENV === "production";

// Create Kafka client instance
export const kafka = new Kafka({
  clientId: "auction-platform",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
  ssl: isProd,
  sasl: isProd
    ? {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_USERNAME || "",
        password: process.env.KAFKA_PASSWORD || "",
      }
    : undefined,
});

// Create singleton producer instance
const producer = kafka.producer();

// Initialize connection to Kafka
export async function initKafka() {
  try {
    await producer.connect();
    console.log("[KAFKA] Producer connected successfully!");
  } catch (error) {
    console.error("[KAFKA] Failed to connect producer:", error);
  }
}

// Publish event to topic with product-level partitioning key
export async function publishBidEvent(productId: string, bidData: object) {
  try {
    await producer.send({
      topic: "bidding_events",
      messages: [
        {
          key: productId, // Ensures sequential processing of bids for the same product
          value: JSON.stringify(bidData),
        },
      ],
    });
  } catch (error) {
    console.error("[KAFKA] Failed to publish event:", error);
  }
}

// Publish manual synchronization trigger to dashboard topic
export async function publishDashboardUpdate() {
  try {
    await producer.send({
      topic: "dashboard_updates",
      messages: [
        {
          value: JSON.stringify({ type: "UPDATE_STATS", timestamp: new Date() }),
        },
      ],
    });
  } catch (error) {
    console.error("[KAFKA] Failed to publish dashboard update:", error);
  }
}
