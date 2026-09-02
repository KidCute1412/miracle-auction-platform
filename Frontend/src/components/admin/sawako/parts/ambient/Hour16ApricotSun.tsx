import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour16ApricotSun({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-apricot-group" className="animate-[gentleBreezeSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Soft Pastel Wind Ribbons */}
                <g className="animate-[windRibbonGentle_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <path d="M -50 12 Q -16 -8 24 16 Q 44 4 54 14" fill="none" stroke="#FDA4AF" strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
                  <path d="M -44 -18 Q 0 4 44 -14" fill="none" stroke="#F43F5E" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 4" opacity={0.7} />
                </g>

                {/* Chubby Apricot Sun Body */}
                <circle cx="0" cy="0" r="35" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />

                {/* Cute Sprout Leaf Swaying on Head */}
                <g transform="translate(0, -35)">
                  <g className="animate-[sproutLeafSway_3s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    <path d="M 0 0 Q 8 -14 16 -6 Q 8 -2 0 0 Z" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  </g>
                </g>

                {/* Happy Squinting Eyes Enjoying Cool Breeze (> <) */}
                <path d="M -15 -4 L -8 -1 L -15 2" stroke="#9F1239" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <path d="M 15 -4 L 8 -1 L 15 2" stroke="#9F1239" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Sweet Contented Smiling Mouth */}
                <path d="M -4 8 Q 0 12 4 8" stroke="#9F1239" strokeWidth={2.2} fill="none" strokeLinecap="round" />

                {/* Chubby Rosy Cheeks Breathing with Breeze */}
                <g className="animate-[gentleCheekBreathe_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  <ellipse cx="-20" cy="6" rx="8" ry="5.5" fill="#FB7185" opacity={0.85} />
                  <line x1="-22" y1="4.5" x2="-23.5" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="-19" y1="4.5" x2="-20.5" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                  <ellipse cx="20" cy="6" rx="8" ry="5.5" fill="#FB7185" opacity={0.85} />
                  <line x1="18.5" y1="4.5" x2="17" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                  <line x1="21.5" y1="4.5" x2="20" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                </g>
              </g>
  );
}
