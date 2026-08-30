import React from "react";
import type { SawakoSymbol, SawakoExpression } from "../types";

interface SawakoWispsProps {
  symbol: SawakoSymbol;
  expression?: SawakoExpression;
  isBeingPatted?: boolean;
}

/**
 * SawakoWisps - Expressive Anime Emotion Symbols & Headpat Musical Sparkles
 * Features:
 * - Clear, elegant manga emotion icons: anger, sweat, sparkle, zzz, heart, question
 * - Floating musical notes (♪, ♫) and sweet pastel hearts when receiving headpats
 */
export function SawakoWisps({ symbol, isBeingPatted }: SawakoWispsProps) {
  if (symbol === "none" && !isBeingPatted) return null;

  return (
    <g className="pointer-events-none" id="sawako-wisps-layer">
      {/* ===================== HEADPAT MUSICAL SPARKLES (♪, ♫, ♥) ===================== */}
      {isBeingPatted && (
        <g id="headpat-musical-sparkles">
          {/* Music Note 1 */}
          <text x="290" y="90" fill="#F472B6" fontSize="34" fontWeight="bold" opacity={0.9}>
            ♪
          </text>
          {/* Music Note 2 */}
          <text x="430" y="75" fill="#EC4899" fontSize="30" fontWeight="bold" opacity={0.9}>
            ♫
          </text>
          {/* Sweet Pastel Heart */}
          <g transform="translate(365, 55) scale(1.3)" opacity={0.85}>
            <path
              d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z"
              fill="#FB7185"
              transform="rotate(45 5 5)"
            />
          </g>
        </g>
      )}

      {/* ===================== EMOTION SYMBOLS (STATIC & GENTLE) ===================== */}
      {symbol === "anger" && (
        <g transform="translate(560, 120) scale(1.6)" opacity={0.9}>
          <path
            d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10"
            stroke="#EF4444"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {symbol === "sweat" && (
        <g transform="translate(570, 190) scale(1.6)" opacity={0.9}>
          <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38BDF8" />
          <circle cx="4" cy="11" r="1.5" fill="#FFFFFF" />
        </g>
      )}

      {symbol === "sparkle" && (
        <g transform="translate(560, 130) scale(1.6)" opacity={0.9}>
          <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#FACC15" />
        </g>
      )}

      {symbol === "zzz" && (
        <g transform="translate(540, 110)" opacity={0.9}>
          <text x="0" y="24" fill="#93C5FD" fontSize="34" fontWeight="bold" fontFamily="monospace">
            Zzz..
          </text>
        </g>
      )}

      {symbol === "heart" && (
        <g transform="translate(560, 120) scale(1.8)" opacity={0.9}>
          <path
            d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z"
            fill="#F43F5E"
            transform="rotate(45 5 5)"
          />
        </g>
      )}

      {symbol === "question" && (
        <g transform="translate(560, 110)" opacity={0.9}>
          <text x="0" y="32" fill="#F59E0B" fontSize="42" fontWeight="black" fontFamily="sans-serif">
            ?
          </text>
        </g>
      )}
    </g>
  );
}
