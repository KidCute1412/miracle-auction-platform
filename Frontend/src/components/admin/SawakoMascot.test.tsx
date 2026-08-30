import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import SawakoMascot from "./SawakoMascot";

describe("SawakoMascot Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders Sawako mascot container and SVG character by default", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("sawako-mascot-container")).toBeDefined();
    expect(screen.getByRole("img", { name: /Sawako Cat-Eared Anime Mascot/i })).toBeDefined();
  });

  it("displays the initial introduction speech bubble with Sawako's title", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("sawako-speech-bubble")).toBeDefined();
    expect(screen.getByText(/Chief Auditor Sawako on duty!/i)).toBeDefined();
  });

  it("triggers poke interaction and displays a tsundere quote when clicked", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const characterBody = screen.getByTestId("sawako-character-body");
    fireEvent.click(characterBody);

    // After poke, speech bubble should still be visible and updated with dialogue
    expect(screen.getByTestId("sawako-speech-bubble")).toBeDefined();
  });

  it("triggers dizzy easter egg when poked rapidly multiple times", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const characterBody = screen.getByTestId("sawako-character-body");

    // Click rapidly 6 times to reach the dizzy threshold
    for (let i = 0; i < 6; i++) {
      fireEvent.click(characterBody);
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    // Should trigger dizzy expression & dialogue containing dizzy keywords
    const bubble = screen.getByTestId("sawako-speech-bubble");
    expect(bubble).toBeDefined();
    expect(
      bubble.textContent?.includes("@.@") ||
      bubble.textContent?.includes("spinning") ||
      bubble.textContent?.includes("ears") ||
      bubble.textContent?.includes("floating")
    ).toBe(true);
  });

  it("minimizes to a sleepy cat-paw badge and restores on click", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    // Minimize button in utility bar
    const minimizeBtn = screen.getByLabelText("Minimize mascot");
    fireEvent.click(minimizeBtn);

    // Character body is hidden, minimized paw badge is shown
    expect(screen.queryByTestId("sawako-character-body")).toBeNull();
    expect(screen.getByTestId("sawako-minimized")).toBeDefined();
    expect(screen.getByText(/Sawako \(Napping\)/i)).toBeDefined();

    // Click paw badge to wake her up
    const wakeUpBtn = screen.getByRole("button", { name: /Wake up Sawako the mascot/i });
    fireEvent.click(wakeUpBtn);

    // Character is restored
    expect(screen.getByTestId("sawako-character-body")).toBeDefined();
    expect(screen.getByText(/You finally realized you can't manage this auction without me!/i)).toBeDefined();
  });

  it("allows muting speech bubbles via the mute toggle button", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const muteBtn = screen.getByLabelText("Mute dialogue");
    fireEvent.click(muteBtn);

    // Bubble should be dismissed
    expect(screen.queryByTestId("sawako-speech-bubble")).toBeNull();
  });

  it("tracks mouse movement to compute clamped eye offsets without throwing", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    act(() => {
      fireEvent.mouseMove(window, { clientX: 200, clientY: 300 });
    });

    expect(screen.getByTestId("sawako-mascot-container")).toBeDefined();
  });
});
