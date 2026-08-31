import React from "react";
import type { SawakoTimeOfDay } from "../types";
import { getHourlyTheme, type HourlyTheme } from "../sawako-hourly-theme";

interface SawakoAmbientMoodProps {
  timeOfDay?: SawakoTimeOfDay;
  hour?: number;
  isDragging?: boolean;
  onCycleTimeOfDay?: () => void;
}

/**
 * SawakoAmbientMood - High-Definition 24-Hour Celestial & Meteorological Decor
 * 
 * Features:
 * - Scaled up by ~25% for prominent, crystal-clear mascot presence.
 * - Sharp high-contrast outlines (strokeWidth 2px) & luxury specular glass highlights (alpha 0.85).
 * - 24 distinct hourly themes (00:00 to 23:00) with custom astronomical archetypes:
 *   Moons, Nebulae, Comets, Venus Star, Dawns, High Noon Crowns, Teatime Suns, Coral Dusks.
 * - Backward compatible: fallback mapping for legacy timeOfDay ('day' | 'sunset' | 'night').
 * - Preserves exact test target element IDs (#ambient-crescent-moon, #ambient-sunset-orb, #ambient-day-sun).
 */
export function SawakoAmbientMood({
  timeOfDay,
  hour,
  isDragging = false,
  onCycleTimeOfDay,
}: SawakoAmbientMoodProps) {
  const theme: HourlyTheme = getHourlyTheme(hour, timeOfDay);
  const category = theme.category;

  // Root ID for backward compatibility with existing tests and selectors
  const elementId =
    category === "night"
      ? "ambient-crescent-moon"
      : category === "sunset"
        ? "ambient-sunset-orb"
        : "ambient-day-sun";

  return (
    <g
      id="sawako-ambient-mood"
      className="transition-opacity duration-500 ease-in-out"
      style={{ opacity: isDragging ? 0.25 : 1 }}
    >
      <style>{`
        @keyframes moodFloatHighDef {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(4px, -12px) rotate(3.5deg);
          }
        }
        @keyframes sunSpinSlowHighDef {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes sunPulseGlowHighDef {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        @keyframes starGleamHighDef {
          0%, 100% {
            transform: scale(0.85) rotate(0deg);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.3) rotate(30deg);
            opacity: 1;
          }
        }
        @keyframes particleRiseHighDef {
          0% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.2;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translate(8px, -26px) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes cometTailPulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
        #weather-mood-interactive-group {
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        #weather-mood-interactive-group:focus,
        #weather-mood-interactive-group:focus-visible {
          outline: none;
        }
      `}</style>

      {/* Interactive Weather Mood Clickable Container */}
      <g
        id="weather-mood-interactive-group"
        className="cursor-pointer pointer-events-auto outline-none focus:outline-none focus-visible:outline-none select-none"
        style={{ outline: "none" }}
        onClick={(e) => {
          e.stopPropagation();
          onCycleTimeOfDay?.();
        }}
        role="button"
        tabIndex={0}
        aria-label={`Time: ${theme.timeLabel} (${theme.name}) - Weather: ${category}. Click to advance time.`}
        data-hour={theme.hour}
        data-archetype={theme.archetype}
      >
        <g id={elementId} transform="translate(605, 128)">
          <g
            className="animate-[moodFloatHighDef_5.2s_ease-in-out_infinite]"
            style={{ transformOrigin: "0 0" }}
          >
            <defs>
              {/* Dynamic Luminous Ambient Halo Gradient */}
              <radialGradient id="highDefMoodHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.haloColors[0]} stopOpacity={0.7} />
                <stop offset="55%" stopColor={theme.haloColors[1]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={theme.haloColors[2]} stopOpacity={0} />
              </radialGradient>

              {/* Core Body Linear Gradient */}
              <linearGradient id="highDefCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.coreColors[0]} />
                <stop offset="100%" stopColor={theme.coreColors[1]} />
              </linearGradient>

              {/* High-definition drop shadow & specular filter */}
              <filter id="highDefMoodFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={theme.strokeColor} floodOpacity="0.45" />
              </filter>
            </defs>

            {/* ===================== LAYER 1: ENLARGED AMBIENT HALO (r=64px) ===================== */}
            <circle cx="0" cy="0" r="64" fill="url(#highDefMoodHalo)" />

            {/* ===================== LAYER 2: SPECIALIZED ARCHETYPE ARTWORK ===================== */}

            {/* 1. MOON ARCHETYPES (Midnight, Slumber Cloud, Silver, Lantern, Azure, Dream) */}
            {(theme.archetype === "midnight_moon" ||
              theme.archetype === "silver_moon" ||
              theme.archetype === "azure_moon" ||
              theme.archetype === "dream_moon") && (
              <g id="archetype-crescent-group">
                {/* Scaled-up ~25% Chibi Crescent Moon (~125px span) */}
                <path
                  d="
                    M -8 -50
                    C 30 -38, 50 -7, 45 32
                    C 40 57, 22 72, -5 77
                    C 25 62, 35 38, 30 12
                    C 25 -12, 10 -38, -8 -50
                    Z
                  "
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  filter="url(#highDefMoodFilter)"
                />

                {/* Sharp Specular Glass Reflection Arc */}
                <path
                  d="
                    M -3 -42
                    C 24 -32, 40 -4, 34 26
                    C 30 46, 17 58, -1 63
                    C 18 50, 26 28, 21 8
                    C 17 -11, 7 -29, -3 -42
                    Z
                  "
                  fill="#FFFFFF"
                  opacity={0.85}
                />

                {/* Delicate Lunar Crater Accents */}
                <circle cx="26" cy="26" r="3.8" fill={theme.strokeColor} opacity={0.35} />
                <circle cx="30" cy="5" r="2.6" fill={theme.strokeColor} opacity={0.3} />
                <circle cx="19" cy="-14" r="3.2" fill={theme.strokeColor} opacity={0.25} />

                {/* Sparkling Diamond Companion Star (✦) */}
                <g
                  transform="translate(34, -32)"
                  className="animate-[starGleamHighDef_3.2s_ease-in-out_infinite]"
                  style={{ transformOrigin: "0 0" }}
                >
                  <polygon points="0,-15 3.5,0 0,15 -3.5,0" fill="#FFFFFF" />
                  <polygon points="-15,0 0,3.5 15,0 0,-3.5" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="3" fill={theme.accentColor} />
                </g>

                {/* Secondary Stardust Accent */}
                <g
                  transform="translate(-20, 52) scale(0.75)"
                  className="animate-[starGleamHighDef_3.8s_ease-in-out_infinite_1s]"
                  style={{ transformOrigin: "0 0" }}
                >
                  <polygon points="0,-12 3,0 0,12 -3,0" fill="#FFFFFF" opacity={0.9} />
                  <polygon points="-12,0 0,3 12,0 0,-3" fill="#FFFFFF" opacity={0.9} />
                </g>
              </g>
            )}

            {/* 1B. SLUMBER CLOUD MOON (01:00) */}
            {theme.archetype === "cloud_moon" && (
              <g id="archetype-cloud-moon-group">
                {/* Crescent leaning comfortably */}
                <path
                  d="
                    M -12 -42
                    C 22 -32, 38 -4, 34 26
                    C 30 46, 17 58, -4 63
                    C 20 50, 27 28, 23 8
                    C 19 -12, 6 -32, -12 -42
                    Z
                  "
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                {/* Sleeping closed eye on moon */}
                <path d="M 12 12 Q 17 6 22 12" stroke={theme.strokeColor} strokeWidth={2} fill="none" strokeLinecap="round" />

                {/* Fluffy Sleeping Cloud Pillow Base */}
                <path
                  d="M -36 34 Q -28 18 -10 20 Q 8 6 30 18 Q 48 16 48 36 Q 48 52 24 52 L -24 52 Q -40 52 -36 34 Z"
                  fill="#F5F3FF"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="drop-shadow(0 2px 8px rgba(167, 139, 250, 0.4))"
                />

                {/* Cute Floating Zzz Floating Up */}
                <text x="28" y="-16" fill={theme.strokeColor} fontSize="15" fontWeight="bold" className="animate-pulse">
                  Z<tspan fontSize="11">z</tspan><tspan fontSize="8">z</tspan>
                </text>
              </g>
            )}

            {/* 1C. LANTERN MOON WARMTH (21:00) */}
            {theme.archetype === "lantern_moon" && (
              <g id="archetype-lantern-moon-group">
                {/* Glowing full orb */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                {/* Soft lantern ribs */}
                <ellipse cx="0" cy="0" rx="20" ry="33" fill="none" stroke={theme.strokeColor} strokeWidth={1.5} opacity={0.65} />
                <line x1="-34" y1="0" x2="34" y2="0" stroke={theme.strokeColor} strokeWidth={1.5} opacity={0.5} />
                {/* Specular gloss */}
                <path d="M -22 -20 A 28 28 0 0 1 20 -20 A 24 24 0 0 0 -22 -20 Z" fill="#FFFFFF" opacity={0.8} />
                {/* Decorative golden hanging tassel at base */}
                <circle cx="0" cy="38" r="3" fill={theme.accentColor} />
                <line x1="0" y1="41" x2="0" y2="54" stroke={theme.accentColor} strokeWidth={2} strokeLinecap="round" />
              </g>
            )}

            {/* 2. ASTRAL & HORIZON ARCHETYPES */}

            {/* 2A. WITCHING HOUR NEBULA (02:00) */}
            {theme.archetype === "nebula" && (
              <g id="archetype-nebula-group">
                {/* Cosmic orbital rings */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="54"
                  ry="24"
                  transform="rotate(-28)"
                  fill="none"
                  stroke="#E879F9"
                  strokeWidth={2}
                  opacity={0.8}
                  className="animate-[orbitalRingSpin_30s_linear_infinite]"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="48"
                  ry="20"
                  transform="rotate(38)"
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth={2}
                  opacity={0.8}
                  className="animate-[orbitalRingSpin_24s_linear_infinite_reverse]"
                />
                {/* Core Nebula Orb */}
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                <path d="M -18 -16 A 22 22 0 0 1 16 -16 A 18 18 0 0 0 -18 -16 Z" fill="#FFFFFF" opacity={0.85} />
                {/* Constellation Stars */}
                <circle cx="-28" cy="-22" r="3" fill="#FFFFFF" />
                <circle cx="30" cy="-18" r="3.5" fill="#FFFFFF" />
                <circle cx="26" cy="24" r="2.8" fill="#FFFFFF" />
                <circle cx="-22" cy="28" r="2.5" fill="#FFFFFF" />
                {/* Dotted Constellation Lines */}
                <line x1="-28" y1="-22" x2="0" y2="0" stroke="#FFFFFF" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                <line x1="0" y1="0" x2="30" y2="-18" stroke="#FFFFFF" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                <line x1="0" y1="0" x2="26" y2="24" stroke="#FFFFFF" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
              </g>
            )}

            {/* 2B. SHOOTING STAR COMET (03:00) */}
            {theme.archetype === "comet" && (
              <g id="archetype-comet-group" className="animate-[cometTailPulse_2.8s_ease-in-out_infinite]">
                {/* Dynamic Stardust Tail */}
                <path
                  d="M -12 -12 L -68 -48 L -20 18 Z"
                  fill="url(#highDefMoodHalo)"
                  opacity={0.85}
                  filter="drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))"
                />
                <line x1="-12" y1="-12" x2="-62" y2="-44" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
                {/* Comet Core */}
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                <path d="M -18 -16 A 22 22 0 0 1 16 -16 A 18 18 0 0 0 -18 -16 Z" fill="#FFFFFF" opacity={0.85} />
                {/* Trailing Sparkles */}
                <circle cx="-42" cy="-28" r="2.5" fill="#FFFFFF" />
                <circle cx="-56" cy="-38" r="2" fill="#67E8F9" />
                <circle cx="-28" cy="-8" r="2.2" fill="#A5F3FC" />
              </g>
            )}

            {/* 2C. PRE-DAWN VENUS MORNING STAR (04:00) */}
            {theme.archetype === "venus" && (
              <g id="archetype-venus-group">
                {/* Brilliant 8-Pointed Venus Diamond Star */}
                <polygon
                  points="0,-48 8,-10 48,0 8,10 0,48 -8,10 -48,0 -8,-10"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                {/* Diagonal Diamond Facet Spikes */}
                <polygon
                  points="-26,-26 0,-6 26,-26 6,0 26,26 0,6 -26,26 -6,0"
                  fill="#6EE7B7"
                  stroke={theme.strokeColor}
                  strokeWidth={1.4}
                  opacity={0.85}
                />
                {/* Central Specular Diamond Core */}
                <circle cx="0" cy="0" r="7" fill="#FFFFFF" />
                <polygon points="0,-12 3,0 0,12 -3,0" fill="#FFFFFF" />
                <polygon points="-12,0 0,3 12,0 0,-3" fill="#FFFFFF" />
              </g>
            )}

            {/* 2D. DAWN HORIZON GLOW (05:00) */}
            {theme.archetype === "dawn_horizon" && (
              <g id="archetype-dawn-group">
                {/* Horizon Gradient Mountain Silhouette */}
                <path d="M -48 18 L -20 -4 L 14 18 L 48 6 L 48 36 L -48 36 Z" fill="#818CF8" opacity={0.55} />
                {/* Rising Sun Disc over Horizon */}
                <circle
                  cx="0"
                  cy="4"
                  r="28"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                <path d="M -18 -12 A 22 22 0 0 1 16 -12 A 18 18 0 0 0 -18 -12 Z" fill="#FFFFFF" opacity={0.85} />
                {/* Sharp Horizon Boundary Line */}
                <line x1="-52" y1="18" x2="52" y2="18" stroke="#FB923C" strokeWidth={2.5} strokeLinecap="round" />
                {/* Morning Mist Particles */}
                <circle cx="-24" cy="28" r="2.2" fill="#FED7AA" className="animate-[particleRiseHighDef_3.6s_ease-out_infinite]" />
                <circle cx="28" cy="24" r="2.5" fill="#F472B6" className="animate-[particleRiseHighDef_4.2s_ease-out_infinite_1s]" />
              </g>
            )}

            {/* 2E. SUNSET EMBER & CORAL DUSK & EVENING STAR (17:00, 18:00, 19:00) */}
            {(theme.archetype === "sunset_ember" ||
              theme.archetype === "coral_dusk" ||
              theme.archetype === "evening_star") && (
              <g id="archetype-sunset-group">
                {/* Sunset / Dusk Core Orb (r=34px) */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  filter="url(#highDefMoodFilter)"
                />
                {/* Specular Rim Arc */}
                <path d="M -22 -20 A 28 28 0 0 1 20 -20 A 24 24 0 0 0 -22 -20 Z" fill="#FFFFFF" opacity={0.8} />

                {/* Twilight Horizon Bands */}
                <ellipse cx="0" cy="10" rx="31" ry="8" fill={theme.strokeColor} opacity={0.4} />
                <ellipse cx="0" cy="19" rx="26" ry="5" fill="#581C87" opacity={0.35} />

                {/* Evening Star Gleam if hour 19 */}
                {theme.archetype === "evening_star" && (
                  <g
                    transform="translate(28, -26)"
                    className="animate-[starGleamHighDef_3.2s_ease-in-out_infinite]"
                    style={{ transformOrigin: "0 0" }}
                  >
                    <polygon points="0,-16 4,0 0,16 -4,0" fill="#FFFFFF" />
                    <polygon points="-16,0 0,4 16,0 0,-4" fill="#FFFFFF" />
                    <circle cx="0" cy="0" r="3" fill="#FDE047" />
                  </g>
                )}

                {/* Rising Warm Embers */}
                <circle cx="-18" cy="44" r="3" fill={theme.accentColor} className="animate-[particleRiseHighDef_3.4s_ease-out_infinite]" />
                <circle cx="26" cy="34" r="2.4" fill={theme.coreColors[0]} className="animate-[particleRiseHighDef_4.0s_ease-out_infinite_0.8s]" />
                <circle cx="8" cy="52" r="2.8" fill={theme.strokeColor} className="animate-[particleRiseHighDef_3.6s_ease-out_infinite_1.6s]" />
              </g>
            )}

            {/* 3. SUN ARCHETYPES (Sunrise, Morning Dew, Joyful, Halo, Sakura, Zenith Diamond, Solaris Crown, Siesta Cloud, Teatime, Amber Leaf, Apricot) */}
            {theme.category === "day" &&
              theme.archetype !== "dawn_horizon" && (
              <g id="archetype-sun-group">
                {/* Rotating Sunbeams (12 distinct stylized rays) */}
                <g className="animate-[sunSpinSlowHighDef_28s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <polygon
                      key={angle}
                      points="-4,-38 0,-49 4,-38"
                      fill={theme.accentColor}
                      stroke={theme.strokeColor}
                      strokeWidth={1}
                      transform={`rotate(${angle})`}
                      opacity={0.85}
                    />
                  ))}
                </g>

                {/* Golden Sun Core Medallion (r=34px, enlarged ~25%) */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="url(#highDefCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2}
                  className="animate-[sunPulseGlowHighDef_3.2s_ease-in-out_infinite]"
                  style={{ transformOrigin: "0 0" }}
                  filter="url(#highDefMoodFilter)"
                />

                {/* Sharp Specular Glass Reflection Arc */}
                <path
                  d="M -22 -20 A 28 28 0 0 1 20 -20 A 24 24 0 0 0 -22 -20 Z"
                  fill="#FFFFFF"
                  opacity={0.82}
                />

                {/* Archetype Specific Overlays: */}

                {/* 3A. JOYFUL SUN (08:00): Anime Chibi Face */}
                {theme.archetype === "joyful_sun" && (
                  <g id="sun-chibi-face" stroke="#78350F" strokeWidth={1.8} strokeLinecap="round" fill="none">
                    {/* Left happy eye */}
                    <path d="M -13 -3 Q -8 -9 -3 -3" />
                    {/* Right playful winking eye */}
                    <path d="M 5 -3 L 13 0 L 5 3" />
                    {/* Cheerful anime smile */}
                    <path d="M -5 5 Q 0 10 5 5" fill="#EF4444" fillOpacity={0.7} />
                    {/* Pink Sun Cheeks */}
                    <circle cx="-13" cy="3" r="3.8" fill="#F472B6" opacity={0.65} stroke="none" />
                    <circle cx="13" cy="3" r="3.8" fill="#F472B6" opacity={0.65} stroke="none" />
                  </g>
                )}

                {/* 3B. MORNING DEW (07:00): Sparkling Crystal Dewdrop */}
                {theme.archetype === "morning_dew" && (
                  <g id="sun-dewdrop" transform="translate(18, 14)">
                    <path
                      d="M 0 -12 C 0 -12, 10 0, 10 8 C 10 14, 4 18, 0 18 C -4 18, -10 14, -10 8 C -10 0, 0 -12, 0 -12 Z"
                      fill="#7DD3FC"
                      stroke="#0284C7"
                      strokeWidth={1.6}
                      opacity={0.9}
                    />
                    <circle cx="-3" cy="6" r="2.2" fill="#FFFFFF" />
                  </g>
                )}

                {/* 3C. HALO SUN (09:00): Floating Solar Corona Halo Ring */}
                {theme.archetype === "halo_sun" && (
                  <ellipse
                    cx="0"
                    cy="-14"
                    rx="32"
                    ry="10"
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth={2.4}
                    opacity={0.9}
                    filter="drop-shadow(0 0 6px rgba(253, 224, 71, 0.8))"
                  />
                )}

                {/* 3D. SPRING SAKURA SUN (10:00): Floating Sakura Petals */}
                {theme.archetype === "sakura_sun" && (
                  <g id="sun-sakura-petals">
                    <path
                      d="M -24 36 C -28 32, -32 38, -26 44 C -20 40, -22 34, -24 36 Z"
                      fill="#F472B6"
                      stroke="#EC4899"
                      strokeWidth={1}
                      className="animate-[particleRiseHighDef_3.8s_ease-out_infinite]"
                    />
                    <path
                      d="M 28 32 C 32 28, 36 34, 30 40 C 24 36, 26 30, 28 32 Z"
                      fill="#FBCFE8"
                      stroke="#EC4899"
                      strokeWidth={1}
                      className="animate-[particleRiseHighDef_4.4s_ease-out_infinite_1s]"
                    />
                  </g>
                )}

                {/* 3E. ZENITH DIAMOND (11:00): Prismatic Cross Gleam */}
                {theme.archetype === "zenith_diamond" && (
                  <g id="sun-diamond-gleam" className="animate-[starGleamHighDef_3s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <polygon points="0,-22 4,0 0,22 -4,0" fill="#FFFFFF" opacity={0.9} />
                    <polygon points="-22,0 0,4 22,0 0,-4" fill="#FFFFFF" opacity={0.9} />
                    <circle cx="0" cy="0" r="4.5" fill="#6366F1" opacity={0.8} />
                  </g>
                )}

                {/* 3F. HIGH NOON SOLARIS CROWN (12:00): Ornate Flame Crown */}
                {theme.archetype === "solaris_crown" && (
                  <g id="sun-flame-crown" transform="translate(0, -32)">
                    <polygon
                      points="-24,10 -18,-6 -8,4 0,-14 8,4 18,-6 24,10"
                      fill="#FEF08A"
                      stroke="#D97706"
                      strokeWidth={1.8}
                      filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.7))"
                    />
                    <circle cx="0" cy="-14" r="2.5" fill="#DC2626" />
                  </g>
                )}

                {/* 3G. SIESTA CLOUD (13:00): Soft White Cloud Pillow */}
                {theme.archetype === "siesta_cloud" && (
                  <g id="sun-siesta-cloud" transform="translate(0, 14)">
                    <path
                      d="M -32 14 Q -24 0 -8 2 Q 8 -10 26 2 Q 42 0 42 16 Q 42 28 20 28 L -20 28 Q -36 28 -32 14 Z"
                      fill="#FFFFFF"
                      stroke="#0284C7"
                      strokeWidth={1.8}
                      filter="drop-shadow(0 2px 6px rgba(56, 189, 248, 0.4))"
                    />
                  </g>
                )}

                {/* 3H. TEATIME HONEY SUN (14:00): Warm Rising Matcha Steam */}
                {theme.archetype === "teatime_sun" && (
                  <g id="sun-teatime-steam" stroke="#B45309" strokeWidth={1.6} strokeLinecap="round" fill="none">
                    <path d="M -8 18 Q -4 10 -8 2" className="animate-[particleRiseHighDef_3.2s_ease-out_infinite]" />
                    <path d="M 0 20 Q 4 12 0 4" className="animate-[particleRiseHighDef_3.6s_ease-out_infinite_0.6s]" />
                    <path d="M 8 18 Q 12 10 8 2" className="animate-[particleRiseHighDef_3.4s_ease-out_infinite_1.2s]" />
                  </g>
                )}

                {/* 3I. AMBER LEAF (15:00): Autumn Leaf Flutter */}
                {theme.archetype === "amber_leaf" && (
                  <g id="sun-amber-leaf" transform="translate(24, 18)">
                    <path
                      d="M 0 0 C -6 -8, -12 2, 0 12 C 12 2, 6 -8, 0 0 Z"
                      fill="#FB923C"
                      stroke="#C2410C"
                      strokeWidth={1.2}
                      className="animate-[particleRiseHighDef_3.8s_ease-out_infinite]"
                    />
                  </g>
                )}

                {/* 3J. APRICOT SUN (16:00): Breeze Ribbon */}
                {theme.archetype === "apricot_sun" && (
                  <g id="sun-apricot-breeze" stroke="#FDA4AF" strokeWidth={1.6} fill="none" strokeLinecap="round">
                    <path d="M -30 22 Q 0 34 30 18" opacity={0.8} />
                    <circle cx="24" cy="36" r="2.5" fill="#FB7185" className="animate-[particleRiseHighDef_3.6s_ease-out_infinite]" />
                  </g>
                )}

                {/* Warm Floating Sun Motes */}
                <circle cx="-24" cy="42" r="2.8" fill={theme.accentColor} className="animate-[particleRiseHighDef_3.6s_ease-out_infinite]" />
                <circle cx="28" cy="38" r="2.4" fill={theme.coreColors[0]} className="animate-[particleRiseHighDef_4.2s_ease-out_infinite_1s]" />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
}
