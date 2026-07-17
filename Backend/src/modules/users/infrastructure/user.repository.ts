import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

type UserFilter = { search?: string; status?: string };
type ApplicationFilter = { search?: string; status?: string; dateFrom?: string; dateTo?: string };

function applicationWhere(filter: ApplicationFilter) {
  const conditions: Prisma.Sql[] = [];
  if (filter.status && filter.status !== "all") conditions.push(Prisma.sql`uts.status = ${filter.status}`);
  if (filter.dateFrom) conditions.push(Prisma.sql`uts.created_at >= ${new Date(`${filter.dateFrom} 00:00:00`)}`);
  if (filter.dateTo) conditions.push(Prisma.sql`uts.created_at <= ${new Date(`${filter.dateTo} 23:59:59`)}`);
  if (filter.search) conditions.push(Prisma.sql`(remove_accents(u.full_name) LIKE remove_accents(${`%${filter.search}%`}) OR LOWER(u.email) LIKE LOWER(${`%${filter.search}%`}))`);
  return conditions.length ? Prisma.join(conditions, " AND ") : Prisma.sql`TRUE`;
}

export const getUserById = (user_id: number) => prisma.users.findUnique({ where: { user_id } });

export async function registerSellerRequest(user_id: number, reason: string): Promise<void> {
  await prisma.upgrade_to_sellers.create({ data: { user_id, reason, expiry_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
}

export async function checkRegisterSellerRequest(user_id: number): Promise<boolean> {
  return (await prisma.upgrade_to_sellers.findFirst({ where: { user_id, expiry_time: { gt: new Date() }, }, select: { id: true } })) !== null;
}

export async function rateUser(user_id: number, rater_id: number, score: number, comment: string) {
  return prisma.$transaction(async (tx) => {
    await tx.user_rating.create({ data: { user_id, rater_id, score: BigInt(score), comment } });
    const [ratingCount, positiveRatingCount] = await Promise.all([
      tx.user_rating.count({ where: { user_id } }),
      tx.user_rating.count({ where: { user_id, score: { gte: 1n } } }),
    ]);
    const rating = ratingCount > 0 ? (positiveRatingCount / ratingCount) * 5 : 5;
    await tx.users.update({ where: { user_id }, data: { rating, rating_count: ratingCount } });
    return { rating, rating_count: ratingCount };
  });
}

export async function getUserRatingCount(user_id: number, username: string) {
  const rows = await prisma.$queryRaw<Array<{ rating_count: bigint; positive_rating_count: bigint }>>(Prisma.sql`
    SELECT count(*) AS rating_count, count(CASE WHEN score >= 1 THEN 1 END) AS positive_rating_count
    FROM user_rating ur LEFT JOIN users u ON ur.user_id = u.user_id WHERE ur.user_id = ${user_id} AND u.username = ${username}`);
  return rows[0];
}

export async function getUserRatingHistory(user_id: number, username: string, offset: number, limit: number) {
  return prisma.$queryRaw(Prisma.sql`
    SELECT ur.*, rater.username AS rater_username, rater.full_name AS rater_full_name, rater.avatar AS rater_avatar, count(*) OVER() AS total_count
    FROM user_rating ur LEFT JOIN users rater ON ur.rater_id = rater.user_id LEFT JOIN users u ON ur.user_id = u.user_id
    WHERE ur.user_id = ${user_id} AND u.username = ${username} ORDER BY ur.created_at DESC OFFSET ${offset} LIMIT ${limit}`);
}

export async function calTotalUsers(filter: UserFilter) {
  const conditions: Prisma.Sql[] = [Prisma.sql`role <> 'admin'`];
  if (filter.search) conditions.push(Prisma.sql`fts @@ websearch_to_tsquery('english', remove_accents(${filter.search}))`);
  if (filter.status && filter.status !== "all") conditions.push(Prisma.sql`role = ${filter.status}`);
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`SELECT count(user_id) AS count FROM users WHERE ${Prisma.join(conditions, " AND ")}`);
  return Number(rows[0]?.count ?? 0n);
}

export async function getUsersWithOffsetLimit(offset: number, limit: number, filter: UserFilter) {
  const conditions: Prisma.Sql[] = [Prisma.sql`role <> 'admin'`];
  if (filter.search) conditions.push(Prisma.sql`fts @@ websearch_to_tsquery('english', remove_accents(${filter.search}))`);
  if (filter.status && filter.status !== "all") conditions.push(Prisma.sql`role = ${filter.status}`);
  return prisma.$queryRaw<any[]>(Prisma.sql`SELECT user_id, username, full_name, email, password, address, role, date_of_birth, rating, rating_count, created_at, avatar, status, auth_version, fts::text as fts FROM users WHERE ${Prisma.join(conditions, " AND ")} ORDER BY user_id ASC OFFSET ${offset} LIMIT ${limit}`);
}

export const updateUserRole = (user_id: number, role: string) => prisma.users.update({ where: { user_id }, data: { role } }).then(() => undefined);
export const updateUserStatus = (user_id: number, status: string) => prisma.users.update({ where: { user_id }, data: { status, auth_version: { increment: 1 } } }).then(() => undefined);
export const resetUserPassword = (user_id: number, password: string) => prisma.users.update({ where: { user_id }, data: { password, auth_version: { increment: 1 } } }).then(() => undefined);
export const setApplicationStatus = (application_id: number, status: string) => prisma.upgrade_to_sellers.update({ where: { id: BigInt(application_id) }, data: { status } }).then(() => undefined);

export async function calTotalApplications(filter: ApplicationFilter) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT count(uts.id) AS count FROM upgrade_to_sellers uts LEFT JOIN users u ON uts.user_id = u.user_id WHERE ${applicationWhere(filter)}`);
  return Number(rows[0]?.count ?? 0n);
}

export function getAllSellerApplications(offset: number, limit: number, filter: ApplicationFilter) {
  return prisma.$queryRaw<any[]>(Prisma.sql`
    SELECT uts.* FROM upgrade_to_sellers uts LEFT JOIN users u ON uts.user_id = u.user_id
    WHERE ${applicationWhere(filter)} ORDER BY uts.id ASC OFFSET ${offset} LIMIT ${limit}`);
}

export const getSellerApplicationById = (id: number) => prisma.upgrade_to_sellers.findUnique({ where: { id: BigInt(id) } });
