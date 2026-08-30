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

  // Dynamic eye pupil tracking (clamped)
  const pupilX = Math.max(-3.5, Math.min(3.5, eyeOffset.x * 3.5));
  const pupilY = Math.max(-2.8, Math.min(2.8, eyeOffset.y * 2.8));

  // Dynamic head & body tilt with cursor
  const headRotate = Math.max(-5, Math.min(5, eyeOffset.x * 5));

  // Dynamic Arm/Hand poses based on interaction state
  let leftArmTransform = "translate(0, 0) rotate(0)";
  let rightArmTransform = "translate(0, 0) rotate(0)";

  if (isDragging) {
    // Both arms flail upward as she is picked up like a floating ghost
    leftArmTransform = "translate(-12, -26) rotate(-35)";
    rightArmTransform = "translate(12, -26) rotate(35)";
  } else if (expression === "dizzy") {
    // Both hands clutch her spinning head (@.@)
    leftArmTransform = "translate(14, -36) rotate(32)";
    rightArmTransform = "translate(-14, -36) rotate(-32)";
  } else if (expression === "pout") {
    // Hands fly to her blushing cheeks in surprise
    leftArmTransform = "translate(12, -24) rotate(24)";
    rightArmTransform = "translate(-12, -24) rotate(-24)";
  } else if (isHovered || hoveredZone === "hand") {
    // Shy cute ghost wave
    leftArmTransform = "translate(-4, -12) rotate(16)";
    rightArmTransform = "translate(4, -12) rotate(-16)";
  }

  // Dynamic Foot poses
  let leftFootTransform = "translate(0, 0) rotate(0)";
  let rightFootTransform = "translate(0, 0) rotate(0)";

  if (isDragging) {
    leftFootTransform = "translate(-3, -2) rotate(-12)";
    rightFootTransform = "translate(3, -2) rotate(12)";
  } else if (expression === "dizzy") {
    leftFootTransform = "translate(-4, -4) rotate(18)";
    rightFootTransform = "translate(4, -4) rotate(-18)";
  } else if (hoveredZone === "foot" || expression === "pout") {
    leftFootTransform = "translate(0, -6) rotate(-14)";
    rightFootTransform = "translate(0, -3) rotate(8)";
  }

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <style>{`
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-1.2deg); }
        }
        @keyframes ghostDressSway {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.025) translateY(-1px); }
        }
        @keyframes eyeBlink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0.08); }
        }
        @keyframes hitodamaWisp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.75; }
          50% { transform: translateY(-8px) scale(1.15); opacity: 0.95; }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-40 h-72 sm:w-44 sm:h-80 transition-all duration-300 ${
          isDragging ? "translate-y-[-10px] scale-105" : "animate-[ghostFloat_3.5s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 200 270"
          className="w-full h-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)] overflow-visible"
          role="img"
          aria-label="Sawako Anime Mascot"
        >
          <defs>
            {/* Silky Jet Black Hair Gradient (Sawako Kuronuma) */}
            <linearGradient id="ghostSawakoHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1e24" />
              <stop offset="45%" stopColor="#141418" />
              <stop offset="100%" stopColor="#08080b" />
            </linearGradient>

            {/* Fair Porcelain Skin Gradient */}
            <linearGradient id="ghostSawakoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffaf6" />
              <stop offset="100%" stopColor="#fcedea" />
            </linearGradient>

            {/* Forehead Shadow Cast under Bangs */}
            <linearGradient id="ghostForeheadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ebb7a7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ebb7a7" stopOpacity="0" />
            </linearGradient>

            {/* Eye Iris Gradient: Deep anime charcoal */}
            <linearGradient id="ghostSawakoIris" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2e303a" />
              <stop offset="40%" stopColor="#1b1c22" />
              <stop offset="100%" stopColor="#08080b" />
            </linearGradient>

            {/* Ethereal White Long Dress Gradient */}
            <linearGradient id="ghostWhiteDress" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#eef2f6" />
            </linearGradient>

            {/* Ethereal Dress Shadow Folds */}
            <linearGradient id="ghostDressFolds" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
            </linearGradient>

            {/* Soft Strawberry Cheek Blush */}
            <radialGradient id="ghostSawakoBlush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff627e" stopOpacity="0.68" />
              <stop offset="65%" stopColor="#ff627e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff627e" stopOpacity="0" />
            </radialGradient>

            {/* Ethereal Ground Mist */}
            <radialGradient id="ghostGroundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#c7d2fe" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ===================== ETHEREAL GROUND MIST ===================== */}
          <ellipse cx="100" cy="256" rx="55" ry="8" fill="url(#ghostGroundMist)" />
          <ellipse cx="100" cy="257" rx="38" ry="4.5" fill="#e0e7ff" fillOpacity="0.4" />

          {/* ===================== LONG BACK HAIR (STREAMING TO KNEES) ===================== */}
          <g className="transition-transform duration-300">
            <path
              d="M 52 48 C 28 85, 20 148, 28 226 C 34 238, 45 236, 52 222 C 60 195, 68 160, 72 135 C 72 135, 128 135, 128 135 C 132 160, 140 195, 148 222 C 155 236, 166 238, 172 226 C 180 148, 172 85, 148 48 Z"
              fill="url(#ghostSawakoHair)"
              className={isDragging ? "animate-pulse" : ""}
            />
            {/* Silky hair sheen lines */}
            <path d="M 38 100 C 32 150, 36 195, 42 220" stroke="#333342" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 162 100 C 168 150, 164 195, 158 220" stroke="#333342" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>

          {/* ===================== CUTE BARE FEET (INTERACTIVE TARGET) ===================== */}
          <g
            data-testid="sawako-feet-target"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onPokeFoot?.(e);
            }}
            onMouseEnter={() => setHoveredZone("foot")}
            onMouseLeave={() => setHoveredZone(null)}
            className="cursor-pointer pointer-events-auto group focus:outline-hidden"
            aria-label="Interact with Sawako's feet"
          >
            {/* Left Foot */}
            <g style={{ transform: leftFootTransform, transformOrigin: "88px 230px" }} className="transition-transform duration-200">
              <path
                d="M 85 224 C 82 232, 81 242, 86 247 C 91 250, 95 248, 96 242 C 97 236, 96 228, 94 224 Z"
                fill="url(#ghostSawakoSkin)"
                stroke="#f3d8cc"
                strokeWidth="0.8"
              />
              {/* Cute little toes */}
              <circle cx="85.5" cy="245" r="1.5" fill="#fecdd3" />
              <circle cx="88.5" cy="247" r="1.6" fill="#fecdd3" />
              <circle cx="91.5" cy="247" r="1.5" fill="#fecdd3" />
              <circle cx="94" cy="245.5" r="1.3" fill="#fecdd3" />
            </g>

            {/* Right Foot */}
            <g style={{ transform: rightFootTransform, transformOrigin: "112px 230px" }} className="transition-transform duration-200">
              <path
                d="M 106 224 C 104 228, 103 236, 104 242 C 105 248, 109 250, 114 247 C 119 242, 118 232, 115 224 Z"
                fill="url(#ghostSawakoSkin)"
                stroke="#f3d8cc"
                strokeWidth="0.8"
              />
              {/* Cute little toes */}
              <circle cx="106" cy="245.5" r="1.3" fill="#fecdd3" />
              <circle cx="108.5" cy="247" r="1.5" fill="#fecdd3" />
              <circle cx="111.5" cy="247" r="1.6" fill="#fecdd3" />
              <circle cx="114.5" cy="245" r="1.5" fill="#fecdd3" />
            </g>

            {/* Foot glow ring on hover */}
            {hoveredZone === "foot" && (
              <ellipse cx="100" cy="245" rx="22" ry="7" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" className="animate-pulse" />
            )}
          </g>

          {/* ===================== WHITE LONG GHOST DRESS (GHOST VIBE) ===================== */}
          <g className="animate-[ghostDressSway_3s_ease-in-out_infinite]">
            {/* Main flowing gown body */}
            <path
              d="
                M 82 102
                C 72 120, 64 150, 52 195
                C 42 225, 48 240, 68 240
                C 85 240, 100 236, 115 236
                C 132 236, 148 240, 168 240
                C 188 240, 192 225, 182 195
                C 170 150, 162 120, 152 102
                C 140 98, 94 98, 82 102
                Z
              "
              fill="url(#ghostWhiteDress)"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />

            {/* Soft draped fabric shadow folds */}
            <path d="M 88 106 C 80 135, 74 185, 68 238 C 76 238, 82 236, 86 236 C 84 185, 92 135, 94 106 Z" fill="url(#ghostDressFolds)" />
            <path d="M 146 106 C 154 135, 160 185, 166 238 C 158 238, 152 236, 148 236 C 150 185, 142 135, 140 106 Z" fill="url(#ghostDressFolds)" />
            <path d="M 112 115 C 110 148, 108 190, 106 235 C 112 235, 116 235, 122 235 C 120 190, 118 148, 116 115 Z" fill="#e2e8f0" fillOpacity="0.6" />

            {/* Soft fold contour line accents */}
            <path d="M 88 106 C 80 142, 74 190, 70 238" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M 104 112 C 102 148, 100 195, 98 236" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 130 112 C 132 148, 134 195, 136 236" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 146 106 C 154 142, 160 190, 164 238" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />

            {/* Ethereal scalloped fluttering hem */}
            <path
              d="
                M 58 238
                Q 68 244 78 238
                Q 88 244 98 238
                Q 108 244 118 238
                Q 128 244 138 238
                Q 148 244 158 238
                Q 168 244 176 238
              "
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Sheer fabric under-layer peaking at hem */}
            <path
              d="M 64 238 Q 100 248 136 238 Q 156 244 170 238"
              stroke="#e0e7ff"
              strokeWidth="2"
              strokeDasharray="4,2"
              fill="none"
              opacity="0.75"
            />

            {/* Delicate round neckline */}
            <path d="M 88 102 Q 100 114 112 102" stroke="#d5dee8" strokeWidth="1.2" fill="none" />
          </g>

          {/* ===================== INTERACTIVE ARMS & HANDS ===================== */}
          <g
            data-testid="sawako-hands-target"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onPokeHand?.(e);
            }}
            onMouseEnter={() => setHoveredZone("hand")}
            onMouseLeave={() => setHoveredZone(null)}
            className="cursor-pointer pointer-events-auto group focus:outline-hidden"
            aria-label="Interact with Sawako's hands"
          >
            {/* Left Arm & Flowing Bell Sleeve */}
            <g style={{ transform: leftArmTransform, transformOrigin: "78px 105px" }} className="transition-transform duration-200 ease-out">
              {/* Wide bell sleeve */}
              <path
                d="M 78 104 C 68 118, 62 136, 68 152 C 74 156, 88 152, 92 144 C 88 130, 84 118, 86 106 Z"
                fill="url(#ghostWhiteDress)"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <path d="M 66 150 Q 80 156 94 144" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              {/* Delicate pale hand */}
              <circle cx="89" cy="151" r="5" fill="url(#ghostSawakoSkin)" stroke="#f2d7ca" strokeWidth="0.8" />
              <path d="M 86 151 C 88 156, 92 156, 94 151" stroke="#eabdb0" strokeWidth="0.8" fill="none" />
            </g>

            {/* Right Arm & Flowing Bell Sleeve */}
            <g style={{ transform: rightArmTransform, transformOrigin: "122px 105px" }} className="transition-transform duration-200 ease-out">
              {/* Wide bell sleeve */}
              <path
                d="M 122 104 C 132 118, 138 136, 132 152 C 126 156, 112 152, 108 144 C 112 130, 116 118, 114 106 Z"
                fill="url(#ghostWhiteDress)"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <path d="M 134 150 Q 120 156 106 144" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              {/* Delicate pale hand */}
              <circle cx="111" cy="151" r="5" fill="url(#ghostSawakoSkin)" stroke="#f2d7ca" strokeWidth="0.8" />
              <path d="M 108 151 C 110 156, 114 156, 116 151" stroke="#eabdb0" strokeWidth="0.8" fill="none" />
            </g>

            {/* Hands sparkle aura on hover */}
            {hoveredZone === "hand" && (
              <circle cx="100" cy="150" r="16" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3,2" className="animate-spin origin-[100px_150px]" />
            )}
          </g>

          {/* ===================== FRONT LONG HAIR STRANDS (OVER GHOST GOWN) ===================== */}
          <g>
            {/* Left front strand falling gracefully over white dress */}
            <path
              d="M 60 52 C 55 76, 56 112, 56 168 C 56 182, 52 192, 56 194 C 60 192, 62 182, 62 168 C 64 116, 66 80, 71 62 Z"
              fill="url(#ghostSawakoHair)"
            />
            <path d="M 59 70 C 56 110, 57 150, 58 185" stroke="#353545" strokeWidth="0.9" strokeLinecap="round" fill="none" />

            {/* Right front strand falling gracefully over white dress */}
            <path
              d="M 140 52 C 145 76, 144 112, 144 168 C 144 182, 148 192, 144 194 C 140 192, 138 182, 138 168 C 136 116, 134 80, 129 62 Z"
              fill="url(#ghostSawakoHair)"
            />
            <path d="M 141 70 C 144 110, 143 150, 142 185" stroke="#353545" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          </g>

          {/* ===================== HEAD & ANIME FACE (MATCHING SAWAKO BETTER.JPG) ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "100px 75px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Slender Pale Neck */}
            <path d="M 94 92 L 94 104 L 106 104 L 106 92 Z" fill="url(#ghostSawakoSkin)" />
            <polygon points="94,92 106,92 100,100" fill="#f1d6ca" />

            {/* Cute Round Face Contour from Sawako better.jpg */}
            <path
              d="M 60 52 C 57 80, 66 98, 100 102 C 134 98, 143 80, 140 52 C 138 28, 62 28, 60 52 Z"
              fill="url(#ghostSawakoSkin)"
            />

            {/* Soft Forehead Shadow cast under bangs */}
            <path d="M 62 50 C 62 66, 75 74, 100 74 C 125 74, 138 66, 138 50 Z" fill="url(#ghostForeheadShadow)" />

            {/* Delicate Ears */}
            <ellipse cx="59" cy="70" rx="3.5" ry="6" fill="url(#ghostSawakoSkin)" />
            <ellipse cx="141" cy="70" rx="3.5" ry="6" fill="url(#ghostSawakoSkin)" />

            {/* ===================== CUTE CHEEK BLUSH (EXACT TO SAWAKO BETTER.JPG) ===================== */}
            <g>
              {/* Left Cheek Blush */}
              <ellipse cx="76" cy="80" rx="12" ry="7" fill="url(#ghostSawakoBlush)" />
              <line x1="71" y1="78" x2="72.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="75" y1="77" x2="76.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="79" y1="78" x2="80.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

              {/* Right Cheek Blush */}
              <ellipse cx="124" cy="80" rx="12" ry="7" fill="url(#ghostSawakoBlush)" />
              <line x1="119" y1="78" x2="120.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="123" y1="77" x2="124.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="127" y1="78" x2="128.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

              {/* Soft Warmth over Nose Bridge */}
              <ellipse cx="100" cy="78" rx="6" ry="2.5" fill="url(#ghostSawakoBlush)" />
            </g>

            {/* Tiny beauty mark on lower cheek (from Sawako better.jpg) */}
            <circle cx="124" cy="89" r="1.1" fill="#d9777f" fillOpacity="0.8" />

            {/* ===================== BIG INNOCENT ROUND EYES WITH BLINKING ===================== */}
            {expression === "dizzy" ? (
              // Comedic Hypnotic Swirl Eyes (@.@)
              <g>
                <circle cx="80" cy="69" r="11" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
                <path
                  d="M 80 69 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-spin origin-[80px_69px]"
                />
                <circle cx="120" cy="69" r="11" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
                <path
                  d="M 120 69 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-spin origin-[120px_69px]"
                />
              </g>
            ) : expression === "sleepy" ? (
              // Sweet happy closed eyes (^ ^)
              <g>
                <path d="M 72 70 Q 80 77 88 70" stroke="#1c1d24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 112 70 Q 120 77 128 70" stroke="#1c1d24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </g>
            ) : (
              // Dynamic Blinking Eye Group
              <g className="animate-[eyeBlink_5s_ease-in-out_infinite] origin-[100px_68px]">
                {/* Left Eye */}
                <ellipse cx="80" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="80" cy="68" rx="9" ry="11.5" fill="url(#ghostSawakoIris)" />
                  <circle cx="80" cy="69" r="5" fill="#08080b" />
                  {/* Big crisp white specular shine in upper-left */}
                  <circle cx="77.5" cy="64" r="3.2" fill="#ffffff" />
                  <circle cx="83" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
                </g>
                <path d="M 66 64 Q 80 57 94 65" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
                <line x1="71" y1="77" x2="69.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="76" y1="79" x2="75.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="82" y1="79" x2="82" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="87" y1="78" x2="88" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />

                {/* Right Eye */}
                <ellipse cx="120" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="120" cy="68" rx="9" ry="11.5" fill="url(#ghostSawakoIris)" />
                  <circle cx="120" cy="69" r="5" fill="#08080b" />
                  {/* Big crisp white specular shine in upper-left */}
                  <circle cx="117.5" cy="64" r="3.2" fill="#ffffff" />
                  <circle cx="123" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
                </g>
                <path d="M 106 65 Q 120 57 134 64" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
                <line x1="113" y1="78" x2="112" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="118" y1="79" x2="118" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="124" y1="79" x2="124.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="129" y1="77" x2="130.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* Thin Delicate Eyebrows (visible through natural bangs gap) */}
            <path d="M 72 54 Q 80 50 88 53" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 128 54 Q 120 50 112 53" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Tiny Nose Mark (from Sawako better.jpg) */}
            <line x1="100" y1="77" x2="100.5" y2="81" stroke="#9e5660" strokeWidth="1.2" strokeLinecap="round" />

            {/* ===================== SHY MOUTH (MATCHING SAWAKO BETTER.JPG) ===================== */}
            {expression === "pout" ? (
              // Cute flustered wavy pout
              <path d="M 95 91 Q 100 87 105 91" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : expression === "dizzy" ? (
              // Squiggly dizzy mouth
              <path d="M 94 90 Q 97 87 100 90 Q 103 93 106 90" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            ) : expression === "happy" ? (
              // Sweet beaming smile
              <path d="M 94 88 Q 100 95 106 88 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.2" />
            ) : (
              // Shy slightly-open gentle lips from Sawako better.jpg
              <g>
                <ellipse cx="100" cy="89" rx="4.5" ry="2.2" fill="#fda4af" stroke="#be123c" strokeWidth="1.2" />
                <line x1="97" y1="93" x2="103" y2="93" stroke="#fb7185" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* ===================== STRAIGHT BANGS WITH NOTCHED FOREHEAD GAP ===================== */}
            <g>
              {/* Top Crown Cap */}
              <path
                d="M 58 52 C 55 20, 72 10, 100 10 C 128 10, 145 20, 142 52 C 130 46, 70 46, 58 52 Z"
                fill="url(#ghostSawakoHair)"
              />

              {/* Straight Blunt Bangs with Distinct Rectangular Gaps (matching Sawako better.jpg) */}
              <path d="M 58 50 C 58 64, 60 82, 63 94 C 65 96, 68 96, 68 92 C 67 78, 68 64, 70 52 Z" fill="url(#ghostSawakoHair)" />
              <path d="M 71 52 C 72 62, 73 73, 76 75 C 78 76, 80 76, 81 74 C 82 66, 83 58, 84 52 Z" fill="url(#ghostSawakoHair)" />
              <path d="M 85 52 C 86 62, 87 72, 90 74 C 92 75, 95 75, 96 72 C 96 66, 97 58, 97 52 Z" fill="url(#ghostSawakoHair)" />
              
              {/* Center Strand (Notice the wide gap to the right as in Sawako better.jpg!) */}
              <path d="M 98 52 C 99 60, 100 68, 103 70 C 105 71, 108 71, 109 69 C 109 64, 110 58, 111 52 Z" fill="url(#ghostSawakoHair)" />
              
              {/* Center-Right Strand */}
              <path d="M 115 52 C 116 62, 117 72, 120 74 C 122 75, 125 75, 126 72 C 127 66, 128 58, 129 52 Z" fill="url(#ghostSawakoHair)" />
              <path d="M 130 52 C 131 62, 132 74, 134 76 C 136 77, 138 77, 139 74 C 140 66, 140 58, 141 52 Z" fill="url(#ghostSawakoHair)" />
              <path d="M 141 52 C 142 66, 142 82, 140 94 C 141 97, 144 97, 145 93 C 147 80, 145 64, 142 52 Z" fill="url(#ghostSawakoHair)" />
            </g>

            {/* ===================== THE ICONIC WHITE STAR HAIR CLIP (FROM SAWAKO BETTER.JPG) ===================== */}
            <g
              transform="translate(68, 36) rotate(-8)"
              className={isHovered ? "transition-transform duration-200 scale-110" : "transition-transform duration-300"}
            >
              {/* Dark Bobby Pin Bar */}
              <line x1="-12" y1="4" x2="16" y2="4" stroke="#4a3b32" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="-10" y1="7" x2="14" y2="7" stroke="#382b24" strokeWidth="1.8" strokeLinecap="round" />

              {/* Crisp 5-Pointed White Star Clip */}
              <polygon
                points="0,-9 2.8,-2.8 9.5,-2.8 4.2,1.5 6.2,8 0,3.8 -6.2,8 -4.2,1.5 -9.5,-2.8 -2.8,-2.8"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="0.8"
              />
              <circle cx="0" cy="-1" r="1.5" fill="#f8fafc" />
            </g>
          </g>

          {/* ===================== FLOATING HITODAMA GHOST FLAMES & DOODLE STARS ===================== */}
          {/* Floating cute hitodama ghost flame on left */}
          <g transform="translate(18, 110)" className="animate-[hitodamaWisp_3s_ease-in-out_infinite]">
            <path d="M 7 0 C 14 8, 16 16, 10 20 C 4 24, -2 18, 1 10 Z" fill="#67e8f9" fillOpacity="0.5" />
            <circle cx="5" cy="14" r="3.5" fill="#ffffff" fillOpacity="0.8" />
          </g>

          {/* Floating hitodama ghost flame on upper right */}
          <g transform="translate(176, 85)" className="animate-[hitodamaWisp_3.5s_ease-in-out_infinite_0.8s]">
            <path d="M 7 0 C 14 8, 16 16, 10 20 C 4 24, -2 18, 1 10 Z" fill="#a5b4fc" fillOpacity="0.5" />
            <circle cx="5" cy="14" r="3" fill="#ffffff" fillOpacity="0.8" />
          </g>

          {/* Floating white doodle star on left (from Sawako better.jpg) */}
          <g transform="translate(16, 60)" className="animate-pulse opacity-85">
            <path
              d="M 0 -8 L 2.5 -2.5 L 8 -2.5 L 3.5 1.2 L 5.2 7 L 0 3.2 L -5.2 7 L -3.5 1.2 L -8 -2.5 L -2.5 -2.5 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Floating doodle sparkles on upper right (from Sawako better.jpg) */}
          <g transform="translate(172, 35)" className="animate-bounce opacity-85">
            <line x1="0" y1="0" x2="10" y2="10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="8" y1="-8" x2="16" y2="-16" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="12" y1="4" x2="22" y2="4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* ===================== FLOATING ANIME EMOTION SYMBOLS ===================== */}
          {symbol === "anger" && (
            <g transform="translate(152, 20) scale(0.85)" className="animate-bounce">
              <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {symbol === "sweat" && (
            <g transform="translate(154, 36)" className="animate-pulse">
              <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
              <circle cx="4" cy="11" r="1.2" fill="#ffffff" />
            </g>
          )}

          {symbol === "sparkle" && (
            <g transform="translate(154, 22)" className="animate-spin origin-[154px_22px]">
              <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#facc15" />
            </g>
          )}

          {symbol === "zzz" && (
            <g transform="translate(148, 16)" className="animate-bounce">
              <text x="0" y="10" fill="#93c5fd" fontSize="12" fontWeight="bold" fontFamily="monospace">
                Zzz..
              </text>
            </g>
          )}

          {symbol === "heart" && (
            <g transform="translate(152, 20)" className="animate-ping origin-center">
              <path d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z" fill="#f43f5e" transform="rotate(45 5 5)" />
            </g>
          )}

          {symbol === "question" && (
            <g transform="translate(152, 18)" className="animate-bounce">
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
