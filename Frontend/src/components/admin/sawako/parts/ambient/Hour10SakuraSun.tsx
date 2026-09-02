import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour10SakuraSun({ theme }: HourlyArchetypeProps) {
  return (
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
  );
}
