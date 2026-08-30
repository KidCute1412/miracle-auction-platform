import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoMouthProps {
  expression: SawakoExpression;
  mouthOpenRatio: number;
}

export function SawakoMouth({ expression, mouthOpenRatio }: SawakoMouthProps) {
  if (expression === "pout") {
    return (
      <g>
        <path d="M 352 460 Q 368 450 384 460" stroke="#be123c" strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (expression === "dizzy") {
    return (
      <g>
        <path d="M 350 458 Q 359 450 368 458 Q 377 466 386 458" stroke="#be123c" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (expression === "happy") {
    return (
      <g>
        <path d="M 350 450 Q 368 472 386 450 Z" fill="#f43f5e" stroke="#be123c" strokeWidth={2.5} />
      </g>
    );
  }

  // Lip-Sync Speaking Cadence: Mouth opening and closing
  const openHeight = 4 + mouthOpenRatio * 14;

  return (
    <g>
      {/* Upper Lip Shadow Line */}
      <path
        d={`M 352 452 Q 368 ${450 - mouthOpenRatio * 2} 384 452`}
        stroke="#be123c"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      {/* Dynamic Parted Mouth Opening */}
      <ellipse
        cx="368"
        cy={454 + mouthOpenRatio * 3}
        rx={10 + mouthOpenRatio * 4}
        ry={openHeight / 2}
        fill="#fda4af"
        stroke="#be123c"
        strokeWidth={2}
      />
      {/* Lower Lip Shadow */}
      <path
        d={`M 356 ${458 + openHeight} Q 368 ${462 + openHeight} 380 ${458 + openHeight}`}
        stroke="#e1828f"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
