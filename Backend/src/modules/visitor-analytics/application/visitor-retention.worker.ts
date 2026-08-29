import { visitorAnalyticsRepository } from "../infrastructure/visitor-analytics.repository.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "visitor-retention" });
let timer: NodeJS.Timeout | undefined;

export async function runVisitorAnalyticsRetention(): Promise<void> {
  const retentionDays = Math.max(1, Number(process.env.VISITOR_ANALYTICS_RETENTION_DAYS ?? 90));
  try {
    const deleted = await visitorAnalyticsRepository.deleteExpired(retentionDays);
    if (deleted.sessions > 0) {
      log.info({ retentionDays, ...deleted }, "Expired visitor analytics data removed");
    }
  } catch (error) {
    log.error({ err: safeError(error) }, "Visitor analytics retention cleanup failed");
  }
}

export function startVisitorAnalyticsRetention(): void {
  void runVisitorAnalyticsRetention();
  timer = setInterval(() => void runVisitorAnalyticsRetention(), 86_400_000);
  timer.unref();
}

export function stopVisitorAnalyticsRetention(): void {
  if (timer) clearInterval(timer);
  timer = undefined;
}
