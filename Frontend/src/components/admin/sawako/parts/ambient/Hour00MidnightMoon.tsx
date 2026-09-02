import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour00MidnightMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-crescent-group" className="animate-[moonSleepBreathing_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Full Moon Orb Body */}
                <circle cx="0" cy="4" r="33" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-8" r="5" fill="#C7D2FE" opacity={0.5} />
                <circle cx="18" cy="-6" r="4.5" fill="#C7D2FE" opacity={0.45} />

                {/* Peaceful Sleeping Eyes ( ◡ ‿ ◡ ) */}
                <path d="M -13 0 Q -8 -4 -3 0" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 3 0 Q 8 -4 13 0" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Eyelashes */}
                <line x1="-11" y1="-2" x2="-13" y2="-5" stroke={theme.strokeColor} strokeWidth={1.2} strokeLinecap="round" />
                <line x1="11" y1="-2" x2="13" y2="-5" stroke={theme.strokeColor} strokeWidth={1.2} strokeLinecap="round" />

                {/* Rosy Sleeping Cheeks with White Chibi Highlights */}
                <ellipse cx="-16" cy="8" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="6.5" x2="-19" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="6.5" x2="-16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="8" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="6.5" x2="13" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="6.5" x2="16" y2="9.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Contented Sleeping Smile */}
                <path d="M -3 9 Q 0 12 3 9" stroke={theme.strokeColor} strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Soft Fluffy Cloud Pillow Hugged Across Tummy */}
                <g transform="translate(0, 16)">
                  <path
                    d="
                      M -22 6
                      C -28 0, -18 -6, -8 -2
                      C -2 -8, 12 -8, 16 -2
                      C 26 -6, 32 2, 26 10
                      C 22 16, -6 18, -18 12
                      C -24 10, -24 8, -22 6
                      Z
                    "
                    fill="#FFFFFF"
                    stroke={theme.strokeColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 2px 4px rgba(99, 102, 241, 0.25))"
                  />
                </g>

                {/* Adorable Striped Nightcap Perched on Top of Head */}
                <g transform="translate(0, -24)">
                  {/* Cone of the Nightcap Drooping Down to Right */}
                  <path
                    d="
                      M -20 0
                      C -18 -18, -6 -24, 6 -20
                      C 18 -16, 28 -8, 28 6
                      C 22 2, -2 -2, -20 0
                      Z
                    "
                    fill="#4F46E5"
                    stroke={theme.strokeColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {/* Purple Accent Stripe */}
                  <path
                    d="
                      M -10 -12
                      C -2 -17, 8 -15, 14 -11
                      L 18 -4
                      C 10 -9, -2 -10, -8 -6
                      Z
                    "
                    fill="#818CF8"
                    opacity={0.9}
                  />

                  {/* Soft White Cloud-like Fur Brim */}
                  <rect x="-24" y="-2" width="46" height="9" rx="4.5" fill="#FFFFFF" stroke={theme.strokeColor} strokeWidth={1.8} />

                  {/* Little Star Pom-pom Dangling at the Tip of Nightcap */}
                  <g transform="translate(28, 8)">
                    <g className="animate-[nightcapBellSway_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                      <polygon
                        points="0,0 2,4 6,4 3,7 4,11 0,8.5 -4,11 -3,7 -6,4 -2,4"
                        fill="#FDE047"
                        stroke="#CA8A04"
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                </g>

                {/* Dreamy Floating Cartoon Zzz from the Moon */}
                <text x="-4" y="-12" fill={theme.strokeColor} fontSize="15" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="6" y="-22" fill="#818CF8" fontSize="11" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
  );
}
