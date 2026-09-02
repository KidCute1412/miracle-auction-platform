import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour13SiestaCloud({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-siesta-group" className="animate-[siestaNapBreathing_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Round Warm Sun Body */}
                <circle
                  cx="0"
                  cy="-4"
                  r="32"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Cute Frog Sleep Eye Mask Pushed Up on Sun's Forehead */}
                <g transform="translate(0, -22)">
                  {/* Green Eye Mask Band */}
                  <rect x="-16" y="-6" width="32" height="12" rx="6" fill="#34D399" stroke="#059669" strokeWidth={2} />
                  {/* Frog Mask Big Eyes */}
                  <circle cx="-8" cy="-6" r="4.5" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  <circle cx="-8" cy="-6" r="2.2" fill="#065F46" />
                  <circle cx="-8.8" cy="-6.8" r="0.8" fill="#FFFFFF" />

                  <circle cx="8" cy="-6" r="4.5" fill="#34D399" stroke="#059669" strokeWidth={1.8} />
                  <circle cx="8" cy="-6" r="2.2" fill="#065F46" />
                  <circle cx="7.2" cy="-6.8" r="0.8" fill="#FFFFFF" />
                </g>

                {/* Sweet Peaceful Sleeping Face ( ◡ ‿ ◡ ) */}
                {/* Left Sleeping Eye */}
                <path d="M -14 -4 Q -9 -9 -4 -4" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                {/* Right Sleeping Eye */}
                <path d="M 4 -4 Q 9 -9 14 -4" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="3" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="1.5" x2="-19" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="1.5" x2="-16" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="3" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="1.5" x2="13" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="1.5" x2="16" y2="4.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Smiling Sleeping Mouth */}
                <path d="M -3 5 Q 0 8.5 3 5" stroke={theme.strokeColor} strokeWidth={2} fill="none" strokeLinecap="round" />

                {/* Cute Snot/Dream Bubble from Nose */}
                <circle cx="5" cy="4" r="3.2" fill="#BAE6FD" stroke="#0284C7" strokeWidth={1} opacity={0.85} className="animate-[snotBubblePulse_2.8s_ease-in-out_infinite]" />

                {/* Fluffy Soft Cloud Blanket Tucked Around Chest */}
                <g className="animate-[cloudBlanketSway_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 22px" }}>
                  <path
                    d="
                      M -38 18
                      C -48 6, -32 -2, -18 6
                      C -10 -4, 10 -4, 18 6
                      C 32 -2, 48 6, 38 18
                      C 44 28, 20 34, 0 32
                      C -20 34, -44 28, -38 18
                      Z
                    "
                    fill="#F0F9FF"
                    stroke="#38BDF8"
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    filter="url(#chibiDropShadow)"
                  />
                  {/* Fluffy Cloud Shading Highlights */}
                  <path d="M -22 15 Q 0 9 22 15" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
                </g>

                {/* Cozy Floating Cartoon Zzz */}
                <text x="18" y="-18" fill={theme.strokeColor} fontSize="18" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite]">
                  Z
                </text>
                <text x="28" y="-28" fill="#38BDF8" fontSize="13" fontWeight="900" className="animate-[zzzCleanFloat_2.8s_ease-out_infinite_0.9s]">
                  z
                </text>
              </g>
  );
}
