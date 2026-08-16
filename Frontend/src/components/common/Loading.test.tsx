import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import Loading from "./Loading";

describe("Loading Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default loading text", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("renders custom message", () => {
    render(<Loading message="Fetching Auction Details..." />);
    expect(screen.getByText("Fetching Auction Details...")).toBeDefined();
  });

  it("renders in inline variant correctly", () => {
    const { container } = render(<Loading variant="inline" message="Inline loading" />);
    expect(screen.getByText("Inline loading")).toBeDefined();
    const firstEl = container.firstElementChild as HTMLElement;
    expect(firstEl?.className).toContain("w-full");
    expect(container.querySelector(".fixed")).toBeNull();
  });

  it("renders custom image if provided", () => {
    render(<Loading image="/custom-logo.png" />);
    const img = screen.getByAltText("Loading");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("/custom-logo.png");
  });

  it("hides icon/image when showImage is false", () => {
    const { container } = render(<Loading showImage={false} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
});
