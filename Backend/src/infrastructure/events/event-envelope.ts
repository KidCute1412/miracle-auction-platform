import { randomUUID } from "node:crypto";

export interface EventEnvelope<TPayload extends object = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  payload: TPayload;
}

export function createEventEnvelope<TPayload extends object>(input: {
  eventId?: string;
  eventType: string;
  eventVersion?: number;
  aggregateId: string;
  occurredAt?: Date | string;
  correlationId?: string;
  causationId?: string;
  payload: TPayload;
}): EventEnvelope<TPayload> {
  return {
    eventId: input.eventId ?? randomUUID(),
    eventType: input.eventType,
    eventVersion: input.eventVersion ?? 1,
    aggregateId: input.aggregateId,
    occurredAt: new Date(input.occurredAt ?? Date.now()).toISOString(),
    correlationId: input.correlationId ?? randomUUID(),
    ...(input.causationId ? { causationId: input.causationId } : {}),
    payload: input.payload,
  };
}

export function parseEventEnvelope(value: string): EventEnvelope {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object") throw new Error("Event must be an object");
  const event = parsed as Record<string, unknown>;
  for (const field of ["eventId", "eventType", "aggregateId", "occurredAt", "correlationId"]) {
    if (typeof event[field] !== "string" || event[field] === "") throw new Error(`Invalid event field: ${field}`);
  }
  if (!Number.isInteger(event.eventVersion) || Number(event.eventVersion) < 1) throw new Error("Invalid eventVersion");
  if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) throw new Error("Invalid payload");
  return {
    eventId: event.eventId as string,
    eventType: event.eventType as string,
    eventVersion: event.eventVersion as number,
    aggregateId: event.aggregateId as string,
    occurredAt: event.occurredAt as string,
    correlationId: event.correlationId as string,
    ...(typeof event.causationId === "string" ? { causationId: event.causationId } : {}),
    payload: event.payload as Record<string, unknown>,
  };
}
