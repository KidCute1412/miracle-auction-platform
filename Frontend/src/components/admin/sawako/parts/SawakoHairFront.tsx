import React from "react";

interface SawakoHairFrontProps {
  isDragging: boolean;
}

/**
 * SawakoHairFront - Signature Long Front Silky Hair Strands
 * Matches the straight, glossy front locks draping over the chest from "Sawako better.jpg"
 * Features:
 * - Dynamic breeze flutter when dragging in mid-air
 * - Multi-layered silky gloss highlights
 */
export function SawakoHairFront({ isDragging }: SawakoHairFrontProps) {
  return (
    <g
      id="sawako-hair-front"
      className={
        isDragging
          ? "animate-[airborneHairFlutter_0.5s_ease-in-out_infinite]"
          : "transition-transform duration-300"
      }
      style={{
        transformOrigin: "368px 300px",
      }}
    >
      {/* ===================== LEFT FRONT SILKY LOCK ===================== */}
      <g id="left-front-strand">
        {/* Main Strand Silhouette */}
        <path
          d="
            M 212 295
            C 196 380, 202 520, 218 680
            C 224 740, 222 795, 226 810
            C 230 795, 236 740, 238 680
            C 244 520, 246 380, 240 300
            Z
          "
          fill="#13141C"
          stroke="#090A0D"
          strokeWidth={2.2}
        />
        {/* Inner Shadow Strand */}
        <path
          d="
            M 214 340
            C 205 450, 210 580, 222 700
            C 225 730, 225 760, 226 780
            C 228 760, 230 730, 232 700
            C 236 580, 240 450, 238 340
            Z
          "
          fill="#0B0C10"
          opacity="0.6"
        />
        {/* Silky Gloss Highlight Line */}
        <path
          d="M 224 380 C 220 520, 226 660, 228 765"
          stroke="#424659"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        {/* Secondary Hair Thread */}
        <path
          d="M 230 420 C 228 540, 232 640, 232 720"
          stroke="#2A2C3A"
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* ===================== RIGHT FRONT SILKY LOCK ===================== */}
      <g id="right-front-strand">
        {/* Main Strand Silhouette */}
        <path
          d="
            M 524 295
            C 540 380, 534 520, 518 680
            C 512 740, 514 795, 510 810
            C 506 795, 500 740, 498 680
            C 492 520, 490 380, 496 300
            Z
          "
          fill="#13141C"
          stroke="#090A0D"
          strokeWidth={2.2}
        />
        {/* Inner Shadow Strand */}
        <path
          d="
            M 522 340
            C 531 450, 526 580, 514 700
            C 511 730, 511 760, 510 780
            C 508 760, 506 730, 504 700
            C 500 580, 496 450, 498 340
            Z
          "
          fill="#0B0C10"
          opacity="0.6"
        />
        {/* Silky Gloss Highlight Line */}
        <path
          d="M 512 380 C 516 520, 510 660, 508 765"
          stroke="#424659"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        {/* Secondary Hair Thread */}
        <path
          d="M 506 420 C 508 540, 504 640, 504 720"
          stroke="#2A2C3A"
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>
    </g>
  );
}
