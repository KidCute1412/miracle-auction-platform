import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour15AmberLeaf({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-amber-group" className="animate-[sunAutumnSway_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Radiant Autumn Sun Rays */}
                <g className="animate-[sunRayGentleRotate_28s_linear_infinite]" style={{ transformOrigin: "0 4px" }}>
                  {[...Array(12)].map((_, i) => (
                    <ellipse
                      key={i}
                      cx={Math.cos((i * Math.PI) / 6) * 44}
                      cy={4 + Math.sin((i * Math.PI) / 6) * 44}
                      rx="4"
                      ry="2"
                      fill="#F59E0B"
                      opacity={0.8}
                      transform={`rotate(${i * 30}, ${Math.cos((i * Math.PI) / 6) * 44}, ${4 + Math.sin((i * Math.PI) / 6) * 44})`}
                    />
                  ))}
                </g>

                {/* Round Warm Sun Body */}
                <circle
                  cx="0"
                  cy="4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Smiling Chibi Face (^ ‿ ^) */}
                {/* Left Smiling Eye Arc */}
                <path d="M -14 -2 Q -9 -8 -4 -2" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                {/* Right Smiling Eye Arc */}
                <path d="M 4 -2 Q 9 -8 14 -2" stroke={theme.strokeColor} strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-16" cy="6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="-17.5" y1="4.5" x2="-19" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-14.5" y1="4.5" x2="-16" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="16" cy="6" rx="4.5" ry="3.5" fill="#FB7185" opacity={0.85} />
                <line x1="14.5" y1="4.5" x2="13" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="17.5" y1="4.5" x2="16" y2="7.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Sweet Open Happy Smile */}
                <path d="M -4 8 Q 0 13 4 8 Z" fill="#F43F5E" stroke={theme.strokeColor} strokeWidth={1.4} />

                {/* Two Cute Chubby Hands Resting Happily Below Cheeks */}
                <ellipse cx="-20" cy="16" rx="4.5" ry="3.5" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.6} />
                <ellipse cx="20" cy="16" rx="4.5" ry="3.5" fill="#FEF08A" stroke={theme.strokeColor} strokeWidth={1.6} />

                {/* Soft Curved Japanese Momiji Leaf Resting Safely on Top of Head (No Eye Blockage) */}
                <g transform="translate(6, -33)">
                  <g className="animate-[leafParasolWave_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    {/* Leaf Stalk / Petiole */}
                    <path d="M 0 4 Q -3 8 -6 11" stroke="#7C2D12" strokeWidth={2} fill="none" strokeLinecap="round" />

                    {/* Organic Soft-Curved Momiji Leaf Blade Spreading Upward into Sky */}
                    <path
                      d="
                        M 0 4
                        C -5 2, -12 2, -18 -3
                        C -15 -7, -19 -10, -17 -14
                        C -13 -11, -12 -13, -14 -18
                        C -10 -15, -8 -16, -10 -22
                        C -6 -18, -4 -16, 0 -25
                        C 4 -16, 6 -18, 10 -22
                        C 8 -16, 10 -15, 14 -18
                        C 12 -13, 13 -11, 17 -14
                        C 19 -10, 15 -7, 18 -3
                        C 12 2, 5 2, 0 4
                        Z
                      "
                      fill="#EA580C"
                      stroke="#9A3412"
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                      filter="drop-shadow(0 2px 4px rgba(154, 52, 18, 0.35))"
                    />
                    {/* Organic Veins */}
                    <path d="M 0 4 Q 0 -8 0 -21" stroke="#7C2D12" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                    <path d="M 0 -6 Q -6 -11 -13 -16" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -2 Q -8 -5 -14 -5" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -6 Q 6 -11 13 -16" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                    <path d="M 0 -2 Q 8 -5 14 -5" stroke="#7C2D12" strokeWidth={1} fill="none" strokeLinecap="round" />
                  </g>
                </g>
              </g>
  );
}
