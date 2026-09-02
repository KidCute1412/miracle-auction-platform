import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour01CloudMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-cloud-moon-group" className="animate-[cloudNestFloat_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Back Cloud Puff */}
                <path
                  d="M -36 10 C -48 -6, -26 -16, -10 -10 C 2 -20, 26 -16, 32 -4 C 44 4, 42 22, 28 26 Z"
                  fill="#EDE9FE"
                  opacity={0.7}
                />

                {/* Round Moon Orb Nestled in Cloud */}
                <circle cx="0" cy="-4" r="32" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-14" r="5" fill="#DDD6FE" opacity={0.6} />
                <circle cx="18" cy="-12" r="4.5" fill="#DDD6FE" opacity={0.5} />

                {/* Happy Sleeping Eyes (^ ‿ ^) */}
                <path d="M -13 -8 Q -8 -13 -3 -8" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 3 -8 Q 8 -13 13 -8" stroke={theme.strokeColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights */}
                <ellipse cx="-16" cy="0" rx="4.5" ry="3.2" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="-1.5" x2="-19" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="-14.5" y1="-1.5" x2="-16" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                <ellipse cx="16" cy="0" rx="4.5" ry="3.2" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="-1.5" x2="13" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="17.5" y1="-1.5" x2="16" y2="1.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M -3 3 Q 0 7 3 3" stroke={theme.strokeColor} strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Front Fluffy Cloud Nest Snuggling the Moon */}
                <g className="animate-[cloudPillowBreathe_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 24px" }}>
                  <path
                    d="
                      M -48 24
                      C -54 14, -38 6, -26 12
                      C -16 2, 2 4, 12 10
                      C 24 2, 44 8, 46 20
                      C 52 28, 40 40, 24 40
                      C 10 42, -18 42, -34 38
                      C -46 36, -52 30, -48 24
                      Z
                    "
                    fill="#FFFFFF"
                    stroke={theme.strokeColor}
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 4px 6px rgba(124, 58, 237, 0.2))"
                  />
                  {/* Soft Pastel Cloud Cheeks & Sleeping Cloud Smile */}
                  <ellipse cx="-24" cy="24" rx="4" ry="2.6" fill="#DDD6FE" opacity={0.7} />
                  <ellipse cx="24" cy="24" rx="4" ry="2.6" fill="#DDD6FE" opacity={0.7} />
                  <path d="M -4 26 Q 0 30 4 26" stroke={theme.strokeColor} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-26,-24 -24.5,-21 -21.5,-21 -24,-19.5 -23,-16.5 -26,-18.5 -29,-16.5 -28,-19.5 -30.5,-21 -27.5,-21"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />

                {/* Dreamy Floating Cartoon Zzz */}
                <text x="18" y="-22" fill={theme.strokeColor} fontSize="16" fontWeight="900" className="animate-[zzzPopFly_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="28" y="-34" fill="#A855F7" fontSize="11" fontWeight="900" className="animate-[zzzPopFly_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
  );
}
