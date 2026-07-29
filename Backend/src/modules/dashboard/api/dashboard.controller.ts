import type { Response } from "express";
import type { DashboardRange, DlqKind } from "api-contracts";
import type { AccountRequest } from "@/interfaces/request.interface.ts";
import { requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import { getAdminSocketCount } from "@/socket.ts";
import * as DashboardService from "../application/dashboard-summary.use-case.ts";

interface PaginationQuery { page: number; limit: number; kind?: DlqKind; }
interface AuditQuery extends PaginationQuery {
  actorId?: number; action?: string; resourceType?: string; result?: string; from?: Date; to?: Date;
}

const query = <T>(res: Response): T => res.locals.validated?.query as T;

export async function getSummary(_req: AccountRequest, res: Response): Promise<void> {
  const { range } = query<{ range: DashboardRange }>(res);
  res.json({ success: true, data: await DashboardService.getDashboardSummary(range) });
}

export async function syncCache(req: AccountRequest, res: Response): Promise<void> {
  const result = await DashboardService.requestDashboardRecalculation(req.header("x-request-id"));
  res.status(202).json({ success: true, data: result });
}

export async function getOperations(_req: AccountRequest, res: Response): Promise<void> {
  res.json({ success: true, data: await DashboardService.getOperations(getAdminSocketCount()) });
}

export async function getDlq(_req: AccountRequest, res: Response): Promise<void> {
  const { page, limit } = query<PaginationQuery>(res);
  const { kind } = query<PaginationQuery>(res);
  const result = await DashboardService.getDlq(page, limit, kind);
  res.json({
    success: true,
    data: result.data,
    meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
  });
}

export async function retryDlq(req: AccountRequest, res: Response): Promise<void> {
  const actor = requireAuthenticatedUser(req);
  const { eventId } = res.locals.validated?.params as { eventId: string };
  const { kind } = query<{ kind: DlqKind }>(res);
  try {
    const result = await DashboardService.retryDlq(kind, eventId, actor.user_id, req.header("x-request-id") as string);
    res.status(202).json({ success: true, data: result });
  } catch {
    res.status(404).json({ success: false, error: { code: "DLQ_EVENT_NOT_FOUND", message: "DLQ event was not found", requestId: req.header("x-request-id") } });
  }
}

export async function getAuditLogs(_req: AccountRequest, res: Response): Promise<void> {
  const filters = query<AuditQuery>(res);
  const result = await DashboardService.getAuditLogs(filters);
  res.json({
    success: true,
    data: result.data,
    meta: { page: filters.page, limit: filters.limit, total: result.total, totalPages: Math.ceil(result.total / filters.limit) },
  });
}

export async function exportCsv(_req: AccountRequest, res: Response): Promise<void> {
  const filters = query<AuditQuery & { dataset: "analytics" | "audit"; range: DashboardRange }>(res);
  let rows: unknown[][];
  if (filters.dataset === "analytics") {
    const summary = await DashboardService.getDashboardSummary(filters.range);
    rows = [
      ["dataset", "range", "bucket_start", "label", "completed_order_gmv_vnd", "bids", "auctions"],
      ...summary.series.slice(0, 10_000).map((point) => [
        "analytics", filters.range, point.bucketStart, point.label,
        point.completedOrderGmvVnd, point.bids, point.auctions,
      ]),
    ];
  } else {
    const audit = await DashboardService.getAuditLogs({ ...filters, page: 1, limit: 10_000 });
    rows = [
      ["id", "actor_id", "action", "resource_type", "resource_id", "result", "error_code", "correlation_id", "created_at"],
      ...audit.data.map((item) => [
        item.id, item.actorId, item.action, item.resourceType, item.resourceId,
        item.result, item.errorCode, item.correlationId, item.createdAt,
      ]),
    ];
  }
  const csv = `\uFEFF${rows.map((row) => row.map(DashboardService.escapeCsvCell).join(",")).join("\r\n")}`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="dashboard-${filters.dataset}.csv"`);
  res.send(csv);
}
