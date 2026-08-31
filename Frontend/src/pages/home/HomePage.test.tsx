import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home, { ADMIN_INITIAL_REDIRECT_KEY } from "./HomePage";

const mockNavigate = vi.fn();
const authState = vi.hoisted(() => ({
  loading: false,
  auth: null as { role: string; user_id: number; username: string } | null,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/routes/ProtectedRouter", () => ({
  useAuth: () => ({
    auth: authState.auth,
    loading: authState.loading,
  }),
}));

vi.mock("@/pages/home/sections/Section1", () => ({
  default: () => <div data-testid="section-1">Section 1</div>,
}));

vi.mock("@/pages/home/sections/SectionCategoryQuickNav", () => ({
  default: () => <div data-testid="section-category">Category Quick Nav</div>,
}));

vi.mock("@/pages/home/sections/Section3DPedestal", () => ({
  default: () => <div>3D Pedestal</div>,
}));

vi.mock("@/pages/home/sections/SectionLiveTerminal", () => ({
  default: () => <div>Live Terminal</div>,
}));

vi.mock("@/pages/home/sections/Section2", () => ({
  default: () => <div>Section 2</div>,
}));

vi.mock("@/pages/home/sections/SectionVault3D", () => ({
  default: () => <div>Vault 3D</div>,
}));

describe("HomePage - Admin Initial Route Redirect Guard", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockReset();
    authState.loading = false;
    authState.auth = null;
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("renders storefront normally for unauthenticated visitors", () => {
    authState.auth = null;
    authState.loading = false;

    render(<Home />);

    expect(screen.getByTestId("section-1")).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders storefront normally for regular users/bidders", () => {
    authState.auth = { role: "bidder", user_id: 1, username: "bidder1" };
    authState.loading = false;

    render(<Home />);

    expect(screen.getByTestId("section-1")).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects admin to /admin/dashboard on first session visit and sets session flag", () => {
    authState.auth = { role: "admin", user_id: 99, username: "admin_boss" };
    authState.loading = false;

    render(<Home />);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
    expect(sessionStorage.getItem(ADMIN_INITIAL_REDIRECT_KEY)).toBe("true");
    expect(screen.queryByTestId("section-1")).toBeNull();
  });

  it("allows admin to view storefront when the session flag is already set", () => {
    sessionStorage.setItem(ADMIN_INITIAL_REDIRECT_KEY, "true");
    authState.auth = { role: "admin", user_id: 99, username: "admin_boss" };
    authState.loading = false;

    render(<Home />);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId("section-1")).toBeDefined();
  });
});
