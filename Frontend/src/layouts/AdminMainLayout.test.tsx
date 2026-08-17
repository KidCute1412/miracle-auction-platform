import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminMainLayout from "./AdminMainLayout";

const authState = vi.hoisted(() => ({ loading: true }));

vi.mock("@/routes/ProtectedRouter", () => ({
  useAuth: () => ({ auth: null, loading: authState.loading }),
}));

vi.mock("@/components/admin/Header", () => ({ default: () => <div /> }));
vi.mock("@/components/admin/Sidebar", () => ({ default: () => <div /> }));

describe("AdminMainLayout", () => {
  afterEach(() => cleanup());

  it("uses the shared default loader while authentication is pending", () => {
    render(
      <MemoryRouter>
        <AdminMainLayout />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeDefined();
    expect(document.querySelector(".animate-spin.rounded-full.h-16")).toBeNull();
  });
});
