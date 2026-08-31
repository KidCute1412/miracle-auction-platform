import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, renderHook, cleanup } from "@testing-library/react";
import React from "react";
import SawakoSvg from "./SawakoSvg";
import { useSawakoPhysics } from "./hooks/useSawakoPhysics";
import { useSawakoLipSync } from "./hooks/useSawakoLipSync";

describe("SawakoSvg Modular Puppet Rig", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders SVG with accessible label and modular parts", () => {
    const { getByRole, getByTestId } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isSpeaking={false}
      />
    );

    const svgElement = getByRole("img", { name: /Sawako Anime Mascot/i });
    expect(svgElement).toBeDefined();
    expect(getByTestId("sawako-hands-target")).toBeDefined();
    expect(getByTestId("sawako-feet-target")).toBeDefined();
  });

  it("handles independent hand click events and triggers onPokeHand", () => {
    const handlePokeHand = vi.fn();
    const { getByTestId } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0.2, y: 0.1 }}
        isHovered={true}
        isDragging={false}
        isSpeaking={false}
        onPokeHand={handlePokeHand}
      />
    );

    const handBtn = getByTestId("sawako-hands-target");
    fireEvent.click(handBtn);
    expect(handlePokeHand).toHaveBeenCalledTimes(1);
  });

  it("keeps the star clip clickable above the headpat sensing layer", () => {
    const handlePokeStarClip = vi.fn();
    const { getByTestId } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        onPokeStarClip={handlePokeStarClip}
      />
    );

    fireEvent.click(getByTestId("sawako-star-clip-target"));
    expect(handlePokeStarClip).toHaveBeenCalledTimes(1);
  });

  it("handles independent foot click events and triggers onPokeFoot", () => {
    const handlePokeFoot = vi.fn();
    const { getByTestId } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: -0.3, y: 0.2 }}
        isHovered={false}
        isDragging={false}
        isSpeaking={false}
        onPokeFoot={handlePokeFoot}
      />
    );

    const footBtn = getByTestId("sawako-feet-target");
    fireEvent.click(footBtn);
    expect(handlePokeFoot).toHaveBeenCalledTimes(1);
  });

  it("renders dizzy swirl eyes when expression is dizzy", () => {
    const { getByRole } = render(
      <SawakoSvg
        expression="dizzy"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
      />
    );

    const svg = getByRole("img", { name: /Sawako Anime Mascot/i });
    expect(svg.innerHTML).toContain("animate-spin");
  });

  it("renders sleepy closed eyes when expression is sleepy", () => {
    const { getByText } = render(
      <SawakoSvg
        expression="sleepy"
        symbol="zzz"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
      />
    );

    const zzzSymbol = getByText("Zzz..");
    expect(zzzSymbol).toBeDefined();
  });

  it("computes clamped pupil offsets and head tilt via useSawakoPhysics", () => {
    const { result } = renderHook(() =>
      useSawakoPhysics({ x: 0.8, y: -0.6 }, false, false)
    );

    expect(result.current.pupilX).toBe(4);
    expect(result.current.pupilY).toBeCloseTo(-2.1, 1);
    expect(result.current.headRotate).toBeCloseTo(4.8, 1);
    expect(typeof result.current.isBlinking).toBe("boolean");
  });

  it("modulates mouth opening cadence during speech via useSawakoLipSync", () => {
    const { result, rerender } = renderHook(
      ({ isSpeaking }) => useSawakoLipSync(isSpeaking),
      { initialProps: { isSpeaking: false } }
    );

    expect(result.current.mouthOpenRatio).toBe(0);

    // When speaking begins
    rerender({ isSpeaking: true });
    expect(typeof result.current.mouthOpenRatio).toBe("number");
  });

  it("renders luminous fireflies layer around Sawako's muse dress", () => {
    const { container } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isSpeaking={false}
      />
    );

    const firefliesLayer = container.querySelector("#sawako-fireflies-layer");
    expect(firefliesLayer).not.toBeNull();
  });

  it("renders the wandering butterfly decor around Sawako", () => {
    const { container } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
      />
    );

    expect(container.querySelector("#sawako-wandering-butterfly")).not.toBeNull();
  });

  it("renders crescent moon ambient accent during night timeOfDay", () => {
    const { container } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isSpeaking={false}
        timeOfDay="night"
      />
    );

    const moon = container.querySelector("#ambient-crescent-moon");
    expect(moon).not.toBeNull();
  });

  it("maintains positive scaleX (no flipping) and applies distinct directional walk animations", () => {
    const { container: leftContainer } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isWalking={true}
        walkDirection="left"
      />
    );

    const puppetWrapper = leftContainer.firstElementChild as HTMLElement;
    expect(puppetWrapper.style.transform).toContain("scale(0.82, 0.82)");
    expect(leftContainer.innerHTML).toContain("waddleBodyBobLeft");
    expect(leftContainer.innerHTML).toContain("waddleArmSwingBack");

    const { container: rightContainer } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isWalking={true}
        walkDirection="right"
      />
    );

    expect((rightContainer.firstElementChild as HTMLElement).style.transform).toContain("scale(0.82, 0.82)");
    expect(rightContainer.innerHTML).toContain("waddleBodyBobRight");
    expect(rightContainer.innerHTML).toContain("waddleArmSwingForward");
  });

  it("renders sitting pose with matcha teacup and rising steam when isSippingTea is true", () => {
    const { getByTestId, container } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        isSippingTea={true}
      />
    );

    expect(getByTestId("sawako-matcha-teacup")).toBeDefined();
    expect(container.innerHTML).toContain("tea-steam-wisps");
    expect(container.innerHTML).toContain("translate(0px, 115px)");
    expect(container.innerHTML).toContain("chibiBobbing_4.8s");
    expect(container.querySelector("#sawako-w-sitting-legs")).not.toBeNull();
  });

  it("renders specialized 24-hour celestial themes when hour prop is provided", () => {
    // Test hour 3: Shooting Star Comet
    const { container: cometContainer } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        hour={3}
      />
    );
    expect(cometContainer.querySelector("#archetype-comet-group")).not.toBeNull();
    const cometMood = cometContainer.querySelector("[data-archetype='comet']");
    expect(cometMood).not.toBeNull();
    expect(cometMood?.getAttribute("data-hour")).toBe("3");

    // Test hour 12: High Noon Solaris Crown
    const { container: crownContainer } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        hour={12}
      />
    );
    expect(crownContainer.querySelector("#sun-flame-crown")).not.toBeNull();
    expect(crownContainer.querySelector("[data-hour='12']")).not.toBeNull();

    // Test hour 18: Coral Twilight Dusk
    const { container: duskContainer } = render(
      <SawakoSvg
        expression="normal"
        symbol="none"
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isDragging={false}
        hour={18}
      />
    );
    expect(duskContainer.querySelector("#ambient-sunset-orb")).not.toBeNull();
    expect(duskContainer.querySelector("[data-archetype='coral_dusk']")).not.toBeNull();
  });
});
