import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour11ZenithDiamond({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-diamond-group" className="animate-[bobaSipJoy_2.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* 8 Soft Sun Rays Revolving in Background */}
                <g className="animate-[sunRaySlowTurn_20s_linear_infinite]" style={{ transformOrigin: "0 -4px" }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <polygon
                      key={angle}
                      points="-4,-44 0,-54 4,-44"
                      fill="#FDE047"
                      stroke="#F59E0B"
                      strokeWidth={1.4}
                      transform={`rotate(${angle} 0 -4)`}
                    />
                  ))}
                </g>

                {/* Plump Golden Sun Body */}
                <circle
                  cx="0"
                  cy="-4"
                  r="33"
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Happy Closed Blissful Eyes (^ ^) */}
                <path d="M -16 -8 Q -10 -14 -4 -8" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                <path d="M 0 -8 Q 6 -14 12 -8" stroke="#7C2D12" strokeWidth={2.6} fill="none" strokeLinecap="round" />

                {/* Rosy Pink Cheeks with White Chibi Highlights (//) */}
                <ellipse cx="-18" cy="-1" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="-19.5" y1="-2.5" x2="-21" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="-16.5" y1="-2.5" x2="-18" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                <ellipse cx="14" cy="-1" rx="5" ry="4" fill="#FB7185" opacity={0.85} />
                <line x1="12.5" y1="-2.5" x2="11" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />
                <line x1="15.5" y1="-2.5" x2="14" y2="0.5" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" />

                {/* Tiny Chibi Mouth Sipping Around Straw */}
                <ellipse cx="-5" cy="0" rx="3.5" ry="3.5" fill="#7C2D12" />

                {/* The Cute Transparent Boba Milk Tea Cup */}
                <g transform="translate(6, 12)">
                  {/* Cup Body Filled with Caramel Milk Tea */}
                  <path
                    d="M -9 0 L -6 20 Q -6 24 -3 24 L 7 24 Q 10 24 10 20 L 13 0 Z"
                    fill="#FDE68A"
                    stroke="#78350F"
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />

                  {/* Chewy Black Tapioca Boba Pearls */}
                  <circle cx="-2" cy="18" r="2.4" fill="#1C1917" />
                  <circle cx="3" cy="19" r="2.4" fill="#1C1917" />
                  <circle cx="7" cy="18" r="2.2" fill="#1C1917" />
                  <circle cx="1" cy="14" r="2.2" fill="#1C1917" />
                  <circle cx="5" cy="13" r="2.2" fill="#1C1917" />

                  {/* Sealed Cup Lid */}
                  <ellipse cx="2" cy="0" rx="12" ry="3" fill="#F43F5E" stroke="#78350F" strokeWidth={1.8} />

                  {/* Striped Boba Straw leading to Sun's Mouth */}
                  <line x1="-11" y1="-12" x2="1" y2="16" stroke="#3B82F6" strokeWidth={3.5} strokeLinecap="round" />
                  <line x1="-11" y1="-12" x2="1" y2="16" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="3 3" />

                  {/* Boba Pearl Being Sucked Up through Straw! */}
                  <circle cx="-5" cy="-2" r="2" fill="#1C1917" className="animate-[bobaPearlRise_1.6s_ease-in_infinite]" />

                  {/* Two Cute Chubby Hands Gripping the Cup */}
                  <circle cx="-7" cy="12" r="4.5" fill="#FED7AA" stroke="#78350F" strokeWidth={1.6} />
                  <circle cx="11" cy="12" r="4.5" fill="#FED7AA" stroke="#78350F" strokeWidth={1.6} />
                </g>

                {/* Blissful Sparkle of Cold Refreshment */}
                <polygon
                  points="26,-22 27.5,-19 30.5,-19 28,-17.5 29,-14.5 26,-16.5 23,-14.5 24,-17.5 21.5,-19 24.5,-19"
                  fill="#FEF08A"
                  stroke="#F59E0B"
                  strokeWidth={0.8}
                  className="animate-[pulse_1.8s_ease-in-out_infinite]"
                />
              </g>
  );
}
