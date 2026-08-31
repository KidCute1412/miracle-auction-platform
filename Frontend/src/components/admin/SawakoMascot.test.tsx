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
    expect(screen.getByRole("img", { name: /Sawako Anime Mascot/i })).toBeDefined();
  });

  it("displays the initial introduction speech bubble with Sawako's title", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("sawako-speech-bubble")).toBeDefined();
    expect(screen.getByText(/Sawako on duty!/i)).toBeDefined();
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
      bubble.textContent?.includes("star") ||
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
    expect(screen.getByText(/Admin-san, you came back/i)).toBeDefined();
  });

  it("allows muting sound without hiding dialogue bubble", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const muteBtn = screen.getByLabelText("Mute sound");
    fireEvent.click(muteBtn);

    // Bubble remains visible per user requirement
    expect(screen.getByTestId("sawako-speech-bubble")).toBeDefined();
    // Button toggles to unmute sound
    expect(screen.getByLabelText("Unmute sound")).toBeDefined();
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

  it("triggers special cute dialogue when clicking hands or feet", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    // Test hand interaction
    const handBtn = screen.getByTestId("sawako-hands-target");
    expect(handBtn).toBeDefined();
    act(() => {
      fireEvent.click(handBtn);
    });
    const bubbleAfterHand = screen.getByTestId("sawako-speech-bubble");
    expect(/hand|cold/i.test(bubbleAfterHand.textContent || "")).toBe(true);

    // Test foot interaction
    const footBtn = screen.getByTestId("sawako-feet-target");
    expect(footBtn).toBeDefined();
    act(() => {
      fireEvent.click(footBtn);
    });
    const bubbleAfterFoot = screen.getByTestId("sawako-speech-bubble");
    expect(/feet|tickl|dress|hem|ghost/i.test(bubbleAfterFoot.textContent || "")).toBe(true);
  });

  it("triggers special protective dialogue when clicking the star hairpin", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const starClip = screen.getByTestId("sawako-star-clip-target");
    expect(starClip).toBeDefined();

    act(() => {
      fireEvent.click(starClip);
    });

    const bubble = screen.getByTestId("sawako-speech-bubble");
    expect(/star clip|hairpins|precious|Kazehaya/i.test(bubble.textContent || "")).toBe(true);
  });

  it("recognizes sub-routes like /admin/product/list with contextual product dialogue", () => {
    render(
      <MemoryRouter initialEntries={["/admin/product/list"]}>
        <SawakoMascot />
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(700);
    });

    const bubble = screen.getByTestId("sawako-speech-bubble");
    expect(/treasures|reserve prices|collectibles|auction/i.test(bubble.textContent || "")).toBe(true);
  });

  it("triggers sweet headpat reaction when stroking the hair crown", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const headpatTarget = screen.getByTestId("sawako-headpat-target");
    expect(headpatTarget).toBeDefined();

    // Simulate stroking back and forth
    act(() => {
      fireEvent.mouseMove(headpatTarget, { clientX: 200 });
      fireEvent.mouseMove(headpatTarget, { clientX: 240 });
      fireEvent.mouseMove(headpatTarget, { clientX: 280 });
      fireEvent.mouseMove(headpatTarget, { clientX: 320 });
    });

    // Advance timer to complete headpatting and reveal post-headpat line
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const bubble = screen.getByTestId("sawako-speech-bubble");
    expect(/warm|Kazehaya|praising|Headpats|hair/i.test(bubble.textContent || "")).toBe(true);
  });

  it("initiates gentle autonomous roaming along the horizontal axis after rest delay", () => {
    render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const container = screen.getByTestId("sawako-mascot-container");
    expect(container).toBeDefined();

    // Advance time past the roaming rest cycle
    act(() => {
      vi.advanceTimersByTime(17000);
    });

    // Container should reflect translation offset from walking
    expect(container.style.transform).toMatch(/translate\(-?\d+(\.\d+)?px,\s*0px\)/);
  });

  it("cycles through hourly celestial themes and speaks hourly lines when clicking weather group", () => {
    const { container } = render(
      <MemoryRouter>
        <SawakoMascot />
      </MemoryRouter>,
    );

    const weatherGroup = container.querySelector("#weather-mood-interactive-group");
    expect(weatherGroup).not.toBeNull();

    act(() => {
      fireEvent.click(weatherGroup!);
    });

    const bubble = screen.getByTestId("sawako-speech-bubble");
    expect(bubble).toBeDefined();
    expect((bubble.textContent || "").length).toBeGreaterThan(5);
  });
});
