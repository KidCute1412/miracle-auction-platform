import React from "react";

interface SawakoHairFrontProps {
  isDragging: boolean;
}

export function SawakoHairFront({ isDragging }: SawakoHairFrontProps) {
  return (
    <g className={isDragging ? "animate-[ghostFloat_1.5s_ease-in-out_infinite]" : "transition-transform duration-300"}>
      {/* Left Front Silky Lock */}
      <path
        d="
          M 215 310
          C 200 420, 202 620, 200 880
          C 200 930, 192 970, 198 975
          C 204 970, 210 930, 212 880
          C 218 620, 224 420, 235 320
          Z
        "
        fill="#121217"
      />
      <path d="M 206 450 C 204 620, 206 800, 204 920" stroke="#2a2a36" strokeWidth={2} strokeLinecap="round" fill="none" />

      {/* Right Front Silky Lock */}
      <path
        d="
          M 521 310
          C 536 420, 534 620, 536 880
          C 536 930, 544 970, 538 975
          C 532 970, 526 930, 524 880
          C 518 620, 512 420, 501 320
          Z
        "
        fill="#121217"
      />
      <path d="M 530 450 C 532 620, 530 800, 532 920" stroke="#2a2a36" strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  );
}
