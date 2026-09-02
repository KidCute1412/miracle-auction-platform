import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour14TeatimeSun({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
