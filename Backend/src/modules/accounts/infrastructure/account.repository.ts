import { Prisma, type users } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

export type NewAccount = {
  full_name: string;
  email: string;
  password?: string;
  address: string | null;
  username: string;
};

export type Account = Omit<users, "role"> & { role: string };
export type DetailedAccount = { email: string; password: string | null; full_name: string };

const mapAccount = (account: users | null): Account | null =>
  account ? { ...account, role: account.role ?? "user" } : null;

export class AccountRepository {
  async create(data: NewAccount): Promise<void> {
    await prisma.users.create({ data });
  }

  async findByEmail(email: string) {
    return mapAccount(await prisma.users.findUnique({ where: { email } }));
  }

  async findById(userId: number) {
    return mapAccount(await prisma.users.findUnique({ where: { user_id: userId } }));
  }

  async findDetailedById(userId: number): Promise<DetailedAccount | undefined> {
    const rows = await prisma.$queryRaw<DetailedAccount[]>(Prisma.sql`
      SELECT email, password, full_name
      FROM users WHERE user_id = ${userId}`);
    return rows[0];
  }

  async updatePassword(email: string, password: string): Promise<void> {
    await prisma.users.update({ where: { email }, data: { password } });
  }

  async createOtp(email: string, otp: string): Promise<void> {
    await prisma.otp_codes.create({ data: { email, otp } });
  }

  async findOtpByEmail(email: string) {
    return prisma.otp_codes.findUnique({ where: { email } });
  }

  async findOtp(email: string, otp: string) {
    return prisma.otp_codes.findFirst({ where: { email, otp } });
  }

  async deleteOtp(email: string): Promise<void> {
    await prisma.otp_codes.deleteMany({ where: { email } });
  }

  async deleteExpiredOtps(): Promise<void> {
    // Preserve the legacy expiry calculation while keeping PostgreSQL-specific SQL in infrastructure.
    await prisma.$executeRaw(Prisma.sql`DELETE FROM otp_codes WHERE otp_expiry + INTERVAL '2 minutes' < NOW()`);
  }
}

export const accountRepository = new AccountRepository();
