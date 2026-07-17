import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { accessCookie, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

vi.mock("../../src/modules/dashboard/api/dashboard.controller.ts", () => ({
  getSummary: (_req: unknown, res: any) => res.status(200).json({ status: "success" }),
  syncCache: (_req: unknown, res: any) => res.status(200).json({ status: "success" }),
}));

import adminRouter from "../../src/routes/admin/index.route.ts";

useIsolatedDatabase();
const app = express();
app.use(cookieParser());
app.use("/admin", adminRouter);

beforeAll(() => {
  process.env.JWT_SECRET = "integration-access-secret";
});

describe("admin route access boundary", () => {
  it("rejects missing authentication on a mounted admin API", async () => {
    await request(app).get("/admin/dashboard").expect(401, { message: "Access token is missing" });
  });

  it("rejects a non-admin and allows an admin", async () => {
    const user = await createUser({ role: "user" });
    const denied = await request(app).get("/admin/dashboard").set("Cookie", accessCookie(user));
    expect(denied.status).toBe(403);

    const admin = await createUser({ role: "admin" });
    await request(app).get("/admin/dashboard").set("Cookie", accessCookie(admin)).expect(200, { status: "success" });
  });
});
