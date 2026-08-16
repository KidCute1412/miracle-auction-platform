import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import SafeImage from "./SafeImage";

describe("SafeImage Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders image with loading state initially", () => {
    const { container } = render(<SafeImage src="https://example.com/item.jpg" alt="Vintage Watch" />);
    const img = screen.getByAltText("Vintage Watch");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/item.jpg");
    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("transitions to loaded state when image loads", () => {
    const { container } = render(<SafeImage src="https://example.com/item2.jpg" alt="Vintage Watch Loaded" />);
    const img = screen.getByAltText("Vintage Watch Loaded");
    fireEvent.load(img);
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(img.className).toContain("opacity-100");
  });

  it("renders fallback UI when image fails to load", () => {
    const { container } = render(
      <SafeImage src="https://example.com/broken.jpg" alt="Broken Item" showFallbackText={true} />
    );
    const img = screen.getByAltText("Broken Item");
    fireEvent.error(img);
    expect(screen.getByText("Broken Item")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("handles missing src by immediately showing fallback UI", () => {
    render(<SafeImage src="" alt="No Image Product" showFallbackText={true} />);
    expect(screen.getByText("No Image Product")).toBeDefined();
  });

  it("attempts fallbackSrc before falling back to placeholder UI", () => {
    render(
      <SafeImage
        src="https://example.com/primary.jpg"
        fallbackSrc="https://example.com/backup.jpg"
        alt="Product with backup"
      />
    );
    const img = screen.getByAltText("Product with backup");
    expect(img.getAttribute("src")).toBe("https://example.com/primary.jpg");

    // First error triggers backup fallbackSrc
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("https://example.com/backup.jpg");
  });
});
