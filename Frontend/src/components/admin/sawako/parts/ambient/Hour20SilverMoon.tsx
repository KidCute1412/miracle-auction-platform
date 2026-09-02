import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour20SilverMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-silver-moon-group">
                {/* Silver Moon Orb with Cute Lunar Crater Faces */}
                <circle cx="0" cy="0" r="36" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                <circle cx="-16" cy="-16" r="6" fill="#93C5FD" opacity={0.35} />
                <circle cx="-6" cy="-24" r="4" fill="#93C5FD" opacity={0.3} />

                {/* Bunny & Mochi Mortar */}
                <g transform="translate(6, 4)">
                  <path d="M -22 8 L -10 8 L -12 24 L -20 24 Z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth={2} />

                  {/* Elastic Gooey Mochi Dough Stretching */}
                  <g transform="translate(-16, 8)" className="animate-[mochiGooeyStretch_1.6s_ease-in-out_infinite]">
                    <ellipse cx="0" cy="0" rx="8" ry="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth={2} />
                  </g>

                  {/* Mallet Pounding Down */}
                  <g transform="translate(-16, 4)" className="animate-[malletSmashLoop_1.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <line x1="0" y1="0" x2="-14" y2="-16" stroke="#92400E" strokeWidth={2.6} strokeLinecap="round" />
                    <rect x="-20" y="-22" width="10" height="6" rx="2" fill="#D97706" stroke="#92400E" strokeWidth={1.8} />
                  </g>

                  {/* Hardworking Tsukimi Bunny with Ruby Eyes & Nose */}
                  <g transform="translate(4, 0)">
                    <ellipse cx="0" cy="10" rx="11" ry="10" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={2.2} />
                    <circle cx="0" cy="-4" r="9.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={2.2} />
                    {/* Wiggling Ears */}
                    <ellipse cx="-4" cy="-18" rx="3.2" ry="8.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={1.8} />
                    <ellipse cx="-4" cy="-18" rx="1.6" ry="5.5" fill="#FDA4AF" />
                    <ellipse cx="4" cy="-18" rx="3.2" ry="8.5" fill="#FFFFFF" stroke="#60A5FA" strokeWidth={1.8} />
                    <ellipse cx="4" cy="-18" rx="1.6" ry="5.5" fill="#FDA4AF" />
                    {/* Cute Determined Bunny Face */}
                    <circle cx="-3" cy="-4" r="2" fill="#DC2626" />
                    <circle cx="3" cy="-4" r="2" fill="#DC2626" />
                    <circle cx="-4" cy="-5" r="0.8" fill="#FFFFFF" />
                    <circle cx="2" cy="-5" r="0.8" fill="#FFFFFF" />
                    <polygon points="0,-1 -1.5,-2.5 1.5,-2.5" fill="#FDA4AF" />
                    <path d="M -2 1 Q 0 3 2 1" stroke="#DC2626" strokeWidth={1.4} fill="none" />
                  </g>
                </g>
              </g>
  );
}
