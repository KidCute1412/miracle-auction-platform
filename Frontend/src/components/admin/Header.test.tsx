import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Header from "./Header";

vi.mock("@/routes/ProtectedRouter", () => ({ useAuth: () => ({ auth: { username: "admin", full_name: "Admin" }, setAuth: vi.fn() }) }));
vi.mock("@/contexts/ThemeContext", () => ({ useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }) }));
vi.mock("@/services/account.service.ts", () => ({ accountService: { logout: vi.fn() } }));
vi.mock("@/components/common/UserAvatar", () => ({ default: () => <span>avatar</span> }));

describe("Admin header sidebar toggle", () => {
  it("exposes an accessible toggle with the current sidebar state", () => {
    const onToggleSidebar = vi.fn();
    render(<MemoryRouter><Header sidebarOpen onToggleSidebar={onToggleSidebar} /></MemoryRouter>);
    const toggle = screen.getByRole("button", { name: "Close sidebar" });
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(toggle);
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });
});
