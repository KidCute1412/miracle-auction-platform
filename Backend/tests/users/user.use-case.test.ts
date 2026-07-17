import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
  getUserById: vi.fn(), registerSellerRequest: vi.fn(), checkRegisterSellerRequest: vi.fn(), rateUser: vi.fn(),
  getUserRatingCount: vi.fn(), getUserRatingHistory: vi.fn(), calTotalUsers: vi.fn(), getUsersWithOffsetLimit: vi.fn(),
  updateUserRole: vi.fn(), updateUserStatus: vi.fn(), resetUserPassword: vi.fn(), calTotalApplications: vi.fn(),
  getAllSellerApplications: vi.fn(), getSellerApplicationById: vi.fn(), setApplicationStatus: vi.fn(),
}));
const sendMail = vi.hoisted(() => vi.fn());
vi.mock("../../src/modules/users/infrastructure/user.repository.ts", () => repo);
vi.mock("@/helpers/mail.helper.ts", () => ({ sendMail }));

import * as useCase from "../../src/modules/users/application/user.use-case.ts";

describe("user use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("delegates common user and rating operations", async () => {
    repo.getUserById.mockResolvedValue({ user_id: 1 }); repo.checkRegisterSellerRequest.mockResolvedValue(true);
    repo.rateUser.mockResolvedValue({ id: 1 }); repo.getUserRatingCount.mockResolvedValue(2);
    repo.getUserRatingHistory.mockResolvedValue([1]); repo.calTotalUsers.mockResolvedValue(3);
    repo.getUsersWithOffsetLimit.mockResolvedValue([2]); repo.calTotalApplications.mockResolvedValue(4);
    expect(await useCase.getUserById(1)).toEqual({ user_id: 1 });
    await useCase.registerSellerRequest(1, "reason");
    expect(await useCase.checkRegisterSellerRequest(1)).toBe(true);
    expect(await useCase.rateUser(2, 1, 1, "good")).toEqual({ id: 1 });
    expect(await useCase.getUserRatingCount(2, "user")).toBe(2);
    expect(await useCase.getUserRatingHistory(2, "user", 0, 10)).toEqual([1]);
    expect(await useCase.calTotalUsers({})).toBe(3);
    expect(await useCase.getUsersWithOffsetLimit(0, 10, {})).toEqual([2]);
    expect(await useCase.calTotalApplications({})).toBe(4);
  });

  it("updates both role and status", async () => {
    await useCase.editUserRoleAndStatus(1, "seller", "active");
    expect(repo.updateUserRole).toHaveBeenCalledWith(1, "seller");
    expect(repo.updateUserStatus).toHaveBeenCalledWith(1, "active");
  });

  it("does not reset a missing user's password", async () => {
    repo.getUserById.mockResolvedValue(null);
    await expect(useCase.resetUserPassword(99)).resolves.toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("resets an existing user's password and sends notification", async () => {
    repo.getUserById.mockResolvedValue({ email: "user@example.com" });
    await expect(useCase.resetUserPassword(1)).resolves.toBe(true);
    expect(sendMail).toHaveBeenCalledOnce();
    expect(repo.resetUserPassword).toHaveBeenCalledWith(1, expect.any(String));
  });

  it("enriches application list and detail", async () => {
    const applications = [{ user_id: 1 }];
    repo.getAllSellerApplications.mockResolvedValue(applications);
    repo.getUserById.mockResolvedValue({ full_name: "User", email: "u@example.com", username: "user" });
    expect(await useCase.getSellerApplicationsDetailed(2, 5, {})).toEqual([{ user_id: 1, full_name: "User", email: "u@example.com" }]);
    repo.getSellerApplicationById.mockResolvedValue({ id: 4, user_id: 1 });
    expect(await useCase.getSellerApplicationByIdDetailed(4)).toMatchObject({ id: 4, username: "user" });
  });

  it("returns null for incomplete application detail", async () => {
    repo.getSellerApplicationById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, user_id: 9 });
    await expect(useCase.getSellerApplicationByIdDetailed(1)).resolves.toBeNull();
    repo.getUserById.mockResolvedValue(null);
    await expect(useCase.getSellerApplicationByIdDetailed(1)).resolves.toBeNull();
  });

  it("promotes the applicant only when accepted", async () => {
    repo.getSellerApplicationById.mockResolvedValue({ user_id: 7 });
    await expect(useCase.setApplicationStatus(1, "accepted")).resolves.toBe(true);
    expect(repo.updateUserRole).toHaveBeenCalledWith(7, "seller");
    await useCase.setApplicationStatus(2, "rejected");
    expect(repo.updateUserRole).toHaveBeenCalledTimes(1);
  });
});
