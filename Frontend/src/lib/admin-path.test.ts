import { describe, expect, it } from "vitest";
import { ADMIN_PATH, adminRoute } from "./admin-path";

describe("adminRoute", () => {
  it("always uses the hard-coded admin prefix", () => {
    expect(ADMIN_PATH).toBe("admin");
    expect(adminRoute()).toBe("/admin");
    expect(adminRoute("dashboard")).toBe("/admin/dashboard");
    expect(adminRoute("/category/list")).toBe("/admin/category/list");
  });
});
