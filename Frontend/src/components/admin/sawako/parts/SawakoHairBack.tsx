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
            C 255 135, 168 210, 150 335
            C 138 450, 142 620, 154 750
            C 160 820, 164 880, 172 905
            Q 176 915, 195 915
            L 541 915
            Q 560 915, 564 905
            C 572 880, 576 820, 582 750
            C 594 620, 598 450, 586 335
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
            M 166 360
            C 152 480, 154 670, 166 820
            C 170 870, 174 905, 185 910
            L 222 910
            C 212 840, 195 680, 192 420
            Z
          "
          fill="#08090C"
          opacity="0.65"
        />

        {/* Right Sleek Straight Depth Shading */}
        <path
          d="
            M 570 360
            C 584 480, 582 670, 570 820
            C 566 870, 562 905, 551 910
            L 514 910
            C 524 840, 541 680, 544 420
            Z
          "
          fill="#08090C"
          opacity="0.65"
        />

        {/* Delicate Silky Hair Texture Grain Lines Running Straight Down */}
        <path d="M 184 440 C 172 580, 174 740, 180 890" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 215 500 C 205 640, 202 770, 208 895" stroke="#2B2D3A" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 552 440 C 564 580, 562 740, 556 890" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 521 500 C 531 640, 534 770, 528 895" stroke="#2B2D3A" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity="0.5" />

        {/* ===================== DIRECTION 1: CRISP ANIME RIM LIGHT LINES ===================== */}
        {/* Slender, crisp silver-indigo edge contours that cleanly separate hair on Dark Mode */}
        <path
          d="M 152 335 C 140 450, 144 620, 156 750 C 162 820, 166 880, 174 905 Q 178 915, 195 915"
          stroke="#5E6584"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <path
          d="M 584 335 C 592 450, 590 620, 580 750 C 570 820, 566 880, 562 905 Q 558 915, 541 915"
          stroke="#5E6584"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <line
          x1="195"
          y1="914"
          x2="541"
          y2="914"
          stroke="#687094"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.7}
        />
      </g>
    </g>
  );
}
