import React from "react";
import type { SawakoSymbol, SawakoExpression } from "../types";

interface SawakoWispsProps {
  symbol: SawakoSymbol;
  expression?: SawakoExpression;
}

/**
 * SawakoWisps - Subtle Charming Aura & Expressive Emotion Symbols
 * Features:
 * - Cleaned up to remove the distracting bouncing doodle star
 * - Subtle chalky aura outline contour around the hair
 * - Soft pastel petals and gentle light sparkles
 * - Contextual hitodama ghost flames when dizzy or sweating
 * - Anime manga emotion symbols: anger, sweat, sparkle, zzz, heart, question
 */
export function SawakoWisps({ symbol, expression }: SawakoWispsProps) {
  const showHitodama = expression === "dizzy" || symbol === "sweat";

  return (
    <g className="pointer-events-none" id="sawako-wisps-layer">
      {/* Subtle white chalky contour line softly echoing hair silhouette on left */}
      <path
        d="
          M 210 140
          C 150 170, 126 240, 120 330
          C 114 410, 130 470, 130 530
        "
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="14,10"
        fill="none"
        opacity="0.65"
      />

      {/* Subtle radiating sparkle rays on upper right */}
      <g transform="translate(610, 170)" className="opacity-75">
        <line x1="0" y1="0" x2="24" y2="24" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
        <line x1="18" y1="-18" x2="42" y2="-36" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
        <line x1="28" y1="10" x2="54" y2="10" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
      </g>

      {/* ===================== CONTEXTUAL HITODAMA FLAMES ===================== */}
      {showHitodama && (
        <g id="hitodama-wisps">
          {/* Left Hitodama */}
          <g transform="translate(65, 420)" className="animate-[hitodamaWisp_2.8s_ease-in-out_infinite]">
            <path d="M 18 0 C 36 21, 42 42, 27 51 C 12 60, -3 45, 3 24 Z" fill="#67E8F9" fillOpacity={0.75} />
            <circle cx="14" cy="36" r="8" fill="#FFFFFF" fillOpacity={0.95} />
          </g>
          {/* Right Hitodama */}
          <g transform="translate(625, 360)" className="animate-[hitodamaWisp_3.2s_ease-in-out_infinite_0.7s]">
            <path d="M 18 0 C 36 21, 42 42, 27 51 C 12 60, -3 45, 3 24 Z" fill="#A5B4FC" fillOpacity={0.75} />
            <circle cx="14" cy="36" r="8" fill="#FFFFFF" fillOpacity={0.95} />
          </g>
        </g>
      )}

      {/* Gentle Floating Petals when calm */}
      {!showHitodama && (
        <g id="angelic-petals" opacity={0.7}>
          <g transform="translate(90, 420)" className="animate-[ghostFloat_4s_ease-in-out_infinite]">
            <path d="M 0 0 C 10 -15, 25 -5, 20 10 C 15 25, -5 15, 0 0 Z" fill="#FBCFE8" fillOpacity={0.75} />
          </g>
          <g transform="translate(630, 460)" className="animate-[ghostFloat_4.5s_ease-in-out_infinite_1s]">
            <path d="M 0 0 C 12 -12, 22 -2, 16 12 C 10 22, -2 12, 0 0 Z" fill="#FCE7F3" fillOpacity={0.8} />
          </g>
        </g>
      )}

      {/* ===================== EMOTION SYMBOLS ===================== */}
      {symbol === "anger" && (
        <g transform="translate(560, 120) scale(1.6)" className="animate-bounce">
          <path
            d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10"
            stroke="#EF4444"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {symbol === "sweat" && (
        <g transform="translate(570, 190) scale(1.6)" className="animate-pulse">
          <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38BDF8" />
          <circle cx="4" cy="11" r="1.5" fill="#FFFFFF" />
        </g>
      )}

      {symbol === "sparkle" && (
        <g transform="translate(560, 130) scale(1.6)" className="animate-spin origin-[560px_130px]">
          <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#FACC15" />
        </g>
      )}

      {symbol === "zzz" && (
        <g transform="translate(540, 110)" className="animate-bounce">
          <text x="0" y="24" fill="#93C5FD" fontSize="34" fontWeight="bold" fontFamily="monospace">
            Zzz..
          </text>
        </g>
      )}

      {symbol === "heart" && (
        <g transform="translate(560, 120) scale(1.8)" className="animate-ping origin-center">
          <path
            d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 10 3 Z"
            fill="#F43F5E"
            transform="rotate(45 5 5)"
          />
        </g>
      )}

      {symbol === "question" && (
        <g transform="translate(560, 110)" className="animate-bounce">
          <text x="0" y="32" fill="#F59E0B" fontSize="42" fontWeight="black" fontFamily="sans-serif">
            ?
          </text>
        </g>
      )}
    </g>
  );
}
