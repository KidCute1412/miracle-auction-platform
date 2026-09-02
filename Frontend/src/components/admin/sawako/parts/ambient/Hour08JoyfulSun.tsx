import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour08JoyfulSun({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
