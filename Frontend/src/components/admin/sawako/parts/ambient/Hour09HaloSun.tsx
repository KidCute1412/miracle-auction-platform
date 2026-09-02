import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour09HaloSun({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
