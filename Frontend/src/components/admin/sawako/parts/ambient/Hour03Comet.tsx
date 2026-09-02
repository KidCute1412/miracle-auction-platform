import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour03Comet({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
