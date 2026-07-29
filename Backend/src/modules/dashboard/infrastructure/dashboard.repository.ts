import { Prisma } from "@prisma/client";
import type {
  DashboardActivity,
  DashboardCategoryPoint,
  DashboardChartPoint,
  DashboardComparison,
  DashboardHeatmapPoint,
  DashboardMetrics,
  DashboardRange,
} from "api-contracts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

const RANGE_CONFIG: Record<DashboardRange, { interval: string; bucket: "day" | "week" | "month"; label: string }> = {
  "7d": { interval: "7 days", bucket: "day", label: "Dy DD" },
  "30d": { interval: "30 days", bucket: "day", label: "Mon DD" },
  "3m": { interval: "3 months", bucket: "week", label: "Mon DD" },
  "6m": { interval: "6 months", bucket: "month", label: "Mon YY" },
  "1y": { interval: "1 year", bucket: "month", label: "Mon YY" },
};

const number = (value: bigint | number | string | null | undefined): number => Number(value ?? 0);
const percentageChange = (current: number, previous: number): number | null =>
  previous === 0 ? (current === 0 ? 0 : null) : Math.round(((current - previous) / previous) * 10_000) / 100;

interface MetricsRow {
  completed_order_gmv_vnd: bigint;
  active_bidders: bigint;
  enabled_accounts: bigint;
  active_auctions: bigint;
  pending_orders: bigint;
  finished_orders: bigint;
  rejected_orders: bigint;
  pending_seller_verifications: bigint;
  sold_auctions: bigint;
  ended_auctions: bigint;
}

async function metricsForInterval(interval: string, previous = false): Promise<MetricsRow> {
  const window = previous
    ? Prisma.sql`created_at >= now() - (${interval}::interval * 2) AND created_at < now() - ${interval}::interval`
    : Prisma.sql`created_at >= now() - ${interval}::interval`;
  const completedWindow = previous
    ? Prisma.sql`completed_at >= now() - (${interval}::interval * 2) AND completed_at < now() - ${interval}::interval`
    : Prisma.sql`completed_at >= now() - ${interval}::interval`;
  const rows = await prisma.$queryRaw<MetricsRow[]>(Prisma.sql`
    SELECT
      (SELECT COALESCE(SUM(amount_vnd), 0) FROM orders WHERE order_status = 'finished' AND ${completedWindow}) AS completed_order_gmv_vnd,
      (SELECT COUNT(DISTINCT user_id) FROM bidding_history WHERE ${window}) AS active_bidders,
      (SELECT COUNT(*) FROM users WHERE status = 'active') AS enabled_accounts,
      (SELECT COUNT(*) FROM products WHERE auction_status = 'ACTIVE' AND start_time <= now()
        AND end_time > now() AND COALESCE(is_removed, false) = false) AS active_auctions,
      (SELECT COUNT(*) FROM orders WHERE order_status = 'pending' AND ${window}) AS pending_orders,
      (SELECT COUNT(*) FROM orders WHERE order_status = 'finished' AND ${completedWindow}) AS finished_orders,
      (SELECT COUNT(*) FROM orders WHERE order_status = 'rejected' AND ${window}) AS rejected_orders,
      (SELECT COUNT(*) FROM upgrade_to_sellers WHERE status = 'pending') AS pending_seller_verifications,
      (SELECT COUNT(*) FROM products WHERE price_owner_id IS NOT NULL AND end_time <= now()
        AND COALESCE(is_removed, false) = false) AS sold_auctions,
      (SELECT COUNT(*) FROM products WHERE end_time <= now() AND COALESCE(is_removed, false) = false) AS ended_auctions`);
  return rows[0];
}

function mapMetrics(row: MetricsRow): DashboardMetrics {
  const ended = number(row.ended_auctions);
  return {
    completedOrderGmvVnd: number(row.completed_order_gmv_vnd),
    activeBidders: number(row.active_bidders),
    enabledAccounts: number(row.enabled_accounts),
    activeAuctions: number(row.active_auctions),
    pendingOrders: number(row.pending_orders),
    finishedOrders: number(row.finished_orders),
    rejectedOrders: number(row.rejected_orders),
    pendingSellerVerifications: number(row.pending_seller_verifications),
    sellThroughRate: ended === 0 ? 0 : Math.round((number(row.sold_auctions) / ended) * 10_000) / 100,
  };
}

export async function getDashboardMetrics(range: DashboardRange = "6m"): Promise<{
  metrics: DashboardMetrics;
  comparison: DashboardComparison;
}> {
  const interval = RANGE_CONFIG[range].interval;
  const [currentRow, previousRow] = await Promise.all([
    metricsForInterval(interval),
    metricsForInterval(interval, true),
  ]);
  const metrics = mapMetrics(currentRow);
  const previous = mapMetrics(previousRow);
  return {
    metrics,
    comparison: {
      completedOrderGmvVnd: percentageChange(metrics.completedOrderGmvVnd, previous.completedOrderGmvVnd),
      activeBidders: percentageChange(metrics.activeBidders, previous.activeBidders),
      finishedOrders: percentageChange(number(currentRow.finished_orders), number(previousRow.finished_orders)),
    },
  };
}

interface SeriesRow {
  bucket_start: Date;
  label: string;
  completed_order_gmv_vnd: bigint;
  bids: bigint;
  auctions: bigint;
}

export async function getDashboardChartData(range: DashboardRange = "6m"): Promise<DashboardChartPoint[]> {
  const { interval, bucket, label } = RANGE_CONFIG[range];
  const rows = await prisma.$queryRaw<SeriesRow[]>(Prisma.sql`
    WITH buckets AS (
      SELECT generate_series(
        date_trunc(${bucket}, now() - ${interval}::interval),
        date_trunc(${bucket}, now()),
        ${`1 ${bucket}`}::interval
      ) AS bucket_start
    ), order_totals AS (
      SELECT date_trunc(${bucket}, completed_at) bucket_start, SUM(amount_vnd) total
      FROM orders WHERE order_status = 'finished' AND completed_at >= now() - ${interval}::interval
      GROUP BY 1
    ), bid_totals AS (
      SELECT date_trunc(${bucket}, created_at) bucket_start, COUNT(*) total
      FROM bidding_history WHERE created_at >= now() - ${interval}::interval GROUP BY 1
    ), auction_totals AS (
      SELECT date_trunc(${bucket}, created_at) bucket_start, COUNT(*) total
      FROM products WHERE created_at >= now() - ${interval}::interval GROUP BY 1
    )
    SELECT b.bucket_start, to_char(b.bucket_start, ${label}) label,
      COALESCE(o.total, 0) completed_order_gmv_vnd,
      COALESCE(bi.total, 0) bids, COALESCE(a.total, 0) auctions
    FROM buckets b
    LEFT JOIN order_totals o USING (bucket_start)
    LEFT JOIN bid_totals bi USING (bucket_start)
    LEFT JOIN auction_totals a USING (bucket_start)
    ORDER BY b.bucket_start`);
  return rows.map((row) => ({
    label: row.label,
    bucketStart: row.bucket_start.toISOString(),
    completedOrderGmvVnd: number(row.completed_order_gmv_vnd),
    bids: number(row.bids),
    auctions: number(row.auctions),
  }));
}

export async function getCategoryDistribution(range: DashboardRange): Promise<DashboardCategoryPoint[]> {
  const interval = RANGE_CONFIG[range].interval;
  const rows = await prisma.$queryRaw<Array<{ category: string; auctions: bigint }>>(Prisma.sql`
    SELECT COALESCE(c.name, 'Uncategorized') category, COUNT(*) auctions
    FROM products p LEFT JOIN categories c ON c.id::bigint = p.cat2_id
    WHERE p.created_at >= now() - ${interval}::interval
    GROUP BY COALESCE(c.name, 'Uncategorized') ORDER BY auctions DESC LIMIT 12`);
  const total = rows.reduce((sum, row) => sum + number(row.auctions), 0);
  return rows.map((row) => ({
    category: row.category,
    auctions: number(row.auctions),
    share: total === 0 ? 0 : Math.round((number(row.auctions) / total) * 10_000) / 100,
  }));
}

export async function getBidHeatmap(range: DashboardRange): Promise<DashboardHeatmapPoint[]> {
  const interval = RANGE_CONFIG[range].interval;
  const rows = await prisma.$queryRaw<Array<{ day: number; hour: number; bids: bigint }>>(Prisma.sql`
    SELECT EXTRACT(ISODOW FROM created_at)::int - 1 AS day,
      EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS bids
    FROM bidding_history WHERE created_at >= now() - ${interval}::interval
    GROUP BY 1, 2 ORDER BY 1, 2`);
  return rows.map((row) => ({ day: row.day, hour: row.hour, bids: number(row.bids) }));
}

export async function getDashboardActivities(): Promise<DashboardActivity[]> {
  const rows = await prisma.$queryRaw<Array<{
    created_at: Date; actor: string; action: string; resource: string; value: string | bigint | null;
  }>>(Prisma.sql`
    SELECT * FROM (
      SELECT bh.created_at, COALESCE(u.full_name, u.username) actor, 'bid.placed' action,
        COALESCE(p.product_name, 'Auction') resource, bh.product_price::text value
      FROM bidding_history bh JOIN users u ON u.user_id = bh.user_id
      JOIN products p ON p.product_id = bh.product_id
      UNION ALL
      SELECT o.created_at, COALESCE(u.full_name, u.username), 'order.' || COALESCE(o.order_status, 'pending'),
        COALESCE(p.product_name, 'Order'), o.amount_vnd::text
      FROM orders o JOIN users u ON u.user_id = o.user_id
      LEFT JOIN products p ON p.product_id = o.product_id
      UNION ALL
      SELECT s.created_at, COALESCE(u.full_name, u.username), 'seller.requested',
        'Seller verification', s.status
      FROM upgrade_to_sellers s JOIN users u ON u.user_id = s.user_id
    ) activity ORDER BY created_at DESC LIMIT 20`);
  return rows.map((row) => ({
    createdAt: row.created_at.toISOString(),
    actor: row.actor,
    action: row.action,
    resource: row.resource,
    value: row.value === null ? null : String(row.value),
  }));
}

export async function aggregateRange(range: DashboardRange) {
  const [{ metrics, comparison }, series, categoryDistribution, bidHeatmap] = await Promise.all([
    getDashboardMetrics(range),
    getDashboardChartData(range),
    getCategoryDistribution(range),
    getBidHeatmap(range),
  ]);
  return { metrics, comparison, series, categoryDistribution, bidHeatmap };
}
