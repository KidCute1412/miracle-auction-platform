import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour19EveningStar({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-evening-star-group" className="animate-[crescentRocking_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Fairytale Crescent Moon Silhouette */}
                <path
                  d="
                    M -4 -42
                    C 22 -36, 44 -18, 42 4
                    C 40 24, 20 40, -4 44
                    C 14 26, 18 -6, 2 -24
                    C -0.5 -32, -2 -38, -4 -42
                    Z
                  "
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  strokeLinejoin="round"
                  filter="url(#chibiDropShadow)"
                />

                {/* Sweet Sleeping Moon Face on Crescent Belly */}
                {/* Smiling Curved Eye */}
                <path d="M 17 -4 Q 23 -9 29 -4" stroke="#78350F" strokeWidth={2.2} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheek with White Chibi Highlights */}
                <ellipse cx="23" cy="4" rx="4" ry="2.8" fill="#FB7185" opacity={0.85} />
                <line x1="21.5" y1="2.5" x2="20" y2="5.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />
                <line x1="24.5" y1="2.5" x2="23" y2="5.5" stroke="#FFFFFF" strokeWidth={1} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M 18 9 Q 22 13 26 9" stroke="#78350F" strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Two Cute Little Hands Resting on the Crescent Inner Rim */}
                <circle cx="10" cy="11" r="3.2" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />
                <circle cx="13" cy="17" r="3.2" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />

                {/* Little Baby Evening Star Floating in Crescent Hollow */}
                <g transform="translate(-8, -4)">
                  {/* Star Glow Halo */}
                  <circle cx="0" cy="0" r="11" fill="#FEF08A" opacity={0.4} className="animate-[pulse_2s_ease-in-out_infinite]" />

                  {/* Floating Baby Star */}
                  <g className="animate-[crescentStarGlow_2.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <polygon
                      points="0,-8 2.5,-2.5 8,-2.5 3.8,1 5.5,7 0,3.5 -5.5,7 -3.8,1 -8,-2.5 -2.5,-2.5"
                      fill="#FDE047"
                      stroke={theme.strokeColor}
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                    {/* Cute Tiny Eyes on Star */}
                    <circle cx="-1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="1.8" cy="0.5" r="0.8" fill="#78350F" />
                    {/* Tiny Pink Cheeks */}
                    <circle cx="-3" cy="2" r="0.7" fill="#FB7185" />
                    <circle cx="3" cy="2" r="0.7" fill="#FB7185" />
                  </g>
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-24,-24 -22.5,-21 -19.5,-21 -22,-19.5 -21,-16.5 -24,-18.5 -27,-16.5 -26,-19.5 -28.5,-21 -25.5,-21"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
                <polygon
                  points="-18,28 -16.5,31 -13.5,31 -16,32.5 -15,35.5 -18,33.5 -21,35.5 -20,32.5 -22.5,31 -19.5,31"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_1.4s]"
                />
              </g>
  );
}
