import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, expect, it, afterEach, vi, beforeEach } from "vitest";
import SafeImage from "./SafeImage";

describe("SafeImage Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    cleanup();
  });

  it("renders image with loading state initially and includes no-referrer policy", () => {
    const { container } = render(<SafeImage src="https://example.com/item.jpg" alt="Vintage Watch" />);
    const img = screen.getByAltText("Vintage Watch");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/item.jpg");
    expect(img.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("transitions to loaded state when image loads", () => {
    const { container } = render(<SafeImage src="https://example.com/item2.jpg" alt="Vintage Watch Loaded" />);
    const img = screen.getByAltText("Vintage Watch Loaded");
    fireEvent.load(img);
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(img.className).toContain("opacity-100");
  });

  it("handles missing src by immediately showing fallback UI", () => {
    render(<SafeImage src="" alt="No Image Product" showFallbackText={true} />);
    expect(screen.getByText("No Image Product")).toBeDefined();
  });

  it("auto-retries on error before falling back to placeholder UI", () => {
    const { container } = render(
      <SafeImage
        src="https://example.com/broken.jpg"
        alt="Broken Item"
        maxRetries={2}
        showFallbackText={true}
      />
    );

    const img = screen.getByAltText("Broken Item");

    // First error -> triggers first retry timer
    fireEvent.error(img);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(img.getAttribute("src")).toContain("_retry=1");

    // Second error -> triggers second retry timer
    fireEvent.error(img);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(img.getAttribute("src")).toContain("_retry=2");

    // Third error -> retries exhausted, switches to error state
    fireEvent.error(img);
    expect(screen.getByText("Broken Item")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("attempts fallbackSrc before falling back to placeholder UI when maxRetries is 0", () => {
    render(
      <SafeImage
        src="https://example.com/primary.jpg"
        fallbackSrc="https://example.com/backup.jpg"
        alt="Product with backup"
        maxRetries={0}
      />
    );
    const img = screen.getByAltText("Product with backup");
    expect(img.getAttribute("src")).toBe("https://example.com/primary.jpg");

    // Error triggers fallbackSrc immediately
    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("https://example.com/backup.jpg");
  });

  it("optimizes Cloudinary image URLs automatically", () => {
    render(
      <SafeImage
        src="https://res.cloudinary.com/demo/image/upload/v12345/watch.jpg"
        alt="Cloudinary Watch"
        optimizeWidth={400}
      />
    );
    const img = screen.getByAltText("Cloudinary Watch");
    expect(img.getAttribute("src")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_limit/v12345/watch.jpg"
    );
  });
});
