import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour17SunsetEmber({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
