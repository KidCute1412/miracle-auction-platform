import db from "@/config/database.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

// Fetch user profile by ID
export async function getUserById(user_id: number) {
  return prisma.users.findUnique({ where: { user_id } });
}

// Register a new request to upgrade to seller status
export async function registerSellerRequest(user_id: number, reason: string): Promise<void> {
  await prisma.upgrade_to_sellers.create({
    data: { user_id, reason, expiry_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
}

// Check if user has an active seller request
export async function checkRegisterSellerRequest(user_id: number): Promise<boolean> {
  const request = await prisma.upgrade_to_sellers.findFirst({
    where: { user_id, expiry_time: { gt: new Date() } },
    select: { id: true },
  });
  return request !== null;
}

// Insert rating and update average scores in user record
export async function rateUser(user_id: number, rater_id: number, score: number, comment: string) {
  await db.raw(
    `insert into user_rating (user_id, rater_id, score, comment)
     values (?, ?, ?, ?)`,
    [user_id, rater_id, score, comment],
  );

  const allRatings = await db.raw(
    `select count(*) as rating_count, 
            count(case when score >= 1 then 1 end) as positive_rating_count
     from user_rating
     where user_id = ?`,
    [user_id],
  );
  const ratingCount = Number(allRatings.rows[0].rating_count);
  const positiveRatingCount = Number(allRatings.rows[0].positive_rating_count);
  const averageRating = ratingCount > 0 ? (positiveRatingCount / ratingCount) * 5 : 5.0;

  await db.raw(
    `update users
     set rating = ?, rating_count = ?
     where user_id = ?`,
    [averageRating, ratingCount, user_id],
  );

  return {
    rating: averageRating,
    rating_count: ratingCount,
  };
}

// Fetch total ratings count and positive ratings count
export async function getUserRatingCount(user_id: number, username: string) {
  const ratingQuery = await db.raw(
    `select count (*) as rating_count,
            count (case when score >= 1 then 1 end) as positive_rating_count
     from user_rating ur
     left join users u on ur.user_id = u.user_id
     where ur.user_id = ? and u.username = ?`,
    [user_id, username],
  );
  return ratingQuery.rows[0];
}

// Retrieve paginated user rating log history
export async function getUserRatingHistory(user_id: number, username: string, offset: number, limit: number) {
  const ratingHistoryQuery = await db.raw(
    `select ur.*, rater.username as rater_username, rater.full_name as rater_full_name, rater.avatar as rater_avatar, count (*) over() as total_count
     from user_rating ur
     left join users rater on ur.rater_id = rater.user_id
     left join users u on ur.user_id = u.user_id
     where ur.user_id = ? and u.username = ?
     order by ur.created_at desc
     offset ? limit ?`,
    [user_id, username, offset, limit],
  );
  return ratingHistoryQuery.rows;
}

// Calculate total active users matching filters
export async function calTotalUsers(filter: any) {
  const q = db("users").whereNot({ role: "admin" }).count("user_id as count");

  if (filter?.search) {
    q.andWhereRaw("fts @@ websearch_to_tsquery('english', remove_accents(?))", [filter.search]);
  }
  if (filter?.status && filter.status !== "all") {
    q.andWhere("role", filter.status);
  }
  const result = await q;
  return parseInt(result[0].count as string, 10);
}

// Retrieve paginated active users matching filters
export async function getUsersWithOffsetLimit(offset: number, limit: number, filter: any) {
  const q = db("users").select("*").whereNot({ role: "admin" }).orderBy("user_id", "asc").offset(offset).limit(limit);

  if (filter?.search) {
    q.andWhereRaw("fts @@ websearch_to_tsquery('english', remove_accents(?))", [filter.search]);
  }
  if (filter?.status && filter.status !== "all") {
    q.andWhere("role", filter.status);
  }
  return await q;
}

// Update user role
export async function updateUserRole(user_id: number, role: string): Promise<void> {
  await prisma.users.update({ where: { user_id }, data: { role } });
}

// Update user status
export async function updateUserStatus(user_id: number, status: string): Promise<void> {
  await prisma.users.update({ where: { user_id }, data: { status } });
}

// Update user password to a new reset password value
export async function resetUserPassword(user_id: number, newPassword: string): Promise<void> {
  await prisma.users.update({ where: { user_id }, data: { password: newPassword } });
}

// Update state of upgrade request application form
export const setApplicationStatus = async (application_id: number, status: string): Promise<void> => {
  await prisma.upgrade_to_sellers.update({
    where: { id: BigInt(application_id) },
    data: { status },
  });
};

// Calculate total application forms matching filters
export async function calTotalApplications(filter: any) {
  const q = db("upgrade_to_sellers as uts").count("uts.id as count").leftJoin("users as u", "uts.user_id", "u.user_id");

  if (filter?.status && filter.status !== "all") {
    q.andWhere("uts.status", filter.status);
  }
  if (filter?.dateFrom && filter?.dateTo) {
    q.andWhereBetween("uts.created_at", [`${filter.dateFrom} 00:00:00`, `${filter.dateTo} 23:59:59`]);
  } else if (filter?.dateFrom) {
    q.andWhere("uts.created_at", ">=", `${filter.dateFrom} 00:00:00`);
  } else if (filter?.dateTo) {
    q.andWhere("uts.created_at", "<=", `${filter.dateTo} 23:59:59`);
  }
  if (filter?.search) {
    q.andWhere(function (this: any) {
      this.whereRaw(
        `LOWER(REPLACE(TRANSLATE(u.full_name, 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'), ' ', '-')) LIKE ?`,
        [`%${filter.search}%`],
      ).orWhereRaw(`LOWER(u.email) LIKE ?`, [`%${filter.search}%`]);
    });
  }
  const result = await q;
  return parseInt(result[0].count as string, 10);
}

// Retrieve paginated upgrade application forms matching filters
export async function getAllSellerApplications(offset: number, limit: number, filter: any) {
  const q = db("upgrade_to_sellers as uts")
    .select("uts.*")
    .leftJoin("users as u", "uts.user_id", "u.user_id")
    .orderBy("uts.id", "asc")
    .offset(offset)
    .limit(limit);

  if (filter?.status && filter.status !== "all") {
    q.andWhere("uts.status", filter.status);
  }
  if (filter?.dateFrom && filter?.dateTo) {
    q.andWhereBetween("uts.created_at", [`${filter.dateFrom} 00:00:00`, `${filter.dateTo} 23:59:59`]);
  } else if (filter?.dateFrom) {
    q.andWhere("uts.created_at", ">=", `${filter.dateFrom} 00:00:00`);
  } else if (filter?.dateTo) {
    q.andWhere("uts.created_at", "<=", `${filter.dateTo} 23:59:59`);
  }
  if (filter?.search) {
    q.andWhere(function (this: any) {
      this.whereRaw(
        `LOWER(REPLACE(TRANSLATE(u.full_name, 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'), ' ', '-')) LIKE ?`,
        [`%${filter.search}%`],
      ).orWhereRaw(`LOWER(u.email) LIKE ?`, [`%${filter.search}%`]);
    });
  }
  return await q;
}

// Fetch single seller application by ID
export async function getSellerApplicationById(id: number) {
  return prisma.upgrade_to_sellers.findUnique({ where: { id: BigInt(id) } });
}
