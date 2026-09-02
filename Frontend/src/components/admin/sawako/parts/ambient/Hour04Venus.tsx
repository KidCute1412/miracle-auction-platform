import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour04Venus({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
