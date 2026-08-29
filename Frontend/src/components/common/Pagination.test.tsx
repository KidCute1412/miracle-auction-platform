import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PaginationComponent from "./Pagination";

describe("common Pagination", () => {
  it("navigates with a specific page input and clamps out-of-range values", () => {
    const controlPage = vi.fn();
    render(<MemoryRouter><PaginationComponent numberOfPages={12} currentPage={2} controlPage={controlPage} /></MemoryRouter>);
    const input = screen.getByRole("spinbutton", { name: "Page number" });
    fireEvent.change(input, { target: { value: "8" } });
    fireEvent.submit(input.closest("form")!);
    expect(controlPage).toHaveBeenCalledWith(8);
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.blur(input);
    expect(controlPage).toHaveBeenLastCalledWith(12);
  });

  it("uses URL page parameters when no callback is supplied", () => {
    render(<MemoryRouter initialEntries={["/admin?page=2"]}><PaginationComponent numberOfPages={4} currentPage={2} /></MemoryRouter>);
    fireEvent.click(screen.getAllByRole("link", { name: "Go to next page" })[0]);
    expect(screen.getAllByRole("link", { name: "Go to next page" }).length).toBeGreaterThan(0);
  });
});
