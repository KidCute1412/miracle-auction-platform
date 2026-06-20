import amqp from "amqplib";

let connection: any = null;
let channel: any = null;

// Initialize RabbitMQ connection and channel
export async function initRabbitMQ() {
  try {
    const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    connection = await amqp.connect(url);
    if (connection) {
      channel = await connection.createChannel();
      if (channel) {
        // Assert queue for dashboard cache updates
        await channel.assertQueue("dashboard_updates", { durable: true });
        console.log("RabbitMQ connected and dashboard_updates queue asserted successfully!");
      }
    }
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
  }
}

// Get the active RabbitMQ channel
export function getChannel() {
  return channel;
}

// Publish update event to the queue
export async function publishDashboardUpdate() {
  if (!channel) {
    console.warn("RabbitMQ channel not initialized, skipping dashboard update message.");
    return;
  }
  const payload = JSON.stringify({ type: "UPDATE_STATS", timestamp: new Date() });
  channel.sendToQueue("dashboard_updates", Buffer.from(payload), { persistent: true });
}
