import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { verifyRole, verifyToken } from "../../src/middlewares/auth.middleware.ts";
import type { AccountRequest } from "../../src/interfaces/request.interface.ts";

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie ?? "").split(";").filter(Boolean).map((item) => item.trim().split("=")));
  next();
});
app.get("/private", verifyToken, (_req, res) => res.json({ status: "success" }));
app.get("/admin", verifyToken, verifyRole("admin"), (_req, res) => res.json({ status: "success" }));
const withRole = (role: string) => (req: AccountRequest, _res: express.Response, next: express.NextFunction) => {
  req.user = { role } as AccountRequest["user"];
  next();
};
app.get("/role/user", withRole("user"), verifyRole("admin"), (_req, res) => res.json({ status: "success" }));
app.get("/role/admin", withRole("admin"), verifyRole("admin"), (_req, res) => res.json({ status: "success" }));

describe("authentication boundary contract", () => {
  it.each(["/private", "/admin"])("GET %s rejects a missing access token", async (path) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Access token is missing");
  });

  it("rejects a malformed access token", async () => {
    const response = await request(app).get("/private").set("Cookie", "accessToken=not-a-jwt");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid access token");
  });

  it("rejects a non-admin role and allows an admin role", async () => {
    const denied = await request(app).get("/role/user");
    expect(denied.status).toBe(403);
    expect(denied.body.message).toContain("Allowed roles: admin");
    await request(app).get("/role/admin").expect(200, { status: "success" });
  });
});
