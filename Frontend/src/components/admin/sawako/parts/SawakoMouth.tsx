import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoMouthProps {
  expression: SawakoExpression;
  mouthOpenRatio: number;
}

/**
 * SawakoMouth - Expressive Anime Chibi Mouth with Lip-Sync Cadence
 * Provides tailored expressions for normal speaking, pout, happy smile, and dizzy wobbly mouth.
 */
export function SawakoMouth({ expression, mouthOpenRatio }: SawakoMouthProps) {
  // Pout Expression: Cute tiny grumbling pout (>3<)
  if (expression === "pout") {
    return (
      <g id="mouth-pout">
        <path
          d="M 356 448 Q 368 438 380 448"
          stroke="#be123c"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Soft lower pout lip shade */}
        <path
          d="M 362 453 Q 368 456 374 453"
          stroke="#f43f5e"
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
          stroke="#be123c"
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
          d="M 352 438 Q 368 464 384 438 Z"
          fill="#be123c"
          stroke="#be123c"
          strokeWidth={2}
        />
        {/* Cute rosy tongue */}
        <path
          d="M 358 448 Q 368 444 378 448 Q 368 464 358 448 Z"
          fill="#fda4af"
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
          stroke="#be123c"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Lip-Sync Speaking Cadence: Dynamic opening and closing
  const openHeight = 4 + mouthOpenRatio * 16;
  const openWidth = 9 + mouthOpenRatio * 5;

  return (
    <g id="mouth-speaking">
      {/* Dynamic parted mouth opening */}
      <ellipse
        cx="368"
        cy={446 + mouthOpenRatio * 2}
        rx={openWidth}
        ry={openHeight / 2}
        fill="#881337"
        stroke="#be123c"
        strokeWidth={2}
      />
      {/* Tongue visible when speaking */}
      {mouthOpenRatio > 0.25 && (
        <path
          d={`M ${368 - openWidth * 0.6} ${447 + openHeight * 0.15} Q 368 ${447 + openHeight * 0.05} ${368 + openWidth * 0.6} ${447 + openHeight * 0.15} Q 368 ${446 + openHeight * 0.55} ${368 - openWidth * 0.6} ${447 + openHeight * 0.15} Z`}
          fill="#fda4af"
        />
      )}
      {/* Upper Lip definition */}
      <path
        d={`M 354 444 Q 368 ${442 - mouthOpenRatio * 2} 382 444`}
        stroke="#be123c"
        strokeWidth={2.8}
        strokeLinecap="round"
        fill="none"
      />
      {/* Lower Lip hint */}
      <path
        d={`M 360 ${447 + openHeight} Q 368 ${451 + openHeight} 376 ${447 + openHeight}`}
        stroke="#fb7185"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </g>
  );
}
