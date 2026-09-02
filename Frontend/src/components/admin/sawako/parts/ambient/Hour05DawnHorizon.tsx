import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour05DawnHorizon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-dawn-group">
                {/* Mountain Range */}
                <path d="M -60 26 L -28 -6 L 12 24 L 54 10 L 60 46 L -60 46 Z" fill="#6366F1" stroke="#312E81" strokeWidth={2.4} opacity={0.8} />

                {/* Peek-a-Boo Sun Jumping Up & Down */}
                <g className="animate-[peekABooHop_3.2s_ease-in-out_infinite]">
                  <circle cx="0" cy="4" r="32" fill="url(#boldCoreGrad)" stroke={theme.strokeColor} strokeWidth={2.8} filter="url(#chibiDropShadow)" />
                  {/* Two Cute Hands Popping Up Saying "Peek-a-Boo!" */}
                  <circle cx="-20" cy="-14" r="6.5" fill="#FDBA74" stroke="#EA580C" strokeWidth={2} />
                  <circle cx="20" cy="-14" r="6.5" fill="#FDBA74" stroke="#EA580C" strokeWidth={2} />

                  {/* Big Goofy Smiling Face */}
                  <circle cx="-10" cy="-2" r="4" fill="#7C2D12" />
                  <circle cx="10" cy="-2" r="4" fill="#7C2D12" />
                  <circle cx="-11" cy="-4" r="1.5" fill="#FFFFFF" />
                  <circle cx="9" cy="-4" r="1.5" fill="#FFFFFF" />
                  <path d="M -7 7 Q 0 16 7 7 Z" fill="#EF4444" stroke="#7C2D12" strokeWidth={1.8} />
                  <circle cx="-16" cy="6" r="4.5" fill="#F472B6" opacity={0.8} />
                  <circle cx="16" cy="6" r="4.5" fill="#F472B6" opacity={0.8} />
                </g>

                {/* Horizon Line */}
                <line x1="-62" y1="26" x2="62" y2="26" stroke="#FB923C" strokeWidth={3.5} strokeLinecap="round" />
              </g>
  );
}
