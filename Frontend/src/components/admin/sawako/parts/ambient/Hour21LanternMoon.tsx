import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour21LanternMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-lantern-moon-group" className="animate-[cozyTeaMoonFloat_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Full Moon Orb Body */}
                <circle cx="0" cy="0" r="34" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Soft Lunar Craters */}
                <circle cx="-16" cy="-14" r="5.5" fill="#FDE047" opacity={0.45} />
                <circle cx="18" cy="-12" r="4.5" fill="#FDE047" opacity={0.4} />

                {/* Contented Sleeping Eyes Savoring Warm Tea ( ˘ ‿ ˘ ) */}
                <path d="M -14 -4 Q -9 -8 -4 -4" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 4 -4 Q 9 -8 14 -4" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="4" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="2.5" x2="-19" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="2.5" x2="-16" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="4" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="2.5" x2="13" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="2.5" x2="16" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Peaceful Smiling Mouth */}
                <path d="M -3 4 Q 0 8 3 4" stroke="#78350F" strokeWidth={1.8} fill="none" strokeLinecap="round" />

                {/* Cozy Ceramic Mug with Tiny Pink Heart */}
                <g transform="translate(0, 5)">
                  {/* Mug Handle */}
                  <path d="M 8 11 C 13 11, 13 18, 7 19" fill="none" stroke="#D97706" strokeWidth={1.6} strokeLinecap="round" />

                  {/* Mug Body */}
                  <path d="M -8 9 L -6 21 Q 0 23 6 21 L 8 9 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth={1.6} strokeLinejoin="round" />

                  {/* Warm Drink Surface */}
                  <ellipse cx="0" cy="9" rx="7.5" ry="2.2" fill="#B45309" />

                  {/* Cute Tiny Pink Heart on Mug */}
                  <path d="M 0 13.5 C -0.8 12, -2.5 12.8, -2.5 14 C -2.5 15.5, 0 17, 0 17.5 C 0 17, 2.5 15.5, 2.5 14 C 2.5 12.8, 0.8 12, 0 13.5 Z" fill="#F43F5E" />

                  {/* Two Cute Little Hands Hugging Mug */}
                  <circle cx="-8" cy="15" r="3.4" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />
                  <circle cx="8" cy="15" r="3.4" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.3} />

                  {/* Aromatic Steam Rising into Floating Heart */}
                  <g className="animate-[steamHeartRise_2.6s_ease-in-out_infinite]">
                    {/* Wispy Steam Line */}
                    <path d="M -2 4 Q -6 -2 0 -6 Q 6 -10 2 -16" stroke="#FEF08A" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.75} />
                    {/* Floating Heart Steam */}
                    <path d="M 0 -19 C -0.8 -20.5, -2.5 -19.7, -2.5 -18.5 C -2.5 -17, 0 -15.5, 0 -15 C 0 -15.5, 2.5 -17, 2.5 -18.5 C 2.5 -19.7, 0.8 -20.5, 0 -19 Z" fill="#FDA4AF" opacity={0.85} />
                  </g>
                </g>

                {/* Night Sky Twinkle Sparkles */}
                <polygon
                  points="-24,-20 -22.5,-17 -19.5,-17 -22,-15.5 -21,-12.5 -24,-14.5 -27,-12.5 -26,-15.5 -28.5,-17 -25.5,-17"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_0.8s]"
                />
                <polygon
                  points="24,-20 25.5,-17 28.5,-17 26,-15.5 27,-12.5 24,-14.5 21,-12.5 22,-15.5 19.5,-17 22.5,-17"
                  fill="#FEF08A"
                  className="animate-[pulse_2s_ease-in-out_infinite_1.4s]"
                />
              </g>
  );
}
