import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
  deleteExpiredOtps: vi.fn(), findOtp: vi.fn(), deleteOtp: vi.fn(), findByEmail: vi.fn(), findOtpByEmail: vi.fn(),
  createOtp: vi.fn(), create: vi.fn(), updatePassword: vi.fn(), findDetailedById: vi.fn(), findById: vi.fn(),
}));
vi.mock("../../../src/modules/accounts/infrastructure/account.repository.ts", () => ({ accountRepository: repo }));

import * as auth from "../../../src/modules/accounts/application/account-auth.use-case.ts";

describe("account authentication operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CAPTCHA_SECRET_KEY;
  });

  it("hashes passwords that can be compared", async () => {
    const hash = await auth.hashPassword("Password1!");
    await expect(auth.comparePassword("Password1!", hash)).resolves.toBe(true);
    await expect(auth.comparePassword("wrong", hash)).resolves.toBe(false);
  });

  it("rejects captcha when configuration is missing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(auth.verifyCaptcha("token")).resolves.toBe(false);
  });

  it("maps captcha provider success and provider failure", async () => {
    process.env.CAPTCHA_SECRET_KEY = "secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ json: vi.fn().mockResolvedValue({ success: true }) }).mockRejectedValueOnce(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(auth.verifyCaptcha("valid")).resolves.toBe(true);
    await expect(auth.verifyCaptcha("invalid")).resolves.toBe(false);
    vi.unstubAllGlobals();
  });

  it("delegates OTP and account persistence operations", async () => {
    repo.findOtp.mockResolvedValue({ otp: "123456" }); repo.findByEmail.mockResolvedValue({ user_id: 1 });
    repo.findOtpByEmail.mockResolvedValue({ email: "u@example.com" }); repo.findDetailedById.mockResolvedValue({ user_id: 1 }); repo.findById.mockResolvedValue({ user_id: 1 });
    await auth.deleteExpiredOTP(); expect(await auth.findEmailAndOtp("u@example.com", "123456")).toEqual({ otp: "123456" });
    await auth.deletedOTP("u@example.com"); expect(await auth.findEmail("u@example.com")).toEqual({ user_id: 1 });
    expect(await auth.findOtpByEmail("u@example.com")).toEqual({ email: "u@example.com" });
    await auth.insertOtpAndEmail("u@example.com", "123456");
    await auth.insertAccount({ email: "u@example.com", full_name: "Test User", username: "test-user", address: null });
    await auth.updatePassword("u@example.com", "hash");
    expect(await auth.findAccountByIdDetailed(1)).toEqual({ user_id: 1 }); expect(await auth.findAccountById(1)).toEqual({ user_id: 1 });
    expect(repo.createOtp).toHaveBeenCalledWith("u@example.com", "123456"); expect(repo.updatePassword).toHaveBeenCalledWith("u@example.com", "hash");
  });
});
