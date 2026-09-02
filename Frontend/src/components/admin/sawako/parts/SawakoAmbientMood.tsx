import React, { useState } from "react";
import type { SawakoTimeOfDay } from "../types";
import { getHourlyTheme, type HourlyTheme } from "../sawako-hourly-theme";
import { AmbientStyles, HourlyArchetypeSwitch } from "./ambient";

interface SawakoAmbientMoodProps {
  timeOfDay?: SawakoTimeOfDay;
  hour?: number;
  isDragging?: boolean;
  onCycleTimeOfDay?: () => void;
}

/**
 * SawakoAmbientMood - 24-Hour Expressive Funny Cartoon & Chibi Celestial Decor
 * 
 * Features:
 * - Authentic Right-Facing Crescent Moons (00:00, 22:00, 23:00): Sculpted with convex back curving to the right `)`,
 *   wide solid belly, and cute button nose, ensuring all eyes, noses, mouths, and cheeks sit firmly on solid moon surface.
 * - 24 Richly Detailed Cartoon Expressions: Every single hour has distinct, high-contrast eyes, mouths,
 *   eyelashes, blush, and animated features.
 * - Dynamic Animations: Snot bubble breathing, trampoline cloud, crazy eye-rolling nebula, turbo rocket,
 *   hummingbird wings, peek-a-boo sun, electric shock alarm, slime bounce, DJ headbang, hula-hoop halo,
 *   sakura pinwheel, shojo sparkles, hungry nom-nom, mega yawn, onsen cookie bath, leaf slap, gale cheeks,
 *   marshmallow toast, swallow loop-the-loop, wild star swing, mochi slam, stormy lantern, jellyfish pulse,
 *   and sheep hurdle jump.
 * - 100% backward compatible with existing test IDs and selectors.
 */
export function SawakoAmbientMood({
  timeOfDay,
  hour,
  isDragging = false,
  onCycleTimeOfDay,
}: SawakoAmbientMoodProps) {
  const theme: HourlyTheme = getHourlyTheme(hour, timeOfDay);
  const category = theme.category;
  const [isBursting, setIsBursting] = useState(false);

  // Root ID for backward compatibility with existing tests and selectors
  const elementId =
    category === "night"
      ? "ambient-crescent-moon"
      : category === "sunset"
        ? "ambient-sunset-orb"
        : "ambient-day-sun";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 560);
    onCycleTimeOfDay?.();
  };

  return (
    <g
      id="sawako-ambient-mood"
      className="transition-opacity duration-500 ease-in-out"
      style={{ opacity: isDragging ? 0.25 : 1 }}
    >
      <AmbientStyles />

      {/* Interactive Clickable Weather Mood Container */}
      <g
        id="weather-mood-interactive-group"
        className="cursor-pointer pointer-events-auto select-none outline-none"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Time: ${theme.timeLabel} (${theme.name}) - Weather: ${category}. Click to cycle time.`}
        data-hour={theme.hour}
        data-archetype={theme.archetype}
      >
        <g id={elementId} transform="translate(595, 90) scale(1.45)">
          <g
            className={isBursting ? "animate-[cartoonClickPop_0.56s_cubic-bezier(0.34,1.56,0.64,1)]" : "animate-[cartoonIdleFloat_4.2s_ease-in-out_infinite]"}
            style={{ transformOrigin: "0 0" }}
          >
            <defs>
              {/* Vibrant Ambient Halo Gradient */}
              <radialGradient id="vibrantHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.haloColors[0]} stopOpacity={0.8} />
                <stop offset="60%" stopColor={theme.haloColors[1]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={theme.haloColors[2]} stopOpacity={0} />
              </radialGradient>

              {/* Bold Core Body Gradient */}
              <linearGradient id="boldCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.coreColors[0]} />
                <stop offset="100%" stopColor={theme.coreColors[1]} />
              </linearGradient>

              {/* Glowing Solid Comet Tail Gradient */}
              <linearGradient id="cometTailSolidGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#C084FC" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
              </linearGradient>

              {/* High-Contrast Chibi Drop Shadow Filter */}
              <filter id="chibiDropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={theme.strokeColor} floodOpacity="0.55" />
              </filter>
            </defs>

            {/* ===================== LAYER 1: ENLARGED AMBIENT HALO (r=72px) ===================== */}
            <circle cx="0" cy="0" r="72" fill="url(#vibrantHalo)" />

            {/* ===================== LAYER 2: INTERACTIVE POP FIREWORKS ===================== */}
            {isBursting && (
              <g id="click-burst-effects" pointerEvents="none">
                <circle cx="0" cy="0" fill="none" stroke={theme.accentColor} className="animate-[shockwaveRingExp_0.52s_ease-out_forwards]" />
                {/* 12 Radiating Fireworks Stars */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const fx = Math.round(Math.cos(rad) * 54);
                  const fy = Math.round(Math.sin(rad) * 54);
                  return (
                    <circle
                      key={deg}
                      cx="0"
                      cy="0"
                      r="4"
                      fill={deg % 60 === 0 ? "#FEF08A" : theme.accentColor}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      style={{
                        animation: "sparkleFireworkFly 0.52s ease-out forwards",
                        ["--tw-fx" as string]: `${fx}px`,
                        ["--tw-fy" as string]: `${fy}px`,
                      }}
                    />
                  );
                })}
              </g>
            )}

            {/* ===================== LAYER 3: 24 HILARIOUS CARTOON CHIBI ARCHETYPES ===================== */}
            <HourlyArchetypeSwitch archetype={theme.archetype} theme={theme} />

          </g>
        </g>
      </g>
    </g>
  );
}
