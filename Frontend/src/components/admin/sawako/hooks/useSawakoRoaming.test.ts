import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useSawakoRoaming } from "./useSawakoRoaming";

describe("useSawakoRoaming Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes with zero roaming offset and not walking", () => {
    const { result } = renderHook(() =>
      useSawakoRoaming({
        basePosX: 0,
        isDragging: false,
        minimized: false,
      })
    );

    expect(result.current.roamingOffsetX).toBe(0);
    expect(result.current.isWalking).toBe(false);
    expect(["left", "right"]).toContain(result.current.walkDirection);
  });

  it("transitions to walking after idle rest duration", () => {
    const { result } = renderHook(() =>
      useSawakoRoaming({
        basePosX: 0,
        isDragging: false,
        minimized: false,
      })
    );

    expect(result.current.isWalking).toBe(false);

    // With Math.random() = 0.5, restDelay is exactly 12000ms
    act(() => {
      vi.advanceTimersByTime(12500);
    });

    // Should now be walking with an offset applied
    expect(result.current.isWalking).toBe(true);
    expect(result.current.roamingOffsetX).not.toBe(0);

    // Advance past walk duration (durationSec * 1000)
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Walking should stop, resting at the new offset
    expect(result.current.isWalking).toBe(false);
  });

  it("aborts walking immediately when user begins dragging", () => {
    const { result, rerender } = renderHook(
      (props) => useSawakoRoaming(props),
      {
        initialProps: {
          basePosX: 0,
          isDragging: false,
          minimized: false,
        },
      }
    );

    // Trigger walking
    act(() => {
      vi.advanceTimersByTime(12500);
    });
    expect(result.current.isWalking).toBe(true);

    // User drags
    rerender({
      basePosX: 0,
      isDragging: true,
      minimized: false,
    });

    // Walking must immediately halt
    expect(result.current.isWalking).toBe(false);
  });

  it("does not initiate walk when minimized", () => {
    const { result } = renderHook(() =>
      useSawakoRoaming({
        basePosX: 0,
        isDragging: false,
        minimized: true,
      })
    );

    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(result.current.isWalking).toBe(false);
    expect(result.current.roamingOffsetX).toBe(0);
  });

  it("allows resetting roaming offset cleanly", () => {
    const { result } = renderHook(() =>
      useSawakoRoaming({
        basePosX: 0,
        isDragging: false,
        minimized: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(12500);
    });
    expect(result.current.roamingOffsetX).not.toBe(0);

    act(() => {
      result.current.resetRoaming();
    });

    expect(result.current.roamingOffsetX).toBe(0);
    expect(result.current.isWalking).toBe(false);
  });
});
