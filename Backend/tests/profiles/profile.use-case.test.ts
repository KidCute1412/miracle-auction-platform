import { describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({ editUserProfile: vi.fn(), getUserProfileDetail: vi.fn() }));
const upload = vi.hoisted(() => vi.fn().mockResolvedValue({ secure_url: "https://image.test/avatar.png" }));
const unlinkSync = vi.hoisted(() => vi.fn());
vi.mock("../../src/modules/profiles/infrastructure/profile.repository.ts", () => repo);
vi.mock("@/config/cloud.config.ts", () => ({ uploadToCloudinary: upload }));
vi.mock("fs", () => ({ default: { unlinkSync } }));

import { editUserProfile, getUserProfileDetail } from "../../src/modules/profiles/application/profile.use-case.ts";

describe("profile use cases", () => {
  it("updates a profile without an avatar", async () => {
    repo.editUserProfile.mockResolvedValue({ user_id: 1 });
    await expect(editUserProfile({ user_id: 1 } as any)).resolves.toEqual({ user_id: 1 });
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads and removes a temporary avatar", async () => {
    const data = { user_id: 1 } as any;
    await editUserProfile(data, { path: "avatar.png" } as Express.Multer.File);
    expect(data.avatar).toBe("https://image.test/avatar.png"); expect(unlinkSync).toHaveBeenCalledWith("avatar.png");
  });

  it("delegates public profile lookup", async () => {
    const params = { username: "user", user_id: 1, current_user_id: null };
    repo.getUserProfileDetail.mockResolvedValue({ username: "user" });
    await expect(getUserProfileDetail(params)).resolves.toEqual({ username: "user" });
    expect(repo.getUserProfileDetail).toHaveBeenCalledWith(params);
  });
});
