import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoMouthProps {
  expression: SawakoExpression;
  mouthOpenRatio?: number;
}

/**
 * SawakoMouth - Natural Expressive Anime Chibi Mouth
 * Displays Kuronuma Sawako's innocent, slightly parted curiosity mouth from "Sawako better.jpg".
 * Keeps the mouth in its natural cute anime shape without robotic lip flapping.
 */
export function SawakoMouth({ expression }: SawakoMouthProps) {
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

  // Happy Expression: Radiant smile with cute pink tongue
  if (expression === "happy") {
    return (
      <g id="mouth-happy">
        <path
          d="M 352 438 Q 368 466 384 438 Z"
          fill="#881337"
          stroke="#9F1239"
          strokeWidth={1.8}
        />
        <path
          d="M 358 448 Q 368 444 378 448 Q 368 465 358 448 Z"
          fill="#FDA4AF"
        />
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

  // Default / Speaking Natural Resting Mouth (from Sawako better.jpg)
  // Clean, serene, delicately parted anime mouth without repetitive flapping
  return (
    <g id="mouth-default">
      {/* Soft Mouth Interior Cavity */}
      <ellipse
        cx="368"
        cy={446}
        rx={9}
        ry={4.8}
        fill="#7F1D1D"
        stroke="#991B1B"
        strokeWidth={1.6}
      />
      {/* Inner Pink Tongue Tone */}
      <ellipse
        cx="368"
        cy={447.5}
        rx={6.5}
        ry={2.4}
        fill="#FDA4AF"
      />

      {/* Upper Lip Definition Curve */}
      <path
        d="M 356 444 Q 368 442 380 444"
        stroke="#881337"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />

      {/* Subtle Lower Lip Shadow */}
      <path
        d="M 362 451 Q 368 453.5 374 451"
        stroke="#FB7185"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </g>
  );
}
