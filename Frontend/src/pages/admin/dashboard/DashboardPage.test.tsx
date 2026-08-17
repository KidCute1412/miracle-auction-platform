import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";

vi.mock("@/hooks/useAdminDashboardSocket", () => ({
  useAdminDashboardSocket: () => "connected",
}));

vi.mock("@/hooks/useDashboardData", () => ({
  useDashboardData: () => ({
    summary: null,
    operations: null,
    loading: true,
    error: null,
    refresh: vi.fn(),
  }),
}));

describe("DashboardPage", () => {
  it("uses the dashboard skeleton while dashboard data loads", () => {
    render(<DashboardPage />);

    expect(screen.getByLabelText("Loading dashboard")).toBeDefined();
    expect(screen.queryByText(/telemetry analytics feed/i)).toBeNull();
  });
});
