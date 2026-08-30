import React from "react";

/**
 * SawakoHairBack - Sleek, Straight Horizontal-Cut Long Back Hair
 * 
 * Features:
 * - Rendered behind legs and feet (Layer 0), ensuring boots & legs are always in front of hair
 * - Iconic Kuronuma Sawako Japanese Hime-cut: clean, straight horizontal blunt cut
 * - High-luster obsidian gradient with delicate silky grain lines
 */
export function SawakoHairBack() {
  return (
    <g id="sawako-hair-back" className="sawako-hair-back">
      <defs>
        {/* Deep Silky Hair Gradient - Obsidian with subtle violet-indigo undertone */}
        <linearGradient id="sawakoHairBaseBack" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C1D26" />
          <stop offset="25%" stopColor="#14151E" />
          <stop offset="65%" stopColor="#0E0F15" />
          <stop offset="100%" stopColor="#07080B" />
        </linearGradient>
      </defs>

      {/* ===================== SLEEK, STRAIGHT HORIZONTAL-CUT BACK HAIR ===================== */}
      <g id="back-hair-layer">
        {/* Main Straight Obsidian Hair Silhouette with Clean Horizontal Blunt Cut */}
        <path
          d="
            M 368 135
            C 260 135, 178 210, 165 335
            C 154 450, 157 620, 168 750
            C 172 775, 176 805, 182 810
            Q 186 820, 202 820
            L 534 820
            Q 550 820, 554 810
            C 560 805, 564 775, 568 750
            C 579 620, 582 450, 571 335
            C 558 210, 476 135, 368 135
            C 568 210, 481 135, 368 135
            Z
          "
          fill="url(#sawakoHairBaseBack)"
          stroke="#07080B"
          strokeWidth={2.4}
        />

        {/* Left Sleek Straight Depth Shading */}
        <path
          d="
            M 180 360
            C 166 480, 168 640, 178 770
            C 182 795, 186 810, 194 815
            L 224 815
            C 214 790, 202 650, 200 420
            Z
          "
          fill="#08090C"
          opacity="0.65"
        />

        {/* Right Sleek Straight Depth Shading */}
        <path
          d="
            M 556 360
            C 570 480, 568 640, 558 770
            C 554 795, 550 810, 542 815
            L 512 815
            C 522 790, 534 650, 536 420
            Z
          "
          fill="#08090C"
          opacity="0.65"
        />

        {/* Delicate Silky Hair Texture Grain Lines Running Straight Down */}
        <path d="M 194 440 C 182 550, 184 670, 190 800" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 215 500 C 205 620, 202 720, 208 830" stroke="#2B2D3A" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 542 440 C 554 550, 552 670, 546 800" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 521 500 C 531 620, 534 720, 528 830" stroke="#2B2D3A" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity="0.5" />

        {/* ===================== DIRECTION 1: CRISP ANIME RIM LIGHT LINES ===================== */}
        {/* Slender, crisp silver-indigo edge contours that cleanly separate hair on Dark Mode */}
        <path
          d="M 167 335 C 155 450, 159 620, 170 750 C 174 775, 178 805, 184 810 Q 188 820, 202 820"
          stroke="#5E6584"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <path
          d="M 569 335 C 581 450, 577 620, 566 750 C 562 775, 558 805, 552 810 Q 548 820, 534 820"
          stroke="#5E6584"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <line
          x1="202"
          y1="819"
          x2="534"
          y2="819"
          stroke="#687094"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.7}
        />
      </g>
    </g>
  );
}
