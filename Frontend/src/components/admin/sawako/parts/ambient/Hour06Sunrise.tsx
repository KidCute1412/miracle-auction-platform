import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour06Sunrise({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-sunrise-group" className="animate-[sunStretchWake_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Soft Rounded Petal Sun Rays Gently Rotating */}
                <g className="animate-[sunRayGentleRotate_24s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <ellipse
                      key={angle}
                      cx="0"
                      cy="-44"
                      rx="5"
                      ry="8"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.6}
                      transform={`rotate(${angle})`}
                    />
                  ))}
                </g>

                {/* Two Chubby Little Arms Stretching Up to Greet the Day */}
                <g className="animate-[stretchArmsReach_3.6s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                  {/* Left Arm & Fist */}
                  <path d="M -22 0 Q -32 -14 -24 -24" stroke={theme.strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                  <circle cx="-24" cy="-24" r="5" fill="#FED7AA" stroke={theme.strokeColor} strokeWidth={1.8} />

                  {/* Right Arm & Fist */}
                  <path d="M 22 0 Q 32 -14 24 -24" stroke={theme.strokeColor} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                  <circle cx="24" cy="-24" r="5" fill="#FED7AA" stroke={theme.strokeColor} strokeWidth={1.8} />
                </g>

                {/* Plump Golden Sun Body */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Sleepy Curved Eyes (^ ^) */}
                <path d="M -15 -4 Q -9 -11 -3 -4" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M 3 -4 Q 9 -11 15 -4" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Blushing Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="4" rx="5.5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="2.5" x2="-21" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="2.5" x2="-18" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="4" rx="5.5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="2.5" x2="15" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="2.5" x2="18" y2="5.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Cute Morning Yawn / Smile Mouth */}
                <ellipse cx="0" cy="7" rx="5" ry="6.5" fill="#F43F5E" stroke="#7C2D12" strokeWidth={1.8} />
                <path d="M -3.5 9 Q 0 6.5 3.5 9" fill="#FDA4AF" />

                {/* Tiny Fresh Morning Sparkle */}
                <polygon
                  points="0,-24 1.5,-21 4.5,-21 2,-19.5 3,-16.5 0,-18.5 -3,-16.5 -2,-19.5 -4.5,-21 -1.5,-21"
                  fill="#FFFFFF"
                  opacity={0.9}
                />
              </g>
  );
}
