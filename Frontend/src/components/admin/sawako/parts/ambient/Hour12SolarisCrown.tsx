import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour12SolarisCrown({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-crown-group" className="animate-[royalCrownFloat_3.2s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 12 Radiant Royal Sunburst Rays Revolving in Background */}
                <g className="animate-[royalRaysRotate_24s_linear_infinite]" style={{ transformOrigin: "0 4px" }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                    <polygon
                      key={angle}
                      points="-5,-42 0,-56 5,-42"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      transform={`rotate(${angle} 0 4)`}
                    />
                  ))}
                </g>

                {/* Plump Golden Sun King Body */}
                <circle
                  cx="0"
                  cy="4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Preserved #sun-flame-crown: Gorgeous 5-Point Royal Gold Crown Sitting Gracefully on Top of Head */}
                <g id="sun-flame-crown" transform="translate(0, -28)" className="animate-[crownGleam_2.6s_ease-in-out_infinite]">
                  {/* Golden Peaks with Curved Base Contour Hugging the Round Head */}
                  <path
                    d="M -18 2 L -18 -8 L -10 -2 L 0 -18 L 10 -2 L 18 -8 L 18 2 Q 0 -3 -18 2 Z"
                    fill="#FBBF24"
                    stroke="#B45309"
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                    filter="drop-shadow(0 2px 5px rgba(245, 158, 11, 0.5))"
                  />

                  {/* Crown Base Gold Arch Band following skull curvature */}
                  <path d="M -18 2 Q 0 -3 18 2" stroke="#B45309" strokeWidth={3.8} fill="none" strokeLinecap="round" />
                  <path d="M -18 2 Q 0 -3 18 2" stroke="#F59E0B" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                  {/* Jewels along the Crown Arch Band */}
                  <circle cx="-11" cy="0.5" r="1.5" fill="#EF4444" />
                  <circle cx="-5.5" cy="-1.5" r="1.5" fill="#3B82F6" />
                  <circle cx="0" cy="-2.5" r="1.7" fill="#10B981" />
                  <circle cx="5.5" cy="-1.5" r="1.5" fill="#3B82F6" />
                  <circle cx="11" cy="0.5" r="1.5" fill="#EF4444" />

                  {/* Center Peak Jewel: Large Gleaming Red Ruby */}
                  <polygon points="0,-23 3.5,-18 0,-13 -3.5,-18" fill="#EF4444" stroke="#991B1B" strokeWidth={1} />

                  {/* Outer Jewels on Peaks */}
                  <circle cx="-18" cy="-8" r="2.2" fill="#10B981" stroke="#047857" strokeWidth={0.8} />
                  <circle cx="-10" cy="-2" r="1.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={0.8} />
                  <circle cx="10" cy="-2" r="1.8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth={0.8} />
                  <circle cx="18" cy="-8" r="2.2" fill="#10B981" stroke="#047857" strokeWidth={0.8} />
                </g>

                {/* Big Sparkling Royal Anime Eyes */}
                <ellipse cx="-11" cy="4" rx="4.2" ry="5.5" fill="#78350F" />
                <circle cx="-12.5" cy="2" r="1.8" fill="#FFFFFF" />
                <circle cx="-9.5" cy="6.5" r="1" fill="#FFFFFF" />

                <ellipse cx="11" cy="4" rx="4.2" ry="5.5" fill="#78350F" />
                <circle cx="9.5" cy="2" r="1.8" fill="#FFFFFF" />
                <circle cx="12.5" cy="6.5" r="1" fill="#FFFFFF" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="11" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="9.5" x2="-21" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="9.5" x2="-18" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="18" cy="11" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="16.5" y1="9.5" x2="15" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="19.5" y1="9.5" x2="18" y2="12.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Confident, Sweet Royal Smile */}
                <path d="M -5 13 Q 0 19 5 13" stroke="#78350F" strokeWidth={2.4} fill="none" strokeLinecap="round" />

                {/* Twinkling Crown Sparkles Beside Head */}
                <polygon
                  points="-28,-18 -26.5,-15 -23.5,-15 -26,-13.5 -25,-10.5 -28,-12.5 -31,-10.5 -30,-13.5 -32.5,-15 -29.5,-15"
                  fill="#FFFFFF"
                  opacity={0.9}
                  className="animate-[pulse_2s_ease-in-out_infinite]"
                />
                <polygon
                  points="28,-18 29.5,-15 32.5,-15 30,-13.5 31,-10.5 28,-12.5 25,-10.5 26,-13.5 23.5,-15 26.5,-15"
                  fill="#FFFFFF"
                  opacity={0.9}
                  className="animate-[pulse_2s_ease-in-out_infinite_1s]"
                />
              </g>
  );
}
