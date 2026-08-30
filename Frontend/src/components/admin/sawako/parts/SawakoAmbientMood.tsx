import React from "react";
import type { SawakoTimeOfDay } from "../types";

interface SawakoAmbientMoodProps {
  timeOfDay?: SawakoTimeOfDay;
  isDragging?: boolean;
  onCycleTimeOfDay?: () => void;
}

/**
 * SawakoAmbientMood - Prominent Right-Aligned Real-Time Celestial Weather Accents
 * 
 * Structural Guarantee:
 * - Outer <g transform="translate(605, 315)">: Pure XML positioning on the viewer's right (character's left).
 * - Inner <g className="animate-[...]">: Relative CSS animation.
 * - This nested structure permanently prevents CSS keyframe transform overrides from snapping the item to (0, 0).
 * 
 * 3 Weather Items:
 * 1. Night (🌙): A prominent pearlescent crescent moon with glowing lunar aura and sparkling companion star.
 * 2. Sunset (🌇): A radiant twilight sunset orb with rising rose-lavender dusk embers.
 * 3. Day (☀️): A cheerful golden chibi sun medallion with rotating sunbeams and smiling anime face.
 */
export function SawakoAmbientMood({
  timeOfDay = "day",
  isDragging = false,
  onCycleTimeOfDay,
}: SawakoAmbientMoodProps) {
  return (
    <g
      id="sawako-ambient-mood"
      className="transition-opacity duration-500 ease-in-out"
      style={{ opacity: isDragging ? 0.25 : 1 }}
    >
      <style>{`
        @keyframes moonFloatProminent {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(3px, -10px) rotate(3deg);
          }
        }
        @keyframes sunSpinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes sunPulseGlow {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
        @keyframes starTwinkleGleam {
          0%, 100% {
            transform: scale(0.85) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.25) rotate(25deg);
            opacity: 1;
          }
        }
        @keyframes emberFloat {
          0% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            transform: translate(6px, -20px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Weather Item Interactive Clickable Wrapper */}
      <g
        id="weather-mood-interactive-group"
        className="cursor-pointer pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onCycleTimeOfDay?.();
        }}
        role="button"
        tabIndex={0}
        aria-label={`Current Weather: ${timeOfDay}. Click to change mood.`}
      >
        {/* ===================== 1. NIGHT MODE: PROMINENT CRESCENT MOON (🌙) ===================== */}
        {timeOfDay === "night" && (
          <g id="ambient-crescent-moon" transform="translate(605, 135)">
            <g
              className="animate-[moonFloatProminent_5.2s_ease-in-out_infinite]"
              style={{ transformOrigin: "0 0" }}
            >
              <defs>
                {/* Luminous Silvery-Blue Lunar Aura */}
                <radialGradient id="bigMoonHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E0F2FE" stopOpacity={0.65} />
                  <stop offset="50%" stopColor="#93C5FD" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                </radialGradient>

                {/* Pearlescent Moon Surface Gradient */}
                <linearGradient id="crescentPearlescent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#F0F9FF" />
                  <stop offset="85%" stopColor="#E0F2FE" />
                  <stop offset="100%" stopColor="#BAE6FD" />
                </linearGradient>
              </defs>

              {/* Broad Soft Lunar Aura Disc */}
              <circle cx="10" cy="5" r="54" fill="url(#bigMoonHalo)" />

              {/* Elegant, Prominent Chibi Crescent Moon (~100px curve) */}
              <path
                d="
                  M -6 -42
                  C 24 -32, 40 -6, 36 26
                  C 32 46, 18 58, -4 62
                  C 20 50, 28 30, 24 10
                  C 20 -10, 8 -30, -6 -42
                  Z
                "
                fill="url(#crescentPearlescent)"
                stroke="#93C5FD"
                strokeWidth={1.8}
                strokeLinejoin="round"
                filter="drop-shadow(0 0 10px rgba(186, 230, 253, 0.75))"
              />

              {/* Inner Lunar Silk Highlight Reflection */}
              <path
                d="
                  M -2 -34
                  C 18 -26, 30 -4, 26 22
                  C 24 38, 14 48, -1 52
                  C 14 40, 20 22, 17 6
                  C 14 -10, 5 -24, -2 -34
                  Z
                "
                fill="#FFFFFF"
                opacity={0.75}
              />

              {/* Delicate Lunar Crater Accents */}
              <circle cx="21" cy="22" r="3.2" fill="#BAE6FD" opacity={0.4} />
              <circle cx="25" cy="5" r="2.2" fill="#BAE6FD" opacity={0.35} />
              <circle cx="16" cy="-12" r="2.6" fill="#BAE6FD" opacity={0.3} />

              {/* Sparkling Diamond Companion Star (✦) Perched by Crescent Horn */}
              <g
                transform="translate(28, -26)"
                className="animate-[starTwinkleGleam_3.2s_ease-in-out_infinite]"
                style={{ transformOrigin: "0 0" }}
              >
                <polygon points="0,-12 3,0 0,12 -3,0" fill="#FFFFFF" />
                <polygon points="-12,0 0,3 12,0 0,-3" fill="#FFFFFF" />
                <circle cx="0" cy="0" r="2.5" fill="#BAE6FD" />
              </g>

              {/* Secondary Micro Star */}
              <g
                transform="translate(-16, 44) scale(0.65)"
                className="animate-[starTwinkleGleam_3.8s_ease-in-out_infinite_1s]"
                style={{ transformOrigin: "0 0" }}
              >
                <polygon points="0,-10 2.5,0 0,10 -2.5,0" fill="#FFFFFF" opacity={0.85} />
                <polygon points="-10,0 0,2.5 10,0 0,-2.5" fill="#FFFFFF" opacity={0.85} />
              </g>
            </g>
          </g>
        )}

        {/* ===================== 2. SUNSET MODE: PROMINENT TWILIGHT SUNSET ORB (🌇) ===================== */}
        {timeOfDay === "sunset" && (
          <g id="ambient-sunset-orb" transform="translate(605, 135)">
            <g
              className="animate-[moonFloatProminent_5.2s_ease-in-out_infinite]"
              style={{ transformOrigin: "0 0" }}
            >
              <defs>
                <radialGradient id="sunsetHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F472B6" stopOpacity={0.65} />
                  <stop offset="60%" stopColor="#C084FC" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                </radialGradient>
                <linearGradient id="sunsetDisc" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="40%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>

              {/* Glowing Sunset Aura */}
              <circle cx="0" cy="0" r="48" fill="url(#sunsetHalo)" />

              {/* Sunset Orb */}
              <circle
                cx="0"
                cy="0"
                r="28"
                fill="url(#sunsetDisc)"
                stroke="#F472B6"
                strokeWidth={1.8}
                filter="drop-shadow(0 0 8px rgba(251, 113, 133, 0.65))"
              />

              {/* Twilight Horizon Band */}
              <ellipse cx="0" cy="8" rx="26" ry="6" fill="#A855F7" opacity={0.4} />

              {/* Twilight Floating Embers */}
              <circle cx="-16" cy="38" r="2.8" fill="#F472B6" className="animate-[emberFloat_3.4s_ease-out_infinite]" />
              <circle cx="24" cy="28" r="2.2" fill="#FDE047" className="animate-[emberFloat_4.0s_ease-out_infinite_0.8s]" />
              <circle cx="6" cy="46" r="2.5" fill="#C084FC" className="animate-[emberFloat_3.6s_ease-out_infinite_1.6s]" />
            </g>
          </g>
        )}

        {/* ===================== 3. DAY MODE: PROMINENT CHIBI SUN MEDALLION (☀️) ===================== */}
        {timeOfDay === "day" && (
          <g id="ambient-day-sun" transform="translate(605, 135)">
            <g
              className="animate-[moonFloatProminent_5.2s_ease-in-out_infinite]"
              style={{ transformOrigin: "0 0" }}
            >
              <defs>
                <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity={0.65} />
                  <stop offset="60%" stopColor="#FBBF24" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </radialGradient>
                <linearGradient id="sunDisc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF9C3" />
                  <stop offset="50%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Warm Sun Aura */}
              <circle cx="0" cy="0" r="52" fill="url(#sunHalo)" />

              {/* Rotating Sunbeams */}
              <g className="animate-[sunSpinSlow_28s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <polygon
                    key={angle}
                    points="-4,-32 0,-42 4,-32"
                    fill="#FBBF24"
                    transform={`rotate(${angle})`}
                    opacity={0.85}
                  />
                ))}
              </g>

              {/* Golden Sun Core */}
              <circle
                cx="0"
                cy="0"
                r="26"
                fill="url(#sunDisc)"
                stroke="#F59E0B"
                strokeWidth={1.8}
                className="animate-[sunPulseGlow_3.2s_ease-in-out_infinite]"
                style={{ transformOrigin: "0 0" }}
                filter="drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
              />

              {/* Cute Anime Sun Smile Face */}
              <g id="sun-chibi-face" stroke="#78350F" strokeWidth={1.4} strokeLinecap="round" fill="none">
                {/* Happy Closed Smiling Eyes (⌒ ⌒) */}
                <path d="M -11 -3 Q -7 -8 -3 -3" />
                <path d="M 3 -3 Q 7 -8 11 -3" />
                {/* Sweet Chibi Smile */}
                <path d="M -4 4 Q 0 8 4 4" fill="#EF4444" fillOpacity={0.6} />
                {/* Pink Sun Cheeks */}
                <circle cx="-10" cy="2" r="3.2" fill="#F472B6" opacity={0.6} stroke="none" />
                <circle cx="10" cy="2" r="3.2" fill="#F472B6" opacity={0.6} stroke="none" />
              </g>

              {/* Floating Warm Sun Prism Motes */}
              <circle cx="-22" cy="36" r="2.5" fill="#FEF08A" className="animate-[emberFloat_3.6s_ease-out_infinite]" />
              <circle cx="26" cy="32" r="2.2" fill="#FBBF24" className="animate-[emberFloat_4.2s_ease-out_infinite_1s]" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
}
