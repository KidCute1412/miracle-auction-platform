import React, { useState } from "react";
import type { SawakoTimeOfDay } from "../types";
import { getHourlyTheme, type HourlyTheme } from "../sawako-hourly-theme";

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
      <style>{`
        /* ===================== CARTOON SQUASH-AND-STRETCH & CLICK BURST ===================== */
        @keyframes cartoonIdleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes cartoonClickPop {
          0% { transform: scale(1, 1); }
          25% { transform: scale(1.3, 0.72) translateY(8px); }
          50% { transform: scale(0.8, 1.32) translateY(-14px) rotate(-6deg); }
          75% { transform: scale(1.12, 0.92) translateY(2px) rotate(3deg); }
          100% { transform: scale(1, 1) translateY(0) rotate(0deg); }
        }
        @keyframes shockwaveRingExp {
          0% { r: 12px; opacity: 1; stroke-width: 5px; }
          100% { r: 88px; opacity: 0; stroke-width: 1px; }
        }
        @keyframes sparkleFireworkFly {
          0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
          100% { transform: translate(var(--tw-fx, 40px), var(--tw-fy, -40px)) scale(0); opacity: 0; }
        }

        /* 00:00 - Sleeping Full Moon with Nightcap & Cloud Pillow */
        @keyframes nightcapBellSway {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes zzzCleanFloat {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          35% { opacity: 0.9; }
          100% { transform: translate(16px, -32px) scale(1.3) rotate(12deg); opacity: 0; }
        }
        @keyframes moonSleepBreathing {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }

        /* 01:00 - Cloud Nest Slumber Moon Floating */
        @keyframes cloudNestFloat {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes cloudPillowBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 0.98); }
        }
        @keyframes zzzPopFly {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(18px, -32px) scale(1.3) rotate(12deg); opacity: 0; }
        }

        /* 02:00 - Chibi Saturn Planet with Floating Ring */
        @keyframes saturnChibiFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes saturnEyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes saturnRingShimmer {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }

        /* 03:00 - Magical Shooting Star & Rainbow Stardust Tail */
        @keyframes cometSoar {
          0%, 100% { transform: translate(0, 0) rotate(-16deg); }
          50% { transform: translate(6px, -8px) rotate(-12deg); }
        }
        @keyframes cometTailWave {
          0%, 100% { transform: scaleX(1) scaleY(1); opacity: 0.85; }
          50% { transform: scaleX(1.15) scaleY(0.92); opacity: 1; }
        }

        /* 04:00 - Hummingbird Angel Star Flap */
        @keyframes hummingbirdWingFlapL {
          0%, 100% { transform: rotate(-30deg) scaleX(0.7); }
          50% { transform: rotate(40deg) scaleX(1.2); }
        }
        @keyframes hummingbirdWingFlapR {
          0%, 100% { transform: rotate(30deg) scaleX(0.7); }
          50% { transform: rotate(-40deg) scaleX(1.2); }
        }
        @keyframes hoverJitterBody {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          75% { transform: translateY(3px) rotate(-1deg); }
        }

        /* 05:00 - Peek-a-Boo Dawn */
        @keyframes peekABooHop {
          0%, 35% { transform: translateY(22px) scale(0.95); }
          45% { transform: translateY(-16px) scale(1.1, 0.95) rotate(-5deg); }
          65% { transform: translateY(-12px) scale(1) rotate(5deg); }
          80%, 100% { transform: translateY(22px) scale(0.95); }
        }

        /* 06:00 - Gentle Morning Sun Stretching & Yawn */
        @keyframes sunStretchWake {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(-6px) scale(1.05, 1.08); }
          60% { transform: translateY(-4px) scale(1.03, 1.05); }
        }
        @keyframes sunRayGentleRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes stretchArmsReach {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%, 60% { transform: translateY(-4px) rotate(-6deg) scale(1.1); }
        }

        /* 07:00 - Bouncy Slime Dewdrop Squash & Stretch */
        @keyframes slimeSquashBounce {
          0%, 100% { transform: translateY(18px) scale(1.35, 0.65); }
          20% { transform: translateY(-18px) scale(0.78, 1.3); }
          45% { transform: translateY(-26px) scale(1.05, 0.96) rotate(6deg); }
          65% { transform: translateY(-8px) scale(0.9, 1.15); }
          85% { transform: translateY(16px) scale(1.2, 0.8); }
        }

        /* 08:00 - Cool DJ Sunglasses Headbang */
        @keyframes headbangDJ {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(8px) rotate(-6deg) scale(1.08, 0.92); }
          50% { transform: translateY(-10px) rotate(6deg) scale(0.95, 1.08); }
          75% { transform: translateY(6px) rotate(-4deg) scale(1.05, 0.95); }
        }

        /* 09:00 - Halo Hula Hoop Spin */
        @keyframes hulaHoopHalo {
          0% { transform: rotate(-12deg) scaleX(1) translateX(-6px); }
          25% { transform: rotate(0deg) scaleX(0.8) translateY(-4px); }
          50% { transform: rotate(12deg) scaleX(1) translateX(6px); }
          75% { transform: rotate(0deg) scaleX(0.8) translateY(4px); }
          100% { transform: rotate(-12deg) scaleX(1) translateX(-6px); }
        }
        @keyframes hipWiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        /* 10:00 - Gentle Sakura Crown & Drifting Petals */
        @keyframes sakuraSunSway {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes sakuraPetalDrift1 {
          0% { transform: translate(-34px, -20px) rotate(0deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translate(-14px, 36px) rotate(120deg); opacity: 0; }
        }
        @keyframes sakuraPetalDrift2 {
          0% { transform: translate(32px, -18px) rotate(0deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translate(14px, 40px) rotate(-110deg); opacity: 0; }
        }

        /* 11:00 - Boba Milk Tea Sun Sips */
        @keyframes bobaSipJoy {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes bobaPearlRise {
          0% { transform: translate(3px, 12px) scale(0.8); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(-5px, -6px) scale(1); opacity: 0; }
        }
        @keyframes sunRaySlowTurn {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 12:00 - Royal Sun King Crown Gleam & Float */
        @keyframes royalCrownFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes crownGleam {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
        @keyframes royalRaysRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 13:00 - Siesta Sun Sleeping Tucked in Cloud Blanket */
        @keyframes siestaNapBreathing {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes snotBubblePulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.9; }
        }
        @keyframes cloudBlanketSway {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(2px); }
        }

        /* 14:00 - Dunking Onsen Cookie Bath & Heart Steam */
        @keyframes onsenBathBob {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(12px) scale(1.08, 0.9); }
          75% { transform: translateY(-5px) scale(0.95, 1.05); }
        }
        @keyframes bigHeartSteamFly {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translate(-8px, -42px) scale(1.5) rotate(-15deg); opacity: 0; }
        }

        /* 15:00 - Maple Leaf Parasol & Autumn Breeze */
        @keyframes sunAutumnSway {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes leafParasolWave {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes autumnLeafDrift1 {
          0% { transform: translate(-30px, -20px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translate(32px, 30px) rotate(140deg); opacity: 0; }
        }
        @keyframes autumnLeafDrift2 {
          0% { transform: translate(-20px, 20px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translate(40px, -15px) rotate(-120deg); opacity: 0; }
        }

        /* 16:00 - Gentle Afternoon Breeze & Chubby Cheeks Sway */
        @keyframes gentleBreezeSway {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2.5deg); }
        }
        @keyframes gentleCheekBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.04, 0.98); }
        }
        @keyframes windRibbonGentle {
          0%, 100% { transform: translateX(0px) scaleY(1); opacity: 0.6; }
          50% { transform: translateX(8px) scaleY(1.1); opacity: 0.95; }
        }
        @keyframes sproutLeafSway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
        }

        /* 17:00 - Sunset Horizon Sun Dip & Waving Hand */
        @keyframes sunsetDipSway {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(3px) rotate(1deg); }
        }
        @keyframes sunsetCloudDrift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes sunsetWaveHand {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(18deg); }
        }

        /* 18:00 - First Evening Star & Twilight Glow */
        @keyframes duskGlowFloat {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes firstStarGlowFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3.5px) scale(1.08); }
        }

        /* 19:00 - Golden Crescent Moon Rocking in Evening Sky */
        @keyframes crescentRocking {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(4deg) translateY(-3px); }
        }
        @keyframes crescentStarGlow {
          0%, 100% { transform: translateY(0px) rotate(-5deg) scale(1); }
          50% { transform: translateY(-4px) rotate(8deg) scale(1.08); }
        }

        /* 20:00 - Mochi Smash & Giant Stretch */
        @keyframes malletSmashLoop {
          0%, 100% { transform: rotate(-10deg) translateY(0); }
          30% { transform: rotate(-55deg) translateY(-8px); }
          50% { transform: rotate(15deg) translateY(6px); }
          75% { transform: rotate(-5deg) translateY(-2px); }
        }
        @keyframes mochiGooeyStretch {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.35, 0.65); }
          70% { transform: scale(0.8, 1.4) translateY(-10px); }
        }

        /* 21:00 - Cozy Warm Tea Moon & Steam Heart Rise */
        @keyframes cozyTeaMoonFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes steamHeartRise {
          0% { transform: translateY(2px) scale(0.85); opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-6px) scale(1.15); opacity: 0.15; }
        }

        /* 22:00 - Jellyfish Jet Propulsion */
        @keyframes jellyfishJetPulse {
          0%, 100% { transform: translateY(10px) scale(1.2, 0.8); }
          35% { transform: translateY(-16px) scale(0.8, 1.3); }
          70% { transform: translateY(-4px) scale(1.05, 0.95); }
        }
        @keyframes tentacleLagWave {
          0%, 100% { transform: rotate(-12deg) scaleY(0.9); }
          50% { transform: rotate(16deg) scaleY(1.2); }
        }

        /* 23:00 - Dream Fisher Moon Animations */
        @keyframes fishingRodBob {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes starFishFlop {
          0%, 100% { transform: rotate(-14deg) translateY(0); }
          30% { transform: rotate(18deg) translateY(-4px) scaleX(1.1); }
          60% { transform: rotate(-8deg) translateY(2px) scaleY(1.1); }
          85% { transform: rotate(12deg) translateY(-2px); }
        }
        @keyframes fishBobberFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes ripplePulseCosmic {
          0% { rx: 4px; ry: 2px; opacity: 0.9; }
          100% { rx: 22px; ry: 8px; opacity: 0; }
        }
      `}</style>

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
        <g id={elementId} transform="translate(605, 126) scale(1.2)">
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

            {/* 00:00 - SLEEPING FULL MOON WITH NIGHTCAP & CLOUD PILLOW */}
            {theme.archetype === "midnight_moon" && (
              <g id="archetype-crescent-group" className="animate-[moonSleepBreathing_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Full Moon Orb Body */}
                <circle cx="0" cy="4" r="33" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-8" r="5" fill="#C7D2FE" opacity={0.5} />
                <circle cx="18" cy="-6" r="4.5" fill="#C7D2FE" opacity={0.45} />

                {/* Peaceful Sleeping Eyes ( ◡ ‿ ◡ ) */}
                <path d="M -13 0 Q -8 -4 -3 0" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 3 0 Q 8 -4 13 0" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Eyelashes */}
                <line x1="-11" y1="-2" x2="-13" y2="-5" stroke={theme.strokeColor} strokeWidth={1.2} strokeLinecap="round" />
                <line x1="11" y1="-2" x2="13" y2="-5" stroke={theme.strokeColor} strokeWidth={1.2} strokeLinecap="round" />

                {/* Rosy Sleeping Cheeks with White Chibi Highlights */}
                <ellipse cx="-16" cy="8" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="6.5" x2="-19" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="6.5" x2="-16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="8" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="6.5" x2="13" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="6.5" x2="16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Contented Sleeping Smile */}
                <path d="M -3 9 Q 0 12 3 9" stroke={theme.strokeColor} strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Soft Fluffy Cloud Pillow Hugged Across Tummy */}
                <g transform="translate(0, 16)">
                  <path
                    d="
                      M -22 6
                      C -28 0, -18 -6, -8 -2
                      C -2 -8, 12 -8, 16 -2
                      C 26 -6, 32 2, 26 10
                      C 22 16, -6 18, -18 12
                      C -24 10, -24 8, -22 6
                      Z
                    "
                    fill="#FFFFFF"
                    stroke={theme.strokeColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 2px 4px rgba(99, 102, 241, 0.25))"
                  />
                </g>

                {/* Adorable Striped Nightcap Perched on Top of Head */}
                <g transform="translate(0, -24)">
                  {/* Cone of the Nightcap Drooping Down to Right */}
                  <path
                    d="
                      M -20 0
                      C -18 -18, -6 -24, 6 -20
                      C 18 -16, 28 -8, 28 6
                      C 22 2, -2 -2, -20 0
                      Z
                    "
                    fill="#4F46E5"
                    stroke={theme.strokeColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {/* Purple Accent Stripe */}
                  <path
                    d="
                      M -10 -12
                      C -2 -17, 8 -15, 14 -11
                      L 18 -4
                      C 10 -9, -2 -10, -8 -6
                      Z
                    "
                    fill="#818CF8"
                    opacity={0.9}
                  />

                  {/* Soft White Cloud-like Fur Brim */}
                  <rect x="-24" y="-2" width="46" height="9" rx="4.5" fill="#FFFFFF" stroke={theme.strokeColor} strokeWidth={1.8} />

                  {/* Little Star Pom-pom Dangling at the Tip of Nightcap */}
                  <g transform="translate(28, 8)">
                    <g className="animate-[nightcapBellSway_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                      <polygon
                        points="0,0 2,4 6,4 3,7 4,11 0,8.5 -4,11 -3,7 -6,4 -2,4"
                        fill="#FDE047"
                        stroke="#CA8A04"
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                </g>

                {/* Dreamy Floating Cartoon Zzz from the Moon */}
                <text x="-4" y="-12" fill={theme.strokeColor} fontSize="15" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="6" y="-22" fill="#818CF8" fontSize="11" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
            )}

            {/* 01:00 - CLOUD NEST SLUMBER MOON FLOATING SERENELY */}
            {theme.archetype === "cloud_moon" && (
              <g id="archetype-cloud-moon-group" className="animate-[cloudNestFloat_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Back Cloud Puff */}
                <path
                  d="M -36 10 C -48 -6, -26 -16, -10 -10 C 2 -20, 26 -16, 32 -4 C 44 4, 42 22, 28 26 Z"
                  fill="#EDE9FE"
                  opacity={0.7}
                />

                {/* Round Moon Orb Nestled in Cloud */}
                <circle cx="0" cy="-4" r="32" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-14" r="5" fill="#DDD6FE" opacity={0.6} />
                <circle cx="18" cy="-12" r="4.5" fill="#DDD6FE" opacity={0.5} />

                {/* Happy Sleeping Eyes (^ ‿ ^) */}
                <path d="M -13 -8 Q -8 -13 -3 -8" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 3 -8 Q 8 -13 13 -8" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights */}
                <ellipse cx="-16" cy="0" rx="4.5" ry="3.2" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="-1.5" x2="-19" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="-14.5" y1="-1.5" x2="-16" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                <ellipse cx="16" cy="0" rx="4.5" ry="3.2" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="-1.5" x2="13" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="17.5" y1="-1.5" x2="16" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M -3 3 Q 0 7 3 3" stroke={theme.strokeColor} strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Front Fluffy Cloud Nest Snuggling the Moon */}
                <g className="animate-[cloudPillowBreathe_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 24px" }}>
                  <path
                    d="
                      M -48 24
                      C -54 14, -38 6, -26 12
                      C -16 2, 2 4, 12 10
                      C 24 2, 44 8, 46 20
                      C 52 28, 40 40, 24 40
                      C 10 42, -18 42, -34 38
                      C -46 36, -52 30, -48 24
                      Z
                    "
                    fill="#FFFFFF"
                    stroke={theme.strokeColor}
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 4px 6px rgba(124, 58, 237, 0.2))"
                  />
                  {/* Soft Pastel Cloud Cheeks & Sleeping Cloud Smile */}
                  <ellipse cx="-24" cy="24" rx="4" ry="2.6" fill="#DDD6FE" opacity={0.7} />
                  <ellipse cx="24" cy="24" rx="4" ry="2.6" fill="#DDD6FE" opacity={0.7} />
                  <path d="M -4 26 Q 0 30 4 26" stroke={theme.strokeColor} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-26,-24 -24.5,-21 -21.5,-21 -24,-19.5 -23,-16.5 -26,-18.5 -29,-16.5 -28,-19.5 -30.5,-21 -27.5,-21"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />

                {/* Dreamy Floating Cartoon Zzz */}
                <text x="18" y="-22" fill={theme.strokeColor} fontSize="16" fontWeight="900" className="animate-[zzzPopFly_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="28" y="-34" fill="#A855F7" fontSize="11" fontWeight="900" className="animate-[zzzPopFly_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
            )}

            {/* 02:00 - CHIBI SATURN PLANET WITH GLOWING RING */}
            {theme.archetype === "nebula" && (
              <g id="archetype-nebula-group" className="animate-[saturnChibiFloat_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Slanted Saturn Ring - Back Half (Curves behind planet) */}
                <g transform="rotate(-22)">
                  <path
                    d="M -56 0 A 56 16 0 0 1 56 0"
                    stroke="#E879F9"
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                    className="animate-[saturnRingShimmer_2.4s_ease-in-out_infinite]"
                  />
                  <path
                    d="M -52 0 A 52 14 0 0 1 52 0"
                    stroke="#FEF08A"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Chibi Planet Core Body */}
                <circle
                  cx="0"
                  cy="0"
                  r="32"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Slanted Saturn Ring - Front Half (Curves gracefully in front of planet's lower belly) */}
                <g transform="rotate(-22)">
                  <path
                    d="M -56 0 A 56 16 0 0 0 56 0"
                    stroke="#E879F9"
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                    className="animate-[saturnRingShimmer_2.4s_ease-in-out_infinite]"
                  />
                  <path
                    d="M -52 0 A 52 14 0 0 0 52 0"
                    stroke="#FEF08A"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Little Golden Star Hairpin on Head */}
                <polygon
                  points="18,-28 19.5,-25 23,-25 20,-23 21.5,-20 18,-22 14.5,-20 16,-23 13,-25 16.5,-25"
                  fill="#FEF08A"
                  stroke="#F59E0B"
                  strokeWidth={1}
                />

                {/* Big Kawaii Starry Anime Eyes (with gentle blink) */}
                <g className="animate-[saturnEyeBlink_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 -4px" }}>
                  {/* Left Eye */}
                  <circle cx="-11" cy="-4" r="5" fill="#1E1B4B" />
                  <circle cx="-12.5" cy="-6" r="2" fill="#FFFFFF" />
                  <circle cx="-9.5" cy="-2.5" r="1" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <circle cx="11" cy="-4" r="5" fill="#1E1B4B" />
                  <circle cx="9.5" cy="-6" r="2" fill="#FFFFFF" />
                  <circle cx="12.5" cy="-2.5" r="1" fill="#FFFFFF" />
                </g>

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="5" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="3.5" x2="-21" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="3.5" x2="-18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="5" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="3.5" x2="15" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="3.5" x2="18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Cute Open Happy Smile showing tongue */}
                <path d="M -4 7 Q 0 13 4 7 Z" fill="#F43F5E" stroke="#312E81" strokeWidth={1.8} strokeLinejoin="round" />
              </g>
            )}

            {/* 03:00 - MARIO/KIRBY STYLE 5-POINT CHIBI STAR & GLOWING SOLID COMET WAKE */}
            {theme.archetype === "comet" && (
              <g id="archetype-comet-group" className="animate-[cometSoar_2.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Glowing Solid Sweeping Comet Tail */}
                <g className="animate-[cometTailWave_2.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  {/* Outer Rainbow Gradient Tail Body */}
                  <path
                    d="
                      M 6 -16
                      C -28 -34, -64 -42, -102 -38
                      C -82 -14, -86 10, -102 34
                      C -64 38, -28 30, 6 16
                      Z
                    "
                    fill="url(#cometTailSolidGrad)"
                  />
                  {/* Inner Golden Core Flame */}
                  <path
                    d="
                      M 8 -8
                      C -20 -18, -48 -20, -78 -16
                      C -60 0, -60 4, -78 16
                      C -48 20, -20 18, 8 8
                      Z
                    "
                    fill="#FEF08A"
                    opacity={0.65}
                  />

                  {/* Twinkling Mini Sparkles Floating in Wake */}
                  <polygon points="-46,-20 -44.5,-17 -41,-17 -44,-15 -43,-12 -46,-14 -49,-12 -48,-15 -51,-17 -47.5,-17" fill="#FEF08A" />
                  <circle cx="-76" cy="-4" r="2.5" fill="#FFFFFF" />
                  <polygon points="-58,16 -56.5,19 -53,19 -56,21 -55,24 -58,22 -61,24 -60,21 -63,19 -59.5,19" fill="#FEF08A" />
                </g>

                {/* Plump 5-Pointed Mario/Kirby Star Body */}
                <polygon
                  points="10,-32 17,-12 38,-10 21,4 27,24 10,13 -7,24 -1,4 -18,-10 3,-12"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  strokeLinejoin="round"
                  filter="url(#chibiDropShadow)"
                />

                {/* Wind Speed Gleam on Star Head */}
                <path d="M 22 -22 Q 28 -24 34 -18" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.85} />

                {/* Iconic Oval Eyes (Signature Mario / Kirby Star Face) */}
                {/* Left Oval Eye */}
                <ellipse cx="6" cy="-2" rx="3.2" ry="6.5" fill="#1E1B4B" />
                <circle cx="5.2" cy="-5" r="1.6" fill="#FFFFFF" />
                <circle cx="6.5" cy="1.5" r="0.9" fill="#FFFFFF" />

                {/* Right Oval Eye */}
                <ellipse cx="16" cy="-2" rx="3.2" ry="6.5" fill="#1E1B4B" />
                <circle cx="15.2" cy="-5" r="1.6" fill="#FFFFFF" />
                <circle cx="16.5" cy="1.5" r="0.9" fill="#FFFFFF" />

                {/* Cute Rosy Blushing Cheeks with Highlights (//) */}
                <ellipse cx="0" cy="5" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-1.5" y1="3.5" x2="-3" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="1.5" y1="3.5" x2="0" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="22" cy="5" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="20.5" y1="3.5" x2="19" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="23.5" y1="3.5" x2="22" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Cheerful Open Smile (^▽^) */}
                <path d="M 8 4 Q 11 9 14 4 Z" fill="#F43F5E" stroke="#1E1B4B" strokeWidth={1.4} strokeLinejoin="round" />
              </g>
            )}

            {/* 04:00 - RAPID HUMMINGBIRD FLAPPING ANGEL STAR */}
            {theme.archetype === "venus" && (
              <g id="archetype-venus-group" className="animate-[hoverJitterBody_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Left Hummingbird Angel Wing */}
                <g className="animate-[hummingbirdWingFlapL_0.32s_ease-in-out_infinite]" style={{ transformOrigin: "-14px 0px" }}>
                  <path d="M -14 -8 C -42 -28, -58 -6, -50 20 C -40 16, -30 6, -14 8 Z" fill="#D1FAE5" stroke="#059669" strokeWidth={2.4} />
                </g>
                {/* Right Hummingbird Angel Wing */}
                <g className="animate-[hummingbirdWingFlapR_0.32s_ease-in-out_infinite]" style={{ transformOrigin: "14px 0px" }}>
                  <path d="M 14 -8 C 42 -28, 58 -6, 50 20 C 40 16, 30 6, 14 8 Z" fill="#D1FAE5" stroke="#059669" strokeWidth={2.4} />
                </g>

                {/* 8-Pointed Venus Star */}
                <polygon
                  points="0,-48 8,-12 48,0 8,12 0,48 -8,12 -48,0 -8,-12"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />
                {/* Big Sparkling Anime Eyes with Eyelashes */}
                <ellipse cx="-8" cy="-2" rx="4" ry="5.5" fill="#065F46" />
                <ellipse cx="8" cy="-2" rx="4" ry="5.5" fill="#065F46" />
                <circle cx="-9" cy="-4" r="1.8" fill="#FFFFFF" />
                <circle cx="7" cy="-4" r="1.8" fill="#FFFFFF" />
                <circle cx="-7" cy="0" r="1" fill="#FFFFFF" />
                <circle cx="9" cy="0" r="1" fill="#FFFFFF" />
                <path d="M -12 -7 L -6 -6" stroke="#065F46" strokeWidth={1.6} strokeLinecap="round" />
                <path d="M 12 -7 L 6 -6" stroke="#065F46" strokeWidth={1.6} strokeLinecap="round" />

                {/* Sweet Open Smile */}
                <path d="M -4 6 Q 0 12 4 6 Z" fill="#EF4444" stroke="#065F46" strokeWidth={1.5} />
                <circle cx="-14" cy="4" r="4" fill="#34D399" opacity={0.75} />
                <circle cx="14" cy="4" r="4" fill="#34D399" opacity={0.75} />
              </g>
            )}

            {/* 05:00 - PEEK-A-BOO "Ú ÒA!" DAWN SUN BEHIND MOUNTAINS */}
            {theme.archetype === "dawn_horizon" && (
              <g id="archetype-dawn-group">
                {/* Mountain Range */}
                <path d="M -60 26 L -28 -6 L 12 24 L 54 10 L 60 46 L -60 46 Z" fill="#6366F1" stroke="#312E81" strokeWidth={2.4} opacity={0.8} />

                {/* Peek-a-Boo Sun Jumping Up & Down */}
                <g className="animate-[peekABooHop_3.2s_ease-in-out_infinite]">
                  <circle cx="0" cy="4" r="32" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                  {/* Two Cute Hands Popping Up Saying "Peek-a-Boo!" */}
                  <circle cx="-20" cy="-14" r="6.5" fill="#FDBA74" stroke="#EA580C" strokeWidth={2} />
                  <circle cx="20" cy="-14" r="6.5" fill="#FDBA74" stroke="#EA580C" strokeWidth={2} />

                  {/* Big Goofy Smiling Face */}
                  <circle cx="-10" cy="-2" r="4" fill="#7C2D12" />
                  <circle cx="10" cy="-2" r="4" fill="#7C2D12" />
                  <circle cx="-11" cy="-4" r="1.5" fill="#FFFFFF" />
                  <circle cx="9" cy="-4" r="1.5" fill="#FFFFFF" />
                  <path d="M -7 7 Q 0 16 7 7 Z" fill="#EF4444" stroke="#7C2D12" strokeWidth={1.8} />
                  <circle cx="-16" cy="6" r="4.5" fill="#F472B6" opacity={0.8} />
                  <circle cx="16" cy="6" r="4.5" fill="#F472B6" opacity={0.8} />
                </g>

                {/* Horizon Line */}
                <line x1="-62" y1="26" x2="62" y2="26" stroke="#FB923C" strokeWidth={3.5} strokeLinecap="round" />
              </g>
            )}

            {/* 06:00 - GENTLE MORNING SUN STRETCHING & SLEEPY YAWN */}
            {theme.archetype === "sunrise" && (
              <g id="archetype-sunrise-group" className="animate-[sunStretchWake_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Soft Rounded Petal Sun Rays Gently Rotating */}
                <g className="animate-[sunRayGentleRotate_24s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <ellipse
                      key={angle}
                      cx="0"
                      cy="-44"
                      rx="5"
                      ry="8"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.6}
                      transform={`rotate(${angle})`}
                    />
                  ))}
                </g>

                {/* Two Chubby Little Arms Stretching Up to Greet the Day */}
                <g className="animate-[stretchArmsReach_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  {/* Left Arm & Fist */}
                  <path d="M -22 0 Q -32 -14 -24 -24" stroke={theme.strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                  <circle cx="-24" cy="-24" r="5" fill="#FED7AA" stroke={theme.strokeColor} strokeWidth={1.8} />

                  {/* Right Arm & Fist */}
                  <path d="M 22 0 Q 32 -14 24 -24" stroke={theme.strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                  <circle cx="24" cy="-24" r="5" fill="#FED7AA" stroke={theme.strokeColor} strokeWidth={1.8} />
                </g>

                {/* Plump Golden Sun Body */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Sleepy Curved Eyes (^ ^) */}
                <path d="M -15 -4 Q -9 -11 -3 -4" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M 3 -4 Q 9 -11 15 -4" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="4" rx="5.5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="2.5" x2="-21" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="2.5" x2="-18" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="4" rx="5.5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="2.5" x2="15" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="2.5" x2="18" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Cute Morning Yawn / Smile Mouth */}
                <ellipse cx="0" cy="7" rx="5" ry="6.5" fill="#F43F5E" stroke="#7C2D12" strokeWidth={1.8} />
                <path d="M -3.5 9 Q 0 6.5 3.5 9" fill="#FDA4AF" />

                {/* Tiny Fresh Morning Sparkle */}
                <polygon
                  points="0,-24 1.5,-21 4.5,-21 2,-19.5 3,-16.5 0,-18.5 -3,-16.5 -2,-19.5 -4.5,-21 -1.5,-21"
                  fill="#FFFFFF"
                  opacity={0.9}
                />
              </g>
            )}

            {/* 07:00 - BOUNCY SLIME DEWDROP SQUASH & STRETCH */}
            {theme.archetype === "morning_dew" && (
              <g id="archetype-dew-group">
                {/* Sun Core in Background with Affectionate Smile */}
                <circle cx="0" cy="-6" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                <path d="M -10 -12 Q -6 -16 -2 -12" stroke="#0284C7" strokeWidth={2} fill="none" strokeLinecap="round" />
                <path d="M 2 -12 Q 6 -16 10 -12" stroke="#0284C7" strokeWidth={2} fill="none" strokeLinecap="round" />
                <path d="M -3 -4 Q 0 -1 3 -4" stroke="#0284C7" strokeWidth={1.8} fill="none" />

                {/* Big Leaf Platform */}
                <path d="M -24 22 Q 10 44 48 24 Q 30 10 10 18 Z" fill="#10B981" stroke="#047857" strokeWidth={2.4} />

                {/* Bouncy Slime Water Droplet Jumping Like Crazy */}
                <g className="animate-[slimeSquashBounce_1.8s_ease-in-out_infinite]" style={{ transformOrigin: "16px 20px" }}>
                  <path
                    d="M 16 0 C 16 0, 32 16, 32 28 C 32 38, 24 44, 16 44 C 8 44, 0 38, 0 28 C 0 16, 16 0, 16 0 Z"
                    fill="#38BDF8"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    filter="drop-shadow(0 4px 8px rgba(56, 189, 248, 0.6))"
                  />
                  {/* Slime Giant Kawaii Eyes */}
                  <ellipse cx="11" cy="26" rx="3.5" ry="4.5" fill="#0C4A6E" />
                  <ellipse cx="21" cy="26" rx="3.5" ry="4.5" fill="#0C4A6E" />
                  <circle cx="10" cy="24" r="1.5" fill="#FFFFFF" />
                  <circle cx="20" cy="24" r="1.5" fill="#FFFFFF" />
                  <path d="M 13 32 Q 16 36 19 32" stroke="#0C4A6E" strokeWidth={1.8} fill="none" strokeLinecap="round" />
                  <circle cx="10" cy="18" r="3" fill="#FFFFFF" opacity={0.8} />
                </g>
              </g>
            )}

            {/* 08:00 - COOL SUNGLASSES DJ SUN HEADBANGING */}
            {theme.archetype === "joyful_sun" && (
              <g id="archetype-joyful-group" className="animate-[headbangDJ_1.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Sunrays */}
                <g className="animate-[sunSpinSlowHighDef_14s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <polygon key={angle} points="-5,-42 0,-56 5,-42" fill="#FDE047" stroke="#D97706" strokeWidth={1.6} transform={`rotate(${angle})`} />
                  ))}
                </g>

                {/* Sun Core */}
                <circle cx="0" cy="0" r="36" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Cool Black Star Sunglasses */}
                <g transform="translate(0, -6)">
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#18181B" strokeWidth={3} />
                  <polygon points="-16,-10 -11,-2 -2,-2 -9,4 -6,12 -16,6 -26,12 -23,4 -30,-2 -21,-2" fill="#18181B" stroke="#FACC15" strokeWidth={1.5} />
                  <polygon points="16,-10 21,-2 30,-2 23,4 26,12 16,6 6,12 9,4 2,-2 11,-2" fill="#18181B" stroke="#FACC15" strokeWidth={1.5} />
                  <line x1="-22" y1="-4" x2="-14" y2="4" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.8} />
                  <line x1="10" y1="-4" x2="18" y2="4" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.8} />
                </g>

                {/* Wide Tooth Grin with Sparkle on Tooth */}
                <path d="M -10 10 Q 0 20 12 10 Z" fill="#FFFFFF" stroke="#78350F" strokeWidth={2.2} />
                {/* Tooth Sparkle */}
                <polygon points="-8,10 -6,12 -8,14 -10,12" fill="#FACC15" />
                <circle cx="-18" cy="8" r="4.5" fill="#F472B6" opacity={0.75} />
                <circle cx="20" cy="8" r="4.5" fill="#F472B6" opacity={0.75} />
              </g>
            )}

            {/* 09:00 - ANGEL SUN SPINNING HALO AS HULA HOOP */}
            {theme.archetype === "halo_sun" && (
              <g id="archetype-halo-group">
                {/* Sun Core Wiggling Hips */}
                <g className="animate-[hipWiggle_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 10px" }}>
                  <circle cx="0" cy="0" r="36" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                  {/* Winking & Kissy Face (˘ ³˘)♥ */}
                  <path d="M -14 -2 L -6 2 L -14 6" stroke="#854D0E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                  <circle cx="10" cy="0" r="4" fill="#854D0E" />
                  <circle cx="11" cy="-2" r="1.5" fill="#FFFFFF" />
                  {/* Puckered Lips */}
                  <path d="M -2 10 Q 4 8 0 12 Q 4 16 -2 14" stroke="#854D0E" strokeWidth={2.2} fill="#EF4444" strokeLinecap="round" />
                  <circle cx="-18" cy="6" r="4.5" fill="#F472B6" opacity={0.7} />
                  <circle cx="18" cy="6" r="4.5" fill="#F472B6" opacity={0.7} />
                </g>

                {/* Giant Golden Halo Spinning Around Body like Hula Hoop */}
                <g className="animate-[hulaHoopHalo_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <ellipse cx="0" cy="4" rx="44" ry="14" fill="none" stroke="#FACC15" strokeWidth={4.5} filter="drop-shadow(0 0 10px rgba(250, 204, 21, 0.95))" />
                  <ellipse cx="0" cy="4" rx="44" ry="14" fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
                </g>
              </g>
            )}

            {/* 10:00 - SAKURA FLOWER CROWN CHIBI SUN WITH DRIFTING PETALS */}
            {theme.archetype === "sakura_sun" && (
              <g id="archetype-sakura-group" className="animate-[sakuraSunSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Floating Soft Sakura Petals Drifting in the Gentle Spring Breeze */}
                <path
                  d="M 0 0 C -4 -6, -5 -11, -2 -12 C 0 -13, 0 -12, 0 -11 C 0 -12, 0 -13, 2 -12 C 5 -11, 4 -6, 0 0 Z"
                  fill="#FBCFE8"
                  stroke="#EC4899"
                  strokeWidth={1.2}
                  className="animate-[sakuraPetalDrift1_3.8s_linear_infinite]"
                />
                <path
                  d="M 0 0 C -4 -6, -5 -11, -2 -12 C 0 -13, 0 -12, 0 -11 C 0 -12, 0 -13, 2 -12 C 5 -11, 4 -6, 0 0 Z"
                  fill="#F472B6"
                  stroke="#DB2777"
                  strokeWidth={1.2}
                  className="animate-[sakuraPetalDrift2_4.2s_linear_infinite]"
                />

                {/* Plump Peach-Pink Chibi Sun Body */}
                <circle
                  cx="0"
                  cy="4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Gorgeous Blooming Sakura Flower Crown on Head */}
                <g transform="translate(0, -26)">
                  {/* Two Spring Mint Green Leaves Behind */}
                  <path d="M -16 6 Q -26 0 -22 -8 Q -14 -2 -16 6 Z" fill="#86EFAC" stroke="#16A34A" strokeWidth={1.2} />
                  <path d="M 16 6 Q 26 0 22 -8 Q 14 -2 16 6 Z" fill="#86EFAC" stroke="#16A34A" strokeWidth={1.2} />

                  {/* Left Small Blossom */}
                  <g transform="translate(-18, 2) scale(0.65)">
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        d="M 0 0 C -5 -9, -6 -15, -2 -17 C -1 -17.5, 0 -16, 0 -15 C 0 -16, 1 -17.5, 2 -17 C 6 -15, 5 -9, 0 0 Z"
                        fill="#FDF2F8"
                        stroke="#EC4899"
                        strokeWidth={1.4}
                        transform={`rotate(${deg})`}
                      />
                    ))}
                    <circle cx="0" cy="0" r="3" fill="#FDE047" />
                  </g>

                  {/* Right Small Blossom */}
                  <g transform="translate(18, 2) scale(0.65)">
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        d="M 0 0 C -5 -9, -6 -15, -2 -17 C -1 -17.5, 0 -16, 0 -15 C 0 -16, 1 -17.5, 2 -17 C 6 -15, 5 -9, 0 0 Z"
                        fill="#FDF2F8"
                        stroke="#EC4899"
                        strokeWidth={1.4}
                        transform={`rotate(${deg})`}
                      />
                    ))}
                    <circle cx="0" cy="0" r="3" fill="#FDE047" />
                  </g>

                  {/* Center Majestic 5-Petal Sakura Blossom */}
                  <g transform="translate(0, -2)">
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        d="M 0 0 C -6 -11, -7 -18, -2.5 -20 C -1 -20.5, 0 -19, 0 -17.5 C 0 -19, 1 -20.5, 2.5 -20 C 7 -18, 6 -11, 0 0 Z"
                        fill="#FFF1F2"
                        stroke="#E11D48"
                        strokeWidth={1.5}
                        transform={`rotate(${deg})`}
                      />
                    ))}
                    <circle cx="0" cy="0" r="4.5" fill="#FACC15" stroke="#CA8A04" strokeWidth={1.2} />
                  </g>
                </g>

                {/* Sweet Manga Sleeping/Smiling Eyes (^ ^) */}
                <path d="M -13 0 Q -8 -6 -3 0" stroke="#831843" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M 3 0 Q 8 -6 13 0" stroke="#831843" strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="8" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="6.5" x2="-19" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="6.5" x2="-16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="8" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="6.5" x2="13" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="6.5" x2="16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Kawaii Smile */}
                <path d="M -4 9 Q 0 14 4 9" stroke="#831843" strokeWidth={2.2} fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* 11:00 - CUTE BOBA MILK TEA SIPPING SUN */}
            {theme.archetype === "zenith_diamond" && (
              <g id="archetype-diamond-group" className="animate-[bobaSipJoy_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 8 Soft Sun Rays Revolving in Background */}
                <g className="animate-[sunRaySlowTurn_20s_linear_infinite]" style={{ transformOrigin: "0 -4px" }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <polygon
                      key={angle}
                      points="-4,-44 0,-54 4,-44"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.4}
                      transform={`rotate(${angle} 0 -4)`}
                    />
                  ))}
                </g>

                {/* Plump Golden Sun Body */}
                <circle
                  cx="0"
                  cy="-4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Closed Blissful Eyes (^ ^) */}
                <path d="M -16 -8 Q -10 -14 -4 -8" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M 0 -8 Q 6 -14 12 -8" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="-1" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="-2.5" x2="-21" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="-2.5" x2="-18" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="14" cy="-1" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="12.5" y1="-2.5" x2="11" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="15.5" y1="-2.5" x2="14" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Tiny Chibi Mouth Sipping Around Straw */}
                <ellipse cx="-5" cy="0" rx="3.5" ry="3.5" fill="#7C2D12" />

                {/* The Cute Transparent Boba Milk Tea Cup */}
                <g transform="translate(6, 12)">
                  {/* Cup Body Filled with Caramel Milk Tea */}
                  <path
                    d="M -9 0 L -6 20 Q -6 24 -3 24 L 7 24 Q 10 24 10 20 L 13 0 Z"
                    fill="#FDE68A"
                    stroke="#78350F"
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />

                  {/* Chewy Black Tapioca Boba Pearls */}
                  <circle cx="-2" cy="18" r="2.4" fill="#1C1917" />
                  <circle cx="3" cy="19" r="2.4" fill="#1C1917" />
                  <circle cx="7" cy="18" r="2.2" fill="#1C1917" />
                  <circle cx="1" cy="14" r="2.2" fill="#1C1917" />
                  <circle cx="5" cy="13" r="2.2" fill="#1C1917" />

                  {/* Sealed Cup Lid */}
                  <ellipse cx="2" cy="0" rx="12" ry="3" fill="#F43F5E" stroke="#78350F" strokeWidth={1.8} />

                  {/* Striped Boba Straw leading to Sun's Mouth */}
                  <line x1="-11" y1="-12" x2="1" y2="16" stroke="#3B82F6" strokeWidth={3.5} strokeLinecap="round" />
                  <line x1="-11" y1="-12" x2="1" y2="16" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="3 3" />

                  {/* Boba Pearl Being Sucked Up through Straw! */}
                  <circle cx="-5" cy="-2" r="2" fill="#1C1917" className="animate-[bobaPearlRise_1.6s_ease-in_infinite]" />

                  {/* Two Cute Chubby Hands Gripping the Cup */}
                  <circle cx="-7" cy="12" r="4.5" fill="#FED7AA" stroke="#78350F" strokeWidth={1.6} />
                  <circle cx="11" cy="12" r="4.5" fill="#FED7AA" stroke="#78350F" strokeWidth={1.6} />
                </g>

                {/* Blissful Sparkle of Cold Refreshment */}
                <polygon
                  points="26,-22 27.5,-19 30.5,-19 28,-17.5 29,-14.5 26,-16.5 23,-14.5 24,-17.5 21.5,-19 24.5,-19"
                  fill="#FEF08A"
                  stroke="#F59E0B"
                  strokeWidth={0.8}
                  className="animate-[pulse_1.8s_ease-in-out_infinite]"
                />
              </g>
            )}

            {/* 12:00 - ROYAL SUN KING WITH GLEAMING JEWELED CROWN */}
            {theme.archetype === "solaris_crown" && (
              <g id="archetype-crown-group" className="animate-[royalCrownFloat_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Radiant Royal Sunburst Rays Revolving in Background */}
                <g className="animate-[royalRaysRotate_24s_linear_infinite]" style={{ transformOrigin: "0 4px" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <polygon
                      key={angle}
                      points="-5,-42 0,-56 5,-42"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      transform={`rotate(${angle} 0 4)`}
                    />
                  ))}
                </g>

                {/* Plump Golden Sun King Body */}
                <circle
                  cx="0"
                  cy="4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Preserved #sun-flame-crown: Gorgeous 5-Point Royal Gold Crown Sitting Gracefully on Top of Head */}
                <g id="sun-flame-crown" transform="translate(0, -28)" className="animate-[crownGleam_2.6s_ease-in-out_infinite]">
                  {/* Golden Peaks with Curved Base Contour Hugging the Round Head */}
                  <path
                    d="M -18 2 L -18 -8 L -10 -2 L 0 -18 L 10 -2 L 18 -8 L 18 2 Q 0 -3 -18 2 Z"
                    fill="#FBBF24"
                    stroke="#B45309"
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 2px 5px rgba(245, 158, 11, 0.5))"
                  />

                  {/* Crown Base Gold Arch Band following skull curvature */}
                  <path d="M -18 2 Q 0 -3 18 2" stroke="#B45309" strokeWidth={3.8} fill="none" strokeLinecap="round" />
                  <path d="M -18 2 Q 0 -3 18 2" stroke="#F59E0B" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                  {/* Jewels along the Crown Arch Band */}
                  <circle cx="-11" cy="0.5" r="1.5" fill="#EF4444" />
                  <circle cx="-5.5" cy="-1.5" r="1.5" fill="#3B82F6" />
                  <circle cx="0" cy="-2.5" r="1.7" fill="#10B981" />
                  <circle cx="5.5" cy="-1.5" r="1.5" fill="#3B82F6" />
                  <circle cx="11" cy="0.5" r="1.5" fill="#EF4444" />

                  {/* Center Peak Jewel: Large Gleaming Red Ruby */}
                  <polygon points="0,-23 3.5,-18 0,-13 -3.5,-18" fill="#EF4444" stroke="#991B1B" strokeWidth={1} />

                  {/* Outer Jewels on Peaks */}
                  <circle cx="-18" cy="-8" r="2.2" fill="#10B981" stroke="#047857" strokeWidth={0.8} />
                  <circle cx="-10" cy="-2" r="1.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={0.8} />
                  <circle cx="10" cy="-2" r="1.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={0.8} />
                  <circle cx="18" cy="-8" r="2.2" fill="#10B981" stroke="#047857" strokeWidth={0.8} />
                </g>

                {/* Big Sparkling Royal Anime Eyes */}
                <ellipse cx="-11" cy="4" rx="4.2" ry="5.5" fill="#78350F" />
                <circle cx="-12.5" cy="2" r="1.8" fill="#FFFFFF" />
                <circle cx="-9.5" cy="6.5" r="1" fill="#FFFFFF" />

                <ellipse cx="11" cy="4" rx="4.2" ry="5.5" fill="#78350F" />
                <circle cx="9.5" cy="2" r="1.8" fill="#FFFFFF" />
                <circle cx="12.5" cy="6.5" r="1" fill="#FFFFFF" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="11" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="9.5" x2="-21" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="9.5" x2="-18" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="11" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="9.5" x2="15" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="9.5" x2="18" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Confident, Sweet Royal Smile */}
                <path d="M -5 13 Q 0 19 5 13" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Twinkling Crown Sparkles Beside Head */}
                <polygon
                  points="-28,-18 -26.5,-15 -23.5,-15 -26,-13.5 -25,-10.5 -28,-12.5 -31,-10.5 -30,-13.5 -32.5,-15 -29.5,-15"
                  fill="#FFFFFF"
                  opacity={0.9}
                  className="animate-[pulse_2s_ease-in-out_infinite]"
                />
                <polygon
                  points="28,-18 29.5,-15 32.5,-15 30,-13.5 31,-10.5 28,-12.5 25,-10.5 26,-13.5 23.5,-15 26.5,-15"
                  fill="#FFFFFF"
                  opacity={0.9}
                  className="animate-[pulse_2s_ease-in-out_infinite_1s]"
                />
              </g>
            )}

            {/* 13:00 - SIESTA SUN SLEEPING TUCKED IN FLUFFY CLOUD BLANKET */}
            {theme.archetype === "siesta_cloud" && (
              <g id="archetype-siesta-group" className="animate-[siestaNapBreathing_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Round Warm Sun Body */}
                <circle
                  cx="0"
                  cy="-4"
                  r="32"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Cute Frog Sleep Eye Mask Pushed Up on Sun's Forehead */}
                <g transform="translate(0, -22)">
                  {/* Green Eye Mask Band */}
                  <rect x="-16" y="-6" width="32" height="12" rx="6" fill="#34D399" stroke="#059669" strokeWidth={2} />
                  {/* Frog Mask Big Eyes */}
                  <circle cx="-8" cy="-6" r="4.5" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  <circle cx="-8" cy="-6" r="2.2" fill="#065F46" />
                  <circle cx="-8.8" cy="-6.8" r="0.8" fill="#FFFFFF" />

                  <circle cx="8" cy="-6" r="4.5" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  <circle cx="8" cy="-6" r="2.2" fill="#065F46" />
                  <circle cx="7.2" cy="-6.8" r="0.8" fill="#FFFFFF" />
                </g>

                {/* Sweet Peaceful Sleeping Face ( ◡ ‿ ◡ ) */}
                {/* Left Sleeping Eye */}
                <path d="M -14 -4 Q -9 -9 -4 -4" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                {/* Right Sleeping Eye */}
                <path d="M 4 -4 Q 9 -9 14 -4" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="3" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="1.5" x2="-19" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="1.5" x2="-16" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="3" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="1.5" x2="13" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="1.5" x2="16" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Smiling Sleeping Mouth */}
                <path d="M -3 5 Q 0 8.5 3 5" stroke={theme.strokeColor} strokeWidth={2} fill="none" strokeLinecap="round" />

                {/* Cute Snot/Dream Bubble from Nose */}
                <circle cx="5" cy="4" r="3.2" fill="#BAE6FD" stroke="#0284C7" strokeWidth={1} opacity={0.85} className="animate-[snotBubblePulse_2.8s_ease-in-out_infinite]" />

                {/* Fluffy Soft Cloud Blanket Tucked Around Chest */}
                <g className="animate-[cloudBlanketSway_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 22px" }}>
                  <path
                    d="
                      M -38 18
                      C -48 6, -32 -2, -18 6
                      C -10 -4, 10 -4, 18 6
                      C 32 -2, 48 6, 38 18
                      C 44 28, 20 34, 0 32
                      C -20 34, -44 28, -38 18
                      Z
                    "
                    fill="#F0F9FF"
                    stroke="#38BDF8"
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    filter="url(#chibiDropShadow)"
                  />
                  {/* Fluffy Cloud Shading Highlights */}
                  <path d="M -22 15 Q 0 9 22 15" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
                </g>

                {/* Cozy Floating Cartoon Zzz */}
                <text x="18" y="-18" fill={theme.strokeColor} fontSize="18" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="28" y="-28" fill="#38BDF8" fontSize="13" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
            )}

            {/* 14:00 - DUNKING ONSEN COOKIE BATH & HEART STEAM */}
            {theme.archetype === "teatime_sun" && (
              <g id="archetype-teatime-group">
                {/* Cookie Sun Dunking in Onsen Bath */}
                <g className="animate-[onsenBathBob_2.8s_ease-in-out_infinite]">
                  <circle cx="0" cy="-10" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                  {/* Folded Bath Towel on Sun Head */}
                  <rect x="-12" y="-44" width="24" height="8" rx="3" fill="#FFFFFF" stroke="#92400E" strokeWidth={1.6} />
                  {/* Blissful Relaxed Eyes */}
                  <path d="M -12 -12 Q -7 -18 -2 -12" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                  <path d="M 2 -12 Q 7 -18 12 -12" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                  <path d="M -4 -2 Q 0 4 4 -2" stroke="#78350F" strokeWidth={2} fill="#F43F5E" />
                  <circle cx="-16" cy="-8" r="4.5" fill="#F59E0B" opacity={0.7} />
                  <circle cx="16" cy="-8" r="4.5" fill="#F59E0B" opacity={0.7} />
                </g>

                {/* Ceramic Japanese Matcha Bowl */}
                <path d="M -32 8 Q -28 42 0 42 Q 28 42 32 8 Z" fill="#F0FDF4" stroke="#059669" strokeWidth={2.8} />
                <ellipse cx="0" cy="10" rx="28" ry="8" fill="#10B981" />

                {/* Huge Cartoon Heart Steam Flying Up */}
                <path
                  d="M 0 0 C -12 -8, -18 2, 0 16 C 18 2, 12 -8, 0 0 Z"
                  fill="#6EE7B7"
                  stroke="#047857"
                  strokeWidth={1.8}
                  className="animate-[bigHeartSteamFly_2.6s_ease-out_infinite]"
                  style={{ transformOrigin: "0 0" }}
                />
              </g>
            )}

            {/* 15:00 - HAPPY CHIBI SUN HOLDING MAPLE LEAF PARASOL */}
            {theme.archetype === "amber_leaf" && (
              <g id="archetype-amber-group" className="animate-[sunAutumnSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Radiant Autumn Sun Rays */}
                <g className="animate-[sunRayGentleRotate_28s_linear_infinite]" style={{ transformOrigin: "0 4px" }}>
                  {[...Array(12)].map((_, i) => (
                    <ellipse
                      key={i}
                      cx={Math.cos((i * Math.PI) / 6) * 44}
                      cy={4 + Math.sin((i * Math.PI) / 6) * 44}
                      rx="4"
                      ry="2"
                      fill="#F59E0B"
                      opacity={0.8}
                      transform={`rotate(${i * 30}, ${Math.cos((i * Math.PI) / 6) * 44}, ${4 + Math.sin((i * Math.PI) / 6) * 44})`}
                    />
                  ))}
                </g>

                {/* Round Warm Sun Body */}
                <circle
                  cx="0"
                  cy="4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Smiling Chibi Face (^ ‿ ^) */}
                {/* Left Smiling Eye Arc */}
                <path d="M -14 -2 Q -9 -8 -4 -2" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                {/* Right Smiling Eye Arc */}
                <path d="M 4 -2 Q 9 -8 14 -2" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="4.5" x2="-19" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="4.5" x2="-16" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="4.5" x2="13" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="4.5" x2="16" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Open Happy Smile */}
                <path d="M -4 8 Q 0 13 4 8 Z" fill="#F43F5E" stroke={theme.strokeColor} strokeWidth={1.4} />

                {/* Two Cute Chubby Hands Resting Happily Below Cheeks */}
                <ellipse cx="-20" cy="16" rx="4.5" ry="3.5" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.6} />
                <ellipse cx="20" cy="16" rx="4.5" ry="3.5" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.6} />

                {/* Soft Curved Japanese Momiji Leaf Resting Safely on Top of Head (No Eye Blockage) */}
                <g transform="translate(6, -33)">
                  <g className="animate-[leafParasolWave_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    {/* Leaf Stalk / Petiole */}
                    <path d="M 0 4 Q -3 8 -6 11" stroke="#7C2D12" strokeWidth={2} fill="none" strokeLinecap="round" />

                    {/* Organic Soft-Curved Momiji Leaf Blade Spreading Upward into Sky */}
                    <path
                      d="
                        M 0 4
                        C -5 2, -12 2, -18 -3
                        C -15 -7, -19 -10, -17 -14
                        C -13 -11, -12 -13, -14 -18
                        C -10 -15, -8 -16, -10 -22
                        C -6 -18, -4 -16, 0 -25
                        C 4 -16, 6 -18, 10 -22
                        C 8 -16, 10 -15, 14 -18
                        C 12 -13, 13 -11, 17 -14
                        C 19 -10, 15 -7, 18 -3
                        C 12 2, 5 2, 0 4
                        Z
                      "
                      fill="#EA580C"
                      stroke="#9A3412"
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                      filter="drop-shadow(0 2px 4px rgba(154, 52, 18, 0.35))"
                    />
                    {/* Organic Veins */}
                    <path d="M 0 4 Q 0 -8 0 -21" stroke="#7C2D12" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                    <path d="M 0 -6 Q -6 -11 -13 -16" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -2 Q -8 -5 -14 -5" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -6 Q 6 -11 13 -16" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -2 Q 8 -5 14 -5" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            )}

            {/* 16:00 - GENTLE AFTERNOON BREEZE & CHUBBY APRICOT SUN */}
            {theme.archetype === "apricot_sun" && (
              <g id="archetype-apricot-group" className="animate-[gentleBreezeSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Soft Pastel Wind Ribbons */}
                <g className="animate-[windRibbonGentle_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <path d="M -50 12 Q -16 -8 24 16 Q 44 4 54 14" fill="none" stroke="#FDA4AF" strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
                  <path d="M -44 -18 Q 0 4 44 -14" fill="none" stroke="#F43F5E" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 4" opacity={0.7} />
                </g>

                {/* Chubby Apricot Sun Body */}
                <circle cx="0" cy="0" r="35" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Cute Sprout Leaf Swaying on Head */}
                <g transform="translate(0, -35)">
                  <g className="animate-[sproutLeafSway_3s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <path d="M 0 0 Q 8 -14 16 -6 Q 8 -2 0 0 Z" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  </g>
                </g>

                {/* Happy Squinting Eyes Enjoying Cool Breeze (> <) */}
                <path d="M -15 -4 L -8 -1 L -15 2" stroke="#9F1239" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 15 -4 L 8 -1 L 15 2" stroke="#9F1239" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Sweet Contented Smiling Mouth */}
                <path d="M -4 8 Q 0 12 4 8" stroke="#9F1239" strokeWidth={2.2} fill="none" strokeLinecap="round" />

                {/* Chubby Rosy Cheeks Breathing with Breeze */}
                <g className="animate-[gentleCheekBreathe_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <ellipse cx="-20" cy="6" rx="8" ry="5.5" fill="#FB7185" opacity={0.85} />
                  <line x1="-22" y1="4.5" x2="-23.5" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="-19" y1="4.5" x2="-20.5" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                  <ellipse cx="20" cy="6" rx="8" ry="5.5" fill="#FB7185" opacity={0.85} />
                  <line x1="18.5" y1="4.5" x2="17" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="21.5" y1="4.5" x2="20" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                </g>
              </g>
            )}

            {/* 17:00 - SUNSET HORIZON SUN DIPPING BEHIND CLOUD & WAVING GOODBYE */}
            {theme.archetype === "sunset_ember" && (
              <g id="archetype-sunset-group">
                {/* Sunset Sun Body Bobbing Gently as it Dips */}
                <g className="animate-[sunsetDipSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <circle cx="0" cy="-8" r="32" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                  {/* Happy Smiling Eyes Fully Uncovered Above Cloud (^ ‿ ^) */}
                  <path d="M -14 -14 Q -9 -20 -4 -14" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <path d="M 4 -14 Q 9 -20 14 -14" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />

                  {/* Warm Glowing Sunset Rosy Cheeks */}
                  <ellipse cx="-16" cy="-6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                  <line x1="-17.5" y1="-7.5" x2="-19" y2="-4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="-14.5" y1="-7.5" x2="-16" y2="-4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                  <ellipse cx="16" cy="-6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                  <line x1="14.5" y1="-7.5" x2="13" y2="-4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="17.5" y1="-7.5" x2="16" y2="-4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                  {/* Sweet Open Happy Smile */}
                  <path d="M -4 -2 Q 0 3 4 -2 Z" fill="#F43F5E" stroke={theme.strokeColor} strokeWidth={1.4} />

                  {/* Waving Hand Saying Bye to the Day */}
                  <g transform="translate(18, -8)">
                    <g className="animate-[sunsetWaveHand_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 4px" }}>
                      <ellipse cx="2" cy="-4" rx="4" ry="3.5" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.5} />
                      <path d="M 0 -2 L -2 4" stroke={theme.strokeColor} strokeWidth={1.5} strokeLinecap="round" />
                    </g>
                  </g>
                </g>

                {/* Soft Fluffy Sunset Cloud Lowered Below Face */}
                <g className="animate-[sunsetCloudDrift_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 24px" }}>
                  <path
                    d="
                      M -40 22
                      C -50 12, -34 6, -20 12
                      C -12 4, 12 4, 20 12
                      C 34 6, 50 12, 40 22
                      C 46 32, 22 38, 0 36
                      C -22 38, -46 32, -40 22
                      Z
                    "
                    fill="#FDF2F8"
                    stroke="#F472B6"
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    filter="url(#chibiDropShadow)"
                  />
                  {/* Soft Sunset Cloud Highlights */}
                  <path d="M -24 18 Q 0 12 24 18" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.85} />

                  {/* Cute Left Hand Resting on Cloud Edge */}
                  <ellipse cx="-16" cy="18" rx="4" ry="3.2" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.5} />
                </g>

                {/* Evening Golden Sunset Sparkles */}
                <polygon
                  points="-22,-20 -20.5,-17 -17.5,-17 -20,-15.5 -19,-12.5 -22,-14.5 -25,-12.5 -24,-15.5 -26.5,-17 -23.5,-17"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite]"
                />
                <polygon
                  points="24,-24 25.5,-21 28.5,-21 26,-19.5 27,-16.5 24,-18.5 21,-16.5 22,-19.5 19.5,-21 22.5,-21"
                  fill="#FDE047"
                  className="animate-[pulse_2s_ease-in-out_infinite_1s]"
                />
              </g>
            )}

            {/* 18:00 - CORAL DUSK CRADLING THE FIRST EVENING STAR */}
            {theme.archetype === "coral_dusk" && (
              <g id="archetype-dusk-group" className="animate-[duskGlowFloat_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Round Coral Dusk Body */}
                <circle cx="0" cy="0" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Big Sparkling Anime Eyes Wondering at the Evening Star */}
                {/* Left Eye */}
                <ellipse cx="-13" cy="-4" rx="5" ry="6.5" fill="#3B0764" />
                <circle cx="-14.5" cy="-6.5" r="2.2" fill="#FFFFFF" />
                <circle cx="-11" cy="-1.5" r="1.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="13" cy="-4" rx="5" ry="6.5" fill="#3B0764" />
                <circle cx="11.5" cy="-6.5" r="2.2" fill="#FFFFFF" />
                <circle cx="15" cy="-1.5" r="1.2" fill="#FFFFFF" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="5" rx="5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="3.5" x2="-21" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="3.5" x2="-18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="5" rx="5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="3.5" x2="15" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="3.5" x2="18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M -3 7 Q 0 10.5 3 7" stroke="#3B0764" strokeWidth={2} fill="none" strokeLinecap="round" />

                {/* Two Cute Little Hands Cupped Together Holding the Star */}
                <circle cx="-7" cy="19" r="3.8" fill="#FCE7F3" stroke={theme.strokeColor} strokeWidth={1.5} />
                <circle cx="7" cy="19" r="3.8" fill="#FCE7F3" stroke={theme.strokeColor} strokeWidth={1.5} />

                {/* Glowing First Evening Star Hovering Between Hands */}
                <g transform="translate(0, 14)">
                  {/* Star Glow Halo */}
                  <circle cx="0" cy="0" r="11" fill="#FEF08A" opacity={0.35} className="animate-[pulse_2s_ease-in-out_infinite]" />

                  {/* Star Body Floating */}
                  <g className="animate-[firstStarGlowFloat_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <polygon
                      points="0,-8 2.5,-2.5 8,-2.5 3.8,1 5.5,7 0,3.5 -5.5,7 -3.8,1 -8,-2.5 -2.5,-2.5"
                      fill="#FDE047"
                      stroke="#CA8A04"
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                    {/* Cute Tiny Eyes on Star */}
                    <circle cx="-1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="-2.2" cy="0.2" r="0.3" fill="#FFFFFF" />
                    <circle cx="1.4" cy="0.2" r="0.3" fill="#FFFFFF" />
                    {/* Tiny Pink Cheeks on Star */}
                    <circle cx="-3" cy="2" r="0.7" fill="#FB7185" />
                    <circle cx="3" cy="2" r="0.7" fill="#FB7185" />
                  </g>
                </g>

                {/* Twilight Twinkling Sparkles in Sky */}
                <polygon
                  points="-24,-20 -22.5,-17 -19.5,-17 -22,-15.5 -21,-12.5 -24,-14.5 -27,-12.5 -26,-15.5 -28.5,-17 -25.5,-17"
                  fill="#FDE047"
                  className="animate-[pulse_2s_ease-in-out_infinite]"
                />
                <polygon
                  points="26,-18 27.5,-15 30.5,-15 28,-13.5 29,-10.5 26,-12.5 23,-10.5 24,-13.5 21.5,-15 24.5,-15"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
              </g>
            )}

            {/* 19:00 - GOLDEN CRESCENT MOON ROCKING IN EVENING SKY */}
            {theme.archetype === "evening_star" && (
              <g id="archetype-evening-star-group" className="animate-[crescentRocking_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Fairytale Crescent Moon Silhouette */}
                <path
                  d="
                    M -4 -42
                    C 22 -36, 44 -18, 42 4
                    C 40 24, 20 40, -4 44
                    C 14 26, 18 -6, 2 -24
                    C -0.5 -32, -2 -38, -4 -42
                    Z
                  "
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  strokeLinejoin="round"
                  filter="url(#chibiDropShadow)"
                />

                {/* Sweet Sleeping Moon Face on Crescent Belly */}
                {/* Smiling Curved Eye */}
                <path d="M 17 -4 Q 23 -9 29 -4" stroke="#78350F" strokeWidth={2.2} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheek with White Chibi Highlights */}
                <ellipse cx="23" cy="4" rx="4" ry="2.8" fill="#FB7185" opacity={0.85} />
                <line x1="21.5" y1="2.5" x2="20" y2="5.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="24.5" y1="2.5" x2="23" y2="5.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M 18 9 Q 22 13 26 9" stroke="#78350F" strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Two Cute Little Hands Resting on the Crescent Inner Rim */}
                <circle cx="10" cy="11" r="3.2" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />
                <circle cx="13" cy="17" r="3.2" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />

                {/* Little Baby Evening Star Floating in Crescent Hollow */}
                <g transform="translate(-8, -4)">
                  {/* Star Glow Halo */}
                  <circle cx="0" cy="0" r="11" fill="#FEF08A" opacity={0.4} className="animate-[pulse_2s_ease-in-out_infinite]" />

                  {/* Floating Baby Star */}
                  <g className="animate-[crescentStarGlow_2.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <polygon
                      points="0,-8 2.5,-2.5 8,-2.5 3.8,1 5.5,7 0,3.5 -5.5,7 -3.8,1 -8,-2.5 -2.5,-2.5"
                      fill="#FDE047"
                      stroke={theme.strokeColor}
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                    {/* Cute Tiny Eyes on Star */}
                    <circle cx="-1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="1.8" cy="0.5" r="0.8" fill="#78350F" />
                    {/* Tiny Pink Cheeks */}
                    <circle cx="-3" cy="2" r="0.7" fill="#FB7185" />
                    <circle cx="3" cy="2" r="0.7" fill="#FB7185" />
                  </g>
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-24,-24 -22.5,-21 -19.5,-21 -22,-19.5 -21,-16.5 -24,-18.5 -27,-16.5 -26,-19.5 -28.5,-21 -25.5,-21"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
                <polygon
                  points="-18,28 -16.5,31 -13.5,31 -16,32.5 -15,35.5 -18,33.5 -21,35.5 -20,32.5 -22.5,31 -19.5,31"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_1.4s]"
                />
              </g>
            )}

            {/* 20:00 - MOCHI SMASH & GIANT STRETCH BUNNY */}
            {theme.archetype === "silver_moon" && (
              <g id="archetype-silver-moon-group">
                {/* Silver Moon Orb with Cute Lunar Crater Faces */}
                <circle cx="0" cy="0" r="36" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                <circle cx="-16" cy="-16" r="6" fill="#93C5FD" opacity={0.35} />
                <circle cx="-6" cy="-24" r="4" fill="#93C5FD" opacity={0.3} />

                {/* Bunny & Mochi Mortar */}
                <g transform="translate(6, 4)">
                  <path d="M -22 8 L -10 8 L -12 24 L -20 24 Z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth={2} />

                  {/* Elastic Gooey Mochi Dough Stretching */}
                  <g transform="translate(-16, 8)" className="animate-[mochiGooeyStretch_1.6s_ease-in-out_infinite]">
                    <ellipse cx="0" cy="0" rx="8" ry="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth={2} />
                  </g>

                  {/* Mallet Pounding Down */}
                  <g transform="translate(-16, 4)" className="animate-[malletSmashLoop_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <line x1="0" y1="0" x2="-14" y2="-16" stroke="#92400E" strokeWidth={2.6} strokeLinecap="round" />
                    <rect x="-20" y="-22" width="10" height="6" rx="2" fill="#D97706" stroke="#92400E" strokeWidth={1.8} />
                  </g>

                  {/* Hardworking Tsukimi Bunny with Ruby Eyes & Nose */}
                  <g transform="translate(4, 0)">
                    <ellipse cx="0" cy="10" rx="11" ry="10" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={2.2} />
                    <circle cx="0" cy="-4" r="9.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={2.2} />
                    {/* Wiggling Ears */}
                    <ellipse cx="-4" cy="-18" rx="3.2" ry="8.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={1.8} />
                    <ellipse cx="-4" cy="-18" rx="1.6" ry="5.5" fill="#FDA4AF" />
                    <ellipse cx="4" cy="-18" rx="3.2" ry="8.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={1.8} />
                    <ellipse cx="4" cy="-18" rx="1.6" ry="5.5" fill="#FDA4AF" />
                    {/* Cute Determined Bunny Face */}
                    <circle cx="-3" cy="-4" r="2" fill="#DC2626" />
                    <circle cx="3" cy="-4" r="2" fill="#DC2626" />
                    <circle cx="-4" cy="-5" r="0.8" fill="#FFFFFF" />
                    <circle cx="2" cy="-5" r="0.8" fill="#FFFFFF" />
                    <polygon points="0,-1 -1.5,-2.5 1.5,-2.5" fill="#FDA4AF" />
                    <path d="M -2 1 Q 0 3 2 1" stroke="#DC2626" strokeWidth={1.4} fill="none" />
                  </g>
                </g>
              </g>
            )}

            {/* 21:00 - COZY WARM TEA MOON SAVORING BEFORE SLEEP */}
            {theme.archetype === "lantern_moon" && (
              <g id="archetype-lantern-moon-group" className="animate-[cozyTeaMoonFloat_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Full Moon Orb Body */}
                <circle cx="0" cy="0" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-14" r="5.5" fill="#FDE047" opacity={0.45} />
                <circle cx="18" cy="-12" r="4.5" fill="#FDE047" opacity={0.4} />

                {/* Contented Sleeping Eyes Savoring Warm Tea ( ˘ ‿ ˘ ) */}
                <path d="M -14 -4 Q -9 -8 -4 -4" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 4 -4 Q 9 -8 14 -4" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="4" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="2.5" x2="-19" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="2.5" x2="-16" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="4" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="2.5" x2="13" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="2.5" x2="16" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Peaceful Smiling Mouth */}
                <path d="M -3 4 Q 0 8 3 4" stroke="#78350F" strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Cozy Ceramic Mug with Tiny Pink Heart */}
                <g transform="translate(0, 5)">
                  {/* Mug Handle */}
                  <path d="M 8 11 C 13 11, 13 18, 7 19" fill="none" stroke="#D97706" strokeWidth={1.6} strokeLinecap="round" />

                  {/* Mug Body */}
                  <path d="M -8 9 L -6 21 Q 0 23 6 21 L 8 9 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth={1.6} strokeLinejoin="round" />

                  {/* Warm Drink Surface */}
                  <ellipse cx="0" cy="9" rx="7.5" ry="2.2" fill="#B45309" />

                  {/* Cute Tiny Pink Heart on Mug */}
                  <path d="M 0 13.5 C -0.8 12, -2.5 12.8, -2.5 14 C -2.5 15.5, 0 17, 0 17.5 C 0 17, 2.5 15.5, 2.5 14 C 2.5 12.8, 0.8 12, 0 13.5 Z" fill="#F43F5E" />

                  {/* Two Cute Little Hands Hugging Mug */}
                  <circle cx="-8" cy="15" r="3.4" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />
                  <circle cx="8" cy="15" r="3.4" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />

                  {/* Aromatic Steam Rising into Floating Heart */}
                  <g className="animate-[steamHeartRise_2.6s_ease-in-out_infinite]">
                    {/* Wispy Steam Line */}
                    <path d="M -2 4 Q -6 -2 0 -6 Q 6 -10 2 -16" stroke="#FEF08A" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.75} />
                    {/* Floating Heart Steam */}
                    <path d="M 0 -19 C -0.8 -20.5, -2.5 -19.7, -2.5 -18.5 C -2.5 -17, 0 -15.5, 0 -15 C 0 -15.5, 2.5 -17, 2.5 -18.5 C 2.5 -19.7, 0.8 -20.5, 0 -19 Z" fill="#FDA4AF" opacity={0.85} />
                  </g>
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-24,-20 -22.5,-17 -19.5,-17 -22,-15.5 -21,-12.5 -24,-14.5 -27,-12.5 -26,-15.5 -28.5,-17 -25.5,-17"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
                <polygon
                  points="24,-20 25.5,-17 28.5,-17 26,-15.5 27,-12.5 24,-14.5 21,-12.5 22,-15.5 19.5,-17 22.5,-17"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_1.4s]"
                />
              </g>
            )}

            {/* 22:00 - NEON JELLYFISH JET PROPULSION AZURE MOON (Right-Facing Crescent) */}
            {theme.archetype === "azure_moon" && (
              <g id="archetype-azure-group" className="animate-[jellyfishJetPulse_2.6s_easeInOutSine_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Pure Flowing Fairy Tale Azure Crescent Moon Facing Right ) */}
                <path
                  d="
                    M -6 -52
                    C 28 -44, 52 -18, 50 16
                    C 48 40, 26 58, -4 64
                    C 18 50, 26 28, 22 6
                    C 18 -16, 8 -38, -6 -52
                    Z
                  "
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Glowing Eyes Firmly on Solid Moon Body */}
                <circle cx="24" cy="-4" r="4" fill="#0284C7" />
                <circle cx="36" cy="-4" r="4" fill="#0284C7" />
                <circle cx="23" cy="-6" r="1.5" fill="#FFFFFF" />
                <circle cx="35" cy="-6" r="1.5" fill="#FFFFFF" />
                {/* Cute Smiling Mouth & Bioluminescent Cheek */}
                <path d="M 26 8 Q 30 12 34 8" stroke="#0284C7" strokeWidth={2} fill="none" strokeLinecap="round" />
                <circle cx="42" cy="4" r="4.5" fill="#38BDF8" opacity={0.8} />

                {/* Long Galaxy Tentacles Flying Like Jet Exhaust */}
                <g className="animate-[tentacleLagWave_2.6s_ease-in-out_infinite]" style={{ transformOrigin: "12px 46px" }}>
                  <path d="M 8 48 Q 2 68 16 88" stroke="#38BDF8" strokeWidth={3} fill="none" strokeLinecap="round" />
                  <path d="M 18 46 Q 26 72 16 94" stroke="#A5F3FC" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <path d="M 28 42 Q 36 64 30 84" stroke="#818CF8" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                </g>
              </g>
            )}

            {/* 23:00 - CLEAN & ICONIC: DREAM FISHER MOON */}
            {theme.archetype === "dream_moon" && (
              <g id="archetype-dream-group">
                {/* Pure Flowing Fairy Tale Slumber Crescent Moon Facing Right ) */}
                <path
                  d="
                    M -6 -52
                    C 28 -44, 52 -18, 50 16
                    C 48 40, 26 58, -4 64
                    C 18 50, 26 28, 22 6
                    C 18 -16, 8 -38, -6 -52
                    Z
                  "
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Moon's Happy Face Looking Down at the Catch */}
                <ellipse cx="24" cy="-6" rx="4" ry="5" fill="#4C1D95" />
                <circle cx="22" cy="-8" r="1.6" fill="#FFFFFF" />
                {/* Playful Winking Eye */}
                <path d="M 34 -6 L 40 -3 L 34 0" stroke="#4C1D95" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                {/* Cheerful Smile (^‿^) */}
                <path d="M 24 8 Q 30 14 36 8" stroke="#4C1D95" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                {/* Rosy Pink Cheek */}
                <circle cx="38" cy="2" r="5" fill="#F472B6" opacity={0.8} />

                {/* Little Chibi Hand Holding the Rod */}
                <circle cx="10" cy="10" r="4.5" fill="#FAF5FF" stroke="#7C3AED" strokeWidth={2} />

                {/* Arched Bamboo Fishing Pole Bending under Fish Weight */}
                <g className="animate-[fishingRodBob_1.8s_ease-in-out_infinite]" style={{ transformOrigin: "10px 10px" }}>
                  {/* Clean Curved Fishing Rod */}
                  <path d="M 10 10 Q -10 -10 -30 -20" stroke="#B45309" strokeWidth={3} fill="none" strokeLinecap="round" />
                  <circle cx="-30" cy="-20" r="2.5" fill="#F59E0B" />

                  {/* Clean Fishing Line Dropping Down */}
                  <line x1="-30" y1="-20" x2="-30" y2="12" stroke="#E9D5FF" strokeWidth={1.8} strokeDasharray="3 2" />

                  {/* Caught Star-Fish Wiggling & Flopping on the Line! */}
                  <g transform="translate(-30, 14)" className="animate-[starFishFlop_1.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    {/* Metal Hook */}
                    <path d="M 0 0 L 0 5 Q 0 9 4 9 Q 7 9 6 6" stroke="#94A3B8" strokeWidth={1.6} fill="none" />

                    {/* Star Body */}
                    <polygon
                      points="0,-3 3,5 11,5 5,10 7,18 0,13 -7,18 -5,10 -11,5 -3,5"
                      fill="#FEF08A"
                      stroke="#F59E0B"
                      strokeWidth={2}
                    />

                    {/* Surprised Fish Eyes (⊙ ⊙) */}
                    <circle cx="-3" cy="7" r="2.5" fill="#FFFFFF" stroke="#B45309" strokeWidth={1} />
                    <circle cx="3" cy="7" r="2.5" fill="#FFFFFF" stroke="#B45309" strokeWidth={1} />
                    <circle cx="-3" cy="7" r="1.2" fill="#1E293B" />
                    <circle cx="3" cy="7" r="1.2" fill="#1E293B" />

                    {/* Cute Fish Mouth Hooked */}
                    <ellipse cx="0" cy="11" rx="2" ry="1.5" fill="#EF4444" />

                    {/* Flapping Fish Tail Fin */}
                    <path d="M 0 17 Q -6 26 -8 30 Q 0 26 0 23 Q 0 26 8 30 Q 6 26 0 17 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth={1.6} />
                  </g>
                </g>
              </g>
            )}

          </g>
        </g>
      </g>
    </g>
  );
}
