import React from "react";
import type { HourlyArchetypeProps } from "./types";

export function Hour22AzureMoon({ theme }: HourlyArchetypeProps) {
  return (
    <g id="archetype-azure-group" className="animate-[jellyfishJetPulse_2.6s_easeInOutSine_infinite]" style={{ transformOrigin: "0 0" }}>
                {/* Pure Flowing Fairy Tale Azure Crescent Moon Facing Right ) */}
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

                {/* Glowing Eyes Firmly on Solid Moon Body */}
                <circle cx="24" cy="-4" r="4" fill="#0284C7" />
                <circle cx="36" cy="-4" r="4" fill="#0284C7" />
                <circle cx="23" cy="-6" r="1.5" fill="#FFFFFF" />
                <circle cx="35" cy="-6" r="1.5" fill="#FFFFFF" />
                {/* Cute Smiling Mouth & Bioluminescent Cheek */}
                <path d="M 26 8 Q 30 12 34 8" stroke="#0284C7" strokeWidth={2} fill="none" strokeLinecap="round" />
                <circle cx="42" cy="4" r="4.5" fill="#38BDF8" opacity={0.8} />

                {/* Long Galaxy Tentacles Flying Like Jet Exhaust */}
                <g className="animate-[tentacleLagWave_2.6s_ease-in-out_infinite]" style={{ transformOrigin: "12px 46px" }}>
                  <path d="M 8 48 Q 2 68 16 88" stroke="#38BDF8" strokeWidth={3} fill="none" strokeLinecap="round" />
                  <path d="M 18 46 Q 26 72 16 94" stroke="#A5F3FC" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <path d="M 28 42 Q 36 64 30 84" stroke="#818CF8" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                </g>
              </g>
  );
}
