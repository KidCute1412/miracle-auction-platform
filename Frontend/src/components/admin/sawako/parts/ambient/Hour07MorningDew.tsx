import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour07MorningDew({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
