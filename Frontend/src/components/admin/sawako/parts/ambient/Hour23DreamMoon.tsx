import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour23DreamMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-dream-group">
                {/* Pure Flowing Fairy Tale Slumber Crescent Moon Facing Right ) */}
                <path
                  d="
                    M -6 -52
                    C 28 -44, 52 -18, 50 16
                    C 48 40, 26 58, -4 64
                    C 18 50, 26 28, 22 6
                    C 18 -16, 8 -38, -6 -52
                    Z
                  "
                  fill="url(#boldCoreGrad)"
                  stroke={theme.strokeColor}
                  strokeWidth={2.8}
                  filter="url(#chibiDropShadow)"
                />

                {/* Moon's Happy Face Looking Down at the Catch */}
                <ellipse cx="24" cy="-6" rx="4" ry="5" fill="#4C1D95" />
                <circle cx="22" cy="-8" r="1.6" fill="#FFFFFF" />
                {/* Playful Winking Eye */}
                <path d="M 34 -6 L 40 -3 L 34 0" stroke="#4C1D95" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                {/* Cheerful Smile (^‿^) */}
                <path d="M 24 8 Q 30 14 36 8" stroke="#4C1D95" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                {/* Rosy Pink Cheek */}
                <circle cx="38" cy="2" r="5" fill="#F472B6" opacity={0.8} />

                {/* Little Chibi Hand Holding the Rod */}
                <circle cx="10" cy="10" r="4.5" fill="#FAF5FF" stroke="#7C3AED" strokeWidth={2} />

                {/* Arched Bamboo Fishing Pole Bending under Fish Weight */}
                <g className="animate-[fishingRodBob_1.8s_ease-in-out_infinite]" style={{ transformOrigin: "10px 10px" }}>
                  {/* Clean Curved Fishing Rod */}
                  <path d="M 10 10 Q -10 -10 -30 -20" stroke="#B45309" strokeWidth={3} fill="none" strokeLinecap="round" />
                  <circle cx="-30" cy="-20" r="2.5" fill="#F59E0B" />

                  {/* Clean Fishing Line Dropping Down */}
                  <line x1="-30" y1="-20" x2="-30" y2="12" stroke="#E9D5FF" strokeWidth={1.8} strokeDasharray="3 2" />

                  {/* Caught Star-Fish Wiggling & Flopping on the Line! */}
                  <g transform="translate(-30, 14)" className="animate-[starFishFlop_1.4s_ease-in-out_infinite]" style={{ transformOrigin: "0 0" }}>
                    {/* Metal Hook */}
                    <path d="M 0 0 L 0 5 Q 0 9 4 9 Q 7 9 6 6" stroke="#94A3B8" strokeWidth={1.6} fill="none" />

                    {/* Star Body */}
                    <polygon
                      points="0,-3 3,5 11,5 5,10 7,18 0,13 -7,18 -5,10 -11,5 -3,5"
                      fill="#FEF08A"
                      stroke="#F59E0B"
                      strokeWidth={2}
                    />

                    {/* Surprised Fish Eyes (⊙ ⊙) */}
                    <circle cx="-3" cy="7" r="2.5" fill="#FFFFFF" stroke="#B45309" strokeWidth={1} />
                    <circle cx="3" cy="7" r="2.5" fill="#FFFFFF" stroke="#B45309" strokeWidth={1} />
                    <circle cx="-3" cy="7" r="1.2" fill="#1E293B" />
                    <circle cx="3" cy="7" r="1.2" fill="#1E293B" />

                    {/* Cute Fish Mouth Hooked */}
                    <ellipse cx="0" cy="11" rx="2" ry="1.5" fill="#EF4444" />

                    {/* Flapping Fish Tail Fin */}
                    <path d="M 0 17 Q -6 26 -8 30 Q 0 26 0 23 Q 0 26 8 30 Q 6 26 0 17 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth={1.6} />
                  </g>
                </g>
              </g>
  );
}
