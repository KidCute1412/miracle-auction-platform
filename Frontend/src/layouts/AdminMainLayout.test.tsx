import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminMainLayout from "./AdminMainLayout";

const authState = vi.hoisted(() => ({
  loading: true,
  auth: null as { role: string } | null,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    ScrollRestoration: () => null,
  };
});

vi.mock("@/routes/ProtectedRouter", () => ({
  useAuth: () => ({ auth: authState.auth, loading: authState.loading }),
}));

vi.mock("@/components/admin/Header", () => ({
  default: ({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen?: boolean }) => (
    <button data-testid="toggle-sidebar" aria-pressed={sidebarOpen} onClick={onToggleSidebar}>
      Toggle Sidebar
    </button>
  ),
}));

vi.mock("@/components/admin/Sidebar", () => ({
  default: ({ onNavigate }: { onNavigate?: () => void }) => (
    <div data-testid="sidebar-content">
      <button data-testid="nav-link" onClick={onNavigate}>
        Category Link
      </button>
    </div>
  ),
}));

describe("AdminMainLayout", () => {
  beforeEach(() => {
    authState.loading = true;
    authState.auth = null;
  });

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

  it("renders mobile drawer navigation and closes when link is clicked", () => {
    authState.loading = false;
    authState.auth = { role: "admin" };

    // Simulate mobile viewport
    window.innerWidth = 500;

    render(
      <MemoryRouter>
        <AdminMainLayout />
      </MemoryRouter>,
    );

    // Header toggle button should exist
    const toggle = screen.getByTestId("toggle-sidebar");
    expect(toggle).toBeDefined();

    // In mobile viewport (<768px), sidebarOpen starts as false
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    // Open mobile sidebar
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    // Mobile drawer should be rendered and visible
    const mobileNav = screen.getByRole("complementary", { name: "Mobile Navigation" });
    expect(mobileNav.className).toContain("translate-x-0");

    // Clicking a nav link inside mobile drawer closes the drawer
    const navLinks = screen.getAllByTestId("nav-link");
    fireEvent.click(navLinks[0]);

    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(mobileNav.className).toContain("-translate-x-full");
  });

  it("closes mobile drawer when backdrop is clicked", () => {
    authState.loading = false;
    authState.auth = { role: "admin" };

    window.innerWidth = 500;

    render(
      <MemoryRouter>
        <AdminMainLayout />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("toggle-sidebar");
    fireEvent.click(toggle);

    // Backdrop should exist
    const backdrop = document.querySelector('[role="presentation"]');
    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop!);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });
});
