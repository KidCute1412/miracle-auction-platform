import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour18CoralDusk({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-dusk-group" className="animate-[duskGlowFloat_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Round Coral Dusk Body */}
                <circle cx="0" cy="0" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Big Sparkling Anime Eyes Wondering at the Evening Star */}
                {/* Left Eye */}
                <ellipse cx="-13" cy="-4" rx="5" ry="6.5" fill="#3B0764" />
                <circle cx="-14.5" cy="-6.5" r="2.2" fill="#FFFFFF" />
                <circle cx="-11" cy="-1.5" r="1.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="13" cy="-4" rx="5" ry="6.5" fill="#3B0764" />
                <circle cx="11.5" cy="-6.5" r="2.2" fill="#FFFFFF" />
                <circle cx="15" cy="-1.5" r="1.2" fill="#FFFFFF" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="5" rx="5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="3.5" x2="-21" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="3.5" x2="-18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="5" rx="5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="3.5" x2="15" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="3.5" x2="18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Contented Smile */}
                <path d="M -3 7 Q 0 10.5 3 7" stroke="#3B0764" strokeWidth={2} fill="none" strokeLinecap="round" />

                {/* Two Cute Little Hands Cupped Together Holding the Star */}
                <circle cx="-7" cy="19" r="3.8" fill="#FCE7F3" stroke={theme.strokeColor} strokeWidth={1.5} />
                <circle cx="7" cy="19" r="3.8" fill="#FCE7F3" stroke={theme.strokeColor} strokeWidth={1.5} />

                {/* Glowing First Evening Star Hovering Between Hands */}
                <g transform="translate(0, 14)">
                  {/* Star Glow Halo */}
                  <circle cx="0" cy="0" r="11" fill="#FEF08A" opacity={0.35} className="animate-[pulse_2s_ease-in-out_infinite]" />

                  {/* Star Body Floating */}
                  <g className="animate-[firstStarGlowFloat_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <polygon
                      points="0,-8 2.5,-2.5 8,-2.5 3.8,1 5.5,7 0,3.5 -5.5,7 -3.8,1 -8,-2.5 -2.5,-2.5"
                      fill="#FDE047"
                      stroke="#CA8A04"
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                    {/* Cute Tiny Eyes on Star */}
                    <circle cx="-1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="1.8" cy="0.5" r="0.8" fill="#78350F" />
                    <circle cx="-2.2" cy="0.2" r="0.3" fill="#FFFFFF" />
                    <circle cx="1.4" cy="0.2" r="0.3" fill="#FFFFFF" />
                    {/* Tiny Pink Cheeks on Star */}
                    <circle cx="-3" cy="2" r="0.7" fill="#FB7185" />
                    <circle cx="3" cy="2" r="0.7" fill="#FB7185" />
                  </g>
                </g>

                {/* Twilight Twinkling Sparkles in Sky */}
                <polygon
                  points="-24,-20 -22.5,-17 -19.5,-17 -22,-15.5 -21,-12.5 -24,-14.5 -27,-12.5 -26,-15.5 -28.5,-17 -25.5,-17"
                  fill="#FDE047"
                  className="animate-[pulse_2s_ease-in-out_infinite]"
                />
                <polygon
                  points="26,-18 27.5,-15 30.5,-15 28,-13.5 29,-10.5 26,-12.5 23,-10.5 24,-13.5 21.5,-15 24.5,-15"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
              </g>
  );
}
