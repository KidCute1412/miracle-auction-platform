import React from "react";

interface SawakoHairFrontProps {
  isDragging: boolean;
}

/**
 * SawakoHairFront - Signature Long Front Silky Locks
 * Features the two iconic strands draping over the chest in front of the shoulders
 * modeled accurately from "Sawako better.jpg".
 */
export function SawakoHairFront({ isDragging }: SawakoHairFrontProps) {
  return (
    <g
      id="sawako-hair-front"
      className={
        isDragging
          ? "animate-[ghostFloat_1.2s_ease-in-out_infinite]"
          : "transition-transform duration-300"
      }
    >
      {/* ===================== LEFT FRONT LOCK ===================== */}
      {/* Outer Silky Strand Silhouette */}
      <path
        d="
          M 210 295
          C 195 380, 202 520, 218 680
          C 224 740, 222 790, 226 805
          C 230 790, 236 740, 238 680
          C 242 520, 246 380, 240 300
          Z
        "
        fill="#14151C"
        stroke="#101115"
        strokeWidth={2}
      />
      {/* Left Hair Inner Sheen Line */}
      <path
        d="M 224 380 C 220 520, 226 660, 228 760"
        stroke="#3A3C4D"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* ===================== RIGHT FRONT LOCK ===================== */}
      {/* Outer Silky Strand Silhouette */}
      <path
        d="
          M 526 295
          C 541 380, 534 520, 518 680
          C 512 740, 514 790, 510 805
          C 506 790, 500 740, 498 680
          C 494 520, 490 380, 496 300
          Z
        "
        fill="#14151C"
        stroke="#101115"
        strokeWidth={2}
      />
      {/* Right Hair Inner Sheen Line */}
      <path
        d="M 512 380 C 516 520, 510 660, 508 760"
        stroke="#3A3C4D"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </g>
  );
}
