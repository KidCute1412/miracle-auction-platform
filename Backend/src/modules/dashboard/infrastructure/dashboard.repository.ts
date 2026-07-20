import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

async function raw<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<{ rows: T[] }> {
  let placeholderIndex = 0;
  const parameterizedSql = sql.replace(/\?/g, () => `$${++placeholderIndex}`);
  return { rows: await prisma.$queryRawUnsafe<T[]>(parameterizedSql, ...params) };
}

// Fetch key performance metrics for the admin dashboard
export async function getDashboardMetrics() {
  const gmvQuery = await prisma.$queryRaw<Array<{ total_gmv: number }>>(
    Prisma.raw(
      `select coalesce(sum(current_price), 0) as total_gmv from products where end_time <= now() and price_owner_id is not null and is_removed = false`,
    ),
  );
  const usersQuery = await prisma.$queryRaw<Array<{ total_users: bigint }>>(
    Prisma.raw(`select count(*) as total_users from users where status = 'active'`),
  );
  const auctionsQuery = await prisma.$queryRaw<Array<{ active_auctions: bigint }>>(
    Prisma.raw(
      `select count(*) as active_auctions from products where start_time <= now() and end_time >= now() and is_removed = false`,
    ),
  );
  const verificationsQuery = await prisma.$queryRaw<Array<{ pending_verifications: bigint }>>(
    Prisma.raw(`select count(*) as pending_verifications from upgrade_to_sellers where status = 'pending'`),
  );

  return {
    gmv: Number(gmvQuery[0].total_gmv),
    activeUsers: Number(usersQuery[0].total_users),
    activeAuctions: Number(auctionsQuery[0].active_auctions),
    pendingVerifications: Number(verificationsQuery[0].pending_verifications),
  };
}

// Range configuration resolver helper function
function getRangeConfig(range: string) {
  let interval = "6 months";
  let format = "Mon";
  let dateTrunc = "month";

  if (range === "7d") {
    interval = "7 days";
    format = "Dy DD";
    dateTrunc = "day";
  } else if (range === "30d") {
    interval = "30 days";
    format = "Mon DD";
    dateTrunc = "day";
  } else if (range === "3m") {
    interval = "3 months";
    format = "Mon DD";
    dateTrunc = "week";
  } else if (range === "1y") {
    interval = "12 months";
    format = "Mon YY";
    dateTrunc = "month";
  }

  return { interval, format, dateTrunc };
}

// Fetch historical aggregation data for dashboard trends
export async function getDashboardChartData(range: string = "6m") {
  const { interval, format, dateTrunc } = getRangeConfig(range);

  const overviewQuery = await raw(
    `select to_char(created_at, '${format}') as month, count(*) as count, date_trunc('${dateTrunc}', created_at) as trunc_date
     from products 
     where created_at >= now() - ?::interval 
     group by to_char(created_at, '${format}'), date_trunc('${dateTrunc}', created_at) 
     order by trunc_date`,
    [interval],
  );

  const revenueQuery = await raw(
    `select to_char(end_time, '${format}') as month, sum(current_price) as count, date_trunc('${dateTrunc}', end_time) as trunc_date
     from products 
     where end_time <= now() and price_owner_id is not null and is_removed = false and end_time >= now() - ?::interval 
     group by to_char(end_time, '${format}'), date_trunc('${dateTrunc}', end_time) 
     order by trunc_date`,
    [interval],
  );

  const bidsQuery = await raw(
    `select to_char(created_at, '${format}') as month, count(*) as count, date_trunc('${dateTrunc}', created_at) as trunc_date
     from bidding_history 
     where created_at >= now() - ?::interval 
     group by to_char(created_at, '${format}'), date_trunc('${dateTrunc}', created_at) 
     order by trunc_date`,
    [interval],
  );

  return {
    overview: overviewQuery.rows,
    revenue: revenueQuery.rows,
    bids: bidsQuery.rows,
  };
}

// Fetch recently logged platform events
export async function getDashboardActivities() {
  const bids = await raw<{ created_at: Date }>(
    `select bh.created_at, u.username, u.full_name as user, 'placed new bid' as action, p.product_name as item, bh.max_price as value, 'text-primary' as color
     from bidding_history bh
     join users u on bh.user_id = u.user_id
     join products p on bh.product_id = p.product_id
     order by bh.created_at desc limit 5`,
  );
  const orders = await raw<{ created_at: Date }>(
    `select o.created_at, u.username, u.full_name as user, 'completed purchase' as action, p.product_name as item, p.current_price as value, 'text-emerald-500' as color
     from orders o
     join users u on o.user_id = u.user_id
     join products p on o.product_id = p.product_id
     order by o.created_at desc limit 5`,
  );
  const upgrades = await raw<{ created_at: Date }>(
    `select uts.created_at, u.username, u.full_name as user, 'requested seller upgrade' as action, uts.reason as item, uts.status as value, 'text-amber-500' as color
     from upgrade_to_sellers uts
     join users u on uts.user_id = u.user_id
     order by uts.created_at desc limit 5`,
  );

  return [...bids.rows, ...orders.rows, ...upgrades.rows]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
}
