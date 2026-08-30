import React, { useState } from "react";
import type { SawakoExpression, SawakoSymbol } from "./types";

interface SawakoSvgProps {
  expression: SawakoExpression;
  symbol: SawakoSymbol;
  eyeOffset: { x: number; y: number };
  isHovered: boolean;
  isDragging: boolean;
  scaleX?: number;
  scaleY?: number;
  onPokeHand?: (e: React.MouseEvent) => void;
  onPokeFoot?: (e: React.MouseEvent) => void;
}

export default function SawakoSvg({
  expression,
  symbol,
  eyeOffset,
  isHovered,
  isDragging,
  scaleX = 1,
  scaleY = 1,
  onPokeHand,
  onPokeFoot,
}: SawakoSvgProps) {
  const [hoveredZone, setHoveredZone] = useState<"hand" | "foot" | null>(null);

  // Gentle head/body parallax tilt
  const tiltRotate = Math.max(-4, Math.min(4, eyeOffset.x * 4));

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      {/* Container with ghostly levitation float */}
      <div
        className={`relative w-36 h-64 sm:w-40 sm:h-72 transition-all duration-300 ${
          isDragging ? "translate-y-[-8px] scale-105" : "animate-[ghostFloat_3.5s_ease-in-out_infinite]"
        }`}
        style={{
          transform: `rotate(${tiltRotate}deg)`,
          transformOrigin: "center 40%",
        }}
      >
        {/* Style tag for custom ghost floating animation if not in Tailwind */}
        <style>{`
          @keyframes ghostFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-7px) rotate(-1.2deg); }
          }
          @keyframes ghostWisp {
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
            50% { transform: translateY(-6px) scale(1.15); opacity: 0.95; }
          }
        `}</style>

        {/* Ethereal Ground Mist Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-indigo-400/20 blur-md pointer-events-none" />

        {/* Authentic High-Resolution Ghost Sawako Sprite */}
        <img
          src="/sawako-ghost-fullbody.png"
          alt="Sawako Anime Mascot"
          className={`w-full h-full object-contain filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-200 ${
            expression === "dizzy" ? "blur-[0.3px] brightness-105" : ""
          } ${isDragging ? "brightness-110" : ""} ${
            isHovered ? "drop-shadow-[0_14px_30px_rgba(165,180,252,0.45)] brightness-105" : ""
          }`}
          draggable={false}
        />

        {/* ===================== INTERACTIVE HANDS HOTSPOT ===================== */}
        <button
          type="button"
          data-testid="sawako-hands-target"
          onClick={(e) => {
            e.stopPropagation();
            onPokeHand?.(e);
          }}
          onMouseEnter={() => setHoveredZone("hand")}
          onMouseLeave={() => setHoveredZone(null)}
          className="absolute top-[48%] left-[38%] w-[26%] h-[12%] rounded-full cursor-pointer pointer-events-auto transition-transform hover:scale-125 focus:outline-hidden group"
          title="Sawako's delicate hands (Click to interact!)"
          aria-label="Interact with Sawako's hands"
        >
          {/* Subtle sparkling aura on hover */}
          <span
            className={`absolute inset-0 rounded-full border border-pink-400/50 bg-pink-400/20 backdrop-blur-[1px] transition-opacity duration-200 ${
              hoveredZone === "hand" ? "opacity-100 animate-pulse" : "opacity-0"
            }`}
          />
        </button>

        {/* ===================== INTERACTIVE FEET HOTSPOT ===================== */}
        <button
          type="button"
          data-testid="sawako-feet-target"
          onClick={(e) => {
            e.stopPropagation();
            onPokeFoot?.(e);
          }}
          onMouseEnter={() => setHoveredZone("foot")}
          onMouseLeave={() => setHoveredZone(null)}
          className="absolute bottom-[2%] left-[40%] w-[22%] h-[10%] rounded-full cursor-pointer pointer-events-auto transition-transform hover:scale-125 focus:outline-hidden group"
          title="Sawako's cute bare feet (Click to tickle!)"
          aria-label="Interact with Sawako's feet"
        >
          {/* Subtle glowing aura on hover */}
          <span
            className={`absolute inset-0 rounded-full border border-cyan-400/50 bg-cyan-400/20 backdrop-blur-[1px] transition-opacity duration-200 ${
              hoveredZone === "foot" ? "opacity-100 animate-pulse" : "opacity-0"
            }`}
          />
        </button>

        {/* ===================== FLOATING GHOST WISPS & DOODLE STARS ===================== */}
        {/* Floating ethereal ghost flame on left */}
        <div className="absolute top-[35%] -left-3 w-4 h-4 rounded-full bg-cyan-300/40 blur-[2px] animate-[ghostWisp_2.8s_ease-in-out_infinite] pointer-events-none" />

        {/* Floating cute hitodama / sparkle on upper right */}
        <div className="absolute top-[28%] -right-2 w-3.5 h-3.5 rounded-full bg-indigo-300/40 blur-[2px] animate-[ghostWisp_3.2s_ease-in-out_infinite_0.8s] pointer-events-none" />

        {/* ===================== SVG OVERLAY: SYMBOLS & DIZZY EYES ===================== */}
        <svg
          viewBox="0 0 200 245"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          {/* Hypnotic Dizzy Swirl Eyes Overlay (@.@) */}
          {expression === "dizzy" && (
            <g transform="translate(14, -8)">
              <circle cx="80" cy="54" r="10" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
              <path
                d="M 80 54 m -6, 0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-spin origin-[80px_54px]"
              />
              <circle cx="114" cy="54" r="10" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
              <path
                d="M 114 54 m -6, 0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-spin origin-[114px_54px]"
              />
            </g>
          )}

          {/* Floating Anime Emotion Symbols */}
          {symbol === "anger" && (
            <g transform="translate(150, 16) scale(0.85)" className="animate-bounce">
              <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {symbol === "sweat" && (
            <g transform="translate(152, 28)" className="animate-pulse">
              <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
              <circle cx="4" cy="11" r="1.2" fill="#ffffff" />
            </g>
          )}

          {symbol === "sparkle" && (
            <g transform="translate(152, 18)" className="animate-spin origin-[152px_18px]">
              <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#facc15" />
            </g>
          )}

          {symbol === "zzz" && (
            <g transform="translate(144, 14)" className="animate-bounce">
              <text x="0" y="10" fill="#93c5fd" fontSize="12" fontWeight="bold" fontFamily="monospace">
                Zzz..
              </text>
            </g>
          )}

          {symbol === "heart" && (
            <g transform="translate(148, 18)" className="animate-ping origin-center">
              <path d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z" fill="#f43f5e" transform="rotate(45 5 5)" />
            </g>
          )}

          {symbol === "question" && (
            <g transform="translate(148, 16)" className="animate-bounce">
              <text x="0" y="14" fill="#f59e0b" fontSize="16" fontWeight="black" fontFamily="sans-serif">
                ?
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
