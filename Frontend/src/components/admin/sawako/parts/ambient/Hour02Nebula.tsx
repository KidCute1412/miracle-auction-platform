import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour02Nebula({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-nebula-group" className="animate-[saturnChibiFloat_3.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Slanted Saturn Ring - Back Half (Curves behind planet) */}
                <g transform="rotate(-22)">
                  <path
                    d="M -56 0 A 56 16 0 0 1 56 0"
                    stroke="#E879F9"
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                    className="animate-[saturnRingShimmer_2.4s_ease-in-out_infinite]"
                  />
                  <path
                    d="M -52 0 A 52 14 0 0 1 52 0"
                    stroke="#FEF08A"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Chibi Planet Core Body */}
                <circle
                  cx="0"
                  cy="0"
                  r="32"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Slanted Saturn Ring - Front Half (Curves gracefully in front of planet's lower belly) */}
                <g transform="rotate(-22)">
                  <path
                    d="M -56 0 A 56 16 0 0 0 56 0"
                    stroke="#E879F9"
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                    className="animate-[saturnRingShimmer_2.4s_ease-in-out_infinite]"
                  />
                  <path
                    d="M -52 0 A 52 14 0 0 0 52 0"
                    stroke="#FEF08A"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>

                {/* Little Golden Star Hairpin on Head */}
                <polygon
                  points="18,-28 19.5,-25 23,-25 20,-23 21.5,-20 18,-22 14.5,-20 16,-23 13,-25 16.5,-25"
                  fill="#FEF08A"
                  stroke="#F59E0B"
                  strokeWidth={1}
                />

                {/* Big Kawaii Starry Anime Eyes (with gentle blink) */}
                <g className="animate-[saturnEyeBlink_3.8s_ease-in-out_infinite]" style={{ transformOrigin: "0 -4px" }}>
                  {/* Left Eye */}
                  <circle cx="-11" cy="-4" r="5" fill="#1E1B4B" />
                  <circle cx="-12.5" cy="-6" r="2" fill="#FFFFFF" />
                  <circle cx="-9.5" cy="-2.5" r="1" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <circle cx="11" cy="-4" r="5" fill="#1E1B4B" />
                  <circle cx="9.5" cy="-6" r="2" fill="#FFFFFF" />
                  <circle cx="12.5" cy="-2.5" r="1" fill="#FFFFFF" />
                </g>

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="5" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="3.5" x2="-21" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="3.5" x2="-18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="5" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="3.5" x2="15" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="3.5" x2="18" y2="6.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Cute Open Happy Smile showing tongue */}
                <path d="M -4 7 Q 0 13 4 7 Z" fill="#F43F5E" stroke="#312E81" strokeWidth={1.8} strokeLinejoin="round" />
              </g>
  );
}
