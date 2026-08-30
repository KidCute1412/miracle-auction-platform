import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoMouthProps {
  expression: SawakoExpression;
  mouthOpenRatio: number;
}

/**
 * SawakoMouth - Expressive Anime Chibi Mouth with Lip-Sync Cadence
 * Faithfully matches Sawako's innocent, slightly parted curiosity mouth from "Sawako better.jpg".
 */
export function SawakoMouth({ expression, mouthOpenRatio }: SawakoMouthProps) {
  // Pout Expression: Cute tiny grumbling pout (>3<)
  if (expression === "pout") {
    return (
      <g id="mouth-pout">
        <path
          d="M 356 448 Q 368 436 380 448"
          stroke="#B91C1C"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
        {/* Soft lower pout lip shadow */}
        <path
          d="M 362 453 Q 368 456 374 453"
          stroke="#F87171"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>
    );
  }

  // Dizzy Expression: Wavy trembling mouth (@~@)
  if (expression === "dizzy") {
    return (
      <g id="mouth-dizzy">
        <path
          d="M 352 446 Q 360 438 368 446 Q 376 454 384 446"
          stroke="#B91C1C"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Happy Expression: Radiant wide smile with cute pink tongue
  if (expression === "happy") {
    return (
      <g id="mouth-happy">
        {/* Mouth cavity */}
        <path
          d="M 352 438 Q 368 466 384 438 Z"
          fill="#881337"
          stroke="#9F1239"
          strokeWidth={1.8}
        />
        {/* Cute rosy tongue */}
        <path
          d="M 358 448 Q 368 444 378 448 Q 368 465 358 448 Z"
          fill="#FDA4AF"
        />
        {/* Upper smile line */}
        <path
          d="M 350 438 Q 368 442 386 438"
          stroke="#881337"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Sleepy Expression: Gentle sleeping relaxed mouth
  if (expression === "sleepy") {
    return (
      <g id="mouth-sleepy">
        <path
          d="M 362 446 Q 368 450 374 446"
          stroke="#9F1239"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Default / Speaking State:
  // In "Sawako better.jpg", her resting mouth is a soft, small, open oval showing mild surprise/innocence.
  const baselineHeight = 5.5; // Natural resting open height from photo
  const openHeight = baselineHeight + mouthOpenRatio * 14;
  const openWidth = 8 + mouthOpenRatio * 5;

  return (
    <g id="mouth-default-speaking">
      {/* Soft Mouth Interior Cavity */}
      <ellipse
        cx="368"
        cy={446 + mouthOpenRatio * 2}
        rx={openWidth}
        ry={openHeight / 2}
        fill="#7F1D1D"
        stroke="#991B1B"
        strokeWidth={1.8}
      />
      {/* Inner Pink Tongue / Soft Tone */}
      <ellipse
        cx="368"
        cy={447 + openHeight * 0.15}
        rx={openWidth * 0.72}
        ry={openHeight * 0.28}
        fill="#FDA4AF"
      />

      {/* Upper Lip Definition Curve */}
      <path
        d={`M ${368 - openWidth - 2} 444 Q 368 ${442 - mouthOpenRatio * 2} ${368 + openWidth + 2} 444`}
        stroke="#881337"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />

      {/* Subtle Lower Lip Shade below */}
      <path
        d={`M ${368 - openWidth * 0.6} ${448 + openHeight * 0.52} Q 368 ${451 + openHeight * 0.52} ${368 + openWidth * 0.6} ${448 + openHeight * 0.52}`}
        stroke="#FB7185"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </g>
  );
}
