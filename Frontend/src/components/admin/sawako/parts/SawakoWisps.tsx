import React from "react";
import type { SawakoSymbol } from "../types";

interface SawakoWispsProps {
  symbol: SawakoSymbol;
}

export function SawakoWisps({ symbol }: SawakoWispsProps) {
  return (
    <g className="pointer-events-none">
      {/* Floating hitodama ghost flame on left */}
      <g transform="translate(60, 420)" className="animate-[hitodamaWisp_3s_ease-in-out_infinite]">
        <path d="M 18 0 C 36 21, 42 42, 27 51 C 12 60, -3 45, 3 24 Z" fill="#67e8f9" fillOpacity={0.65} />
        <circle cx="14" cy="36" r="8" fill="#ffffff" fillOpacity={0.9} />
      </g>

      {/* Floating hitodama ghost flame on right */}
      <g transform="translate(630, 360)" className="animate-[hitodamaWisp_3.5s_ease-in-out_infinite_0.8s]">
        <path d="M 18 0 C 36 21, 42 42, 27 51 C 12 60, -3 45, 3 24 Z" fill="#a5b4fc" fillOpacity={0.65} />
        <circle cx="14" cy="36" r="8" fill="#ffffff" fillOpacity={0.9} />
      </g>

      {/* White doodle star on left (matching Sawako better.jpg) */}
      <g transform="translate(80, 260)" className="animate-pulse opacity-85">
        <path
          d="M 0 -22 L 7 -7 L 22 -7 L 10 3.3 L 14.5 19.5 L 0 9 L -14.5 19.5 L -10 3.3 L -22 -7 L -7 -7 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* White doodle sparkle rays on right (matching Sawako better.jpg) */}
      <g transform="translate(610, 180)" className="animate-bounce opacity-85">
        <line x1="0" y1="0" x2="28" y2="28" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
        <line x1="22" y1="-22" x2="44" y2="-44" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
        <line x1="32" y1="12" x2="60" y2="12" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
      </g>

      {/* Emotion Symbols */}
      {symbol === "anger" && (
        <g transform="translate(560, 120) scale(1.6)" className="animate-bounce">
          <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth={3.5} strokeLinecap="round" />
        </g>
      )}

      {symbol === "sweat" && (
        <g transform="translate(580, 200) scale(1.6)" className="animate-pulse">
          <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
          <circle cx="4" cy="11" r="1.5" fill="#ffffff" />
        </g>
      )}

      {symbol === "sparkle" && (
        <g transform="translate(570, 130) scale(1.6)" className="animate-spin origin-[570px_130px]">
          <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#facc15" />
        </g>
      )}

      {symbol === "zzz" && (
        <g transform="translate(550, 110)" className="animate-bounce">
          <text x="0" y="24" fill="#93c5fd" fontSize="32" fontWeight="bold" fontFamily="monospace">
            Zzz..
          </text>
        </g>
      )}

      {symbol === "heart" && (
        <g transform="translate(560, 120) scale(1.8)" className="animate-ping origin-center">
          <path d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z" fill="#f43f5e" transform="rotate(45 5 5)" />
        </g>
      )}

      {symbol === "question" && (
        <g transform="translate(560, 110)" className="animate-bounce">
          <text x="0" y="32" fill="#f59e0b" fontSize="42" fontWeight="black" fontFamily="sans-serif">
            ?
          </text>
        </g>
      )}
    </g>
  );
}
