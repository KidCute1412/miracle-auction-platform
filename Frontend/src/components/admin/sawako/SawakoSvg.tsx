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
    leftArmTransform = "translate(-10, -24) rotate(-32)";
    rightArmTransform = "translate(10, -24) rotate(32)";
  } else if (expression === "dizzy") {
    // Both hands clutch her spinning head (@.@)
    leftArmTransform = "translate(12, -34) rotate(28)";
    rightArmTransform = "translate(-12, -34) rotate(-28)";
  } else if (expression === "pout") {
    // Hands fly to her blushing cheeks in surprise
    leftArmTransform = "translate(10, -20) rotate(22)";
    rightArmTransform = "translate(-10, -20) rotate(-22)";
  } else if (isHovered || hoveredZone === "hand") {
    // Shy cute ghost wave
    leftArmTransform = "translate(-4, -10) rotate(14)";
    rightArmTransform = "translate(4, -10) rotate(-14)";
  }

  // Dynamic Foot poses
  let leftFootTransform = "translate(0, 0) rotate(0)";
  let rightFootTransform = "translate(0, 0) rotate(0)";

  if (isDragging) {
    leftFootTransform = "translate(-3, -2) rotate(-12)";
    rightFootTransform = "translate(3, -2) rotate(12)";
  } else if (expression === "dizzy") {
    leftFootTransform = "translate(-4, -4) rotate(16)";
    rightFootTransform = "translate(4, -4) rotate(-16)";
  } else if (hoveredZone === "foot" || expression === "pout") {
    leftFootTransform = "translate(0, -5) rotate(-12)";
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
          50% { transform: scaleX(1.02) translateY(-1px); }
        }
        @keyframes eyeBlink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.08); }
        }
        @keyframes hitodamaWisp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.75; }
          50% { transform: translateY(-7px) scale(1.15); opacity: 0.95; }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-40 h-72 sm:w-44 sm:h-80 transition-all duration-300 ${
          isDragging ? "translate-y-[-10px] scale-105" : "animate-[ghostFloat_3.5s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 200 280"
          className="w-full h-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)] overflow-visible"
          role="img"
          aria-label="Sawako Anime Mascot"
        >
          <defs>
            {/* Silky Raven Black Hair Gradient (Sawako Kuronuma) */}
            <linearGradient id="sawakoHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1e24" />
              <stop offset="45%" stopColor="#141418" />
              <stop offset="100%" stopColor="#08080b" />
            </linearGradient>

            {/* Fair Porcelain Skin Gradient */}
            <linearGradient id="sawakoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffaf6" />
              <stop offset="100%" stopColor="#fcedea" />
            </linearGradient>

            {/* Forehead Shadow Cast under Bangs */}
            <linearGradient id="sawakoForeheadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ebb7a7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ebb7a7" stopOpacity="0" />
            </linearGradient>

            {/* Eye Iris Gradient: Deep anime charcoal with cool tone */}
            <linearGradient id="sawakoIrisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#30323c" />
              <stop offset="40%" stopColor="#1c1d24" />
              <stop offset="100%" stopColor="#0a0a0e" />
            </linearGradient>

            {/* Flowing Pure White Ghost Dress Gradient */}
            <linearGradient id="sawakoGhostDress" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#edf2f7" />
            </linearGradient>

            {/* Ethereal Dress Shadow Folds */}
            <linearGradient id="sawakoDressFolds" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
            </linearGradient>

            {/* Soft Strawberry Cheek Blush */}
            <radialGradient id="sawakoBlushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff627e" stopOpacity="0.65" />
              <stop offset="65%" stopColor="#ff627e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ff627e" stopOpacity="0" />
            </radialGradient>

            {/* Ethereal Ground Mist */}
            <radialGradient id="sawakoGroundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#c7d2fe" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ===================== ETHEREAL GROUND MIST ===================== */}
          <ellipse cx="100" cy="265" rx="55" ry="8" fill="url(#sawakoGroundMist)" />
          <ellipse cx="100" cy="266" rx="38" ry="4" fill="#e0e7ff" fillOpacity="0.45" />

          {/* ===================== LONG BACK HAIR (STREAMING PAST WAIST) ===================== */}
          <g className="transition-transform duration-300">
            <path
              d="
                M 52 48
                C 24 85, 18 145, 26 230
                C 32 242, 44 240, 52 226
                C 60 198, 68 160, 72 135
                L 128 135
                C 132 160, 140 198, 148 226
                C 156 240, 168 242, 174 230
                C 182 145, 176 85, 148 48
                Z
              "
              fill="url(#sawakoHairGrad)"
              className={isDragging ? "animate-pulse" : ""}
            />
            {/* Silky hair sheen lines */}
            <path d="M 36 100 C 30 150, 34 198, 42 226" stroke="#333342" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 164 100 C 170 150, 166 198, 158 226" stroke="#333342" strokeWidth="1.2" strokeLinecap="round" fill="none" />
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
            <g style={{ transform: leftFootTransform, transformOrigin: "88px 240px" }} className="transition-transform duration-200">
              <path
                d="M 85 234 C 82 240, 81 250, 86 254 C 91 256, 95 254, 96 249 C 97 244, 96 238, 94 234 Z"
                fill="url(#sawakoSkinGrad)"
                stroke="#f3d8cc"
                strokeWidth="0.8"
              />
              {/* Cute little toes */}
              <circle cx="85.5" cy="252" r="1.4" fill="#fecdd3" />
              <circle cx="88.5" cy="254" r="1.5" fill="#fecdd3" />
              <circle cx="91.5" cy="254" r="1.4" fill="#fecdd3" />
              <circle cx="94" cy="252.5" r="1.2" fill="#fecdd3" />
            </g>

            {/* Right Foot */}
            <g style={{ transform: rightFootTransform, transformOrigin: "112px 240px" }} className="transition-transform duration-200">
              <path
                d="M 106 234 C 104 238, 103 244, 104 249 C 105 254, 109 256, 114 254 C 119 250, 118 240, 115 234 Z"
                fill="url(#sawakoSkinGrad)"
                stroke="#f3d8cc"
                strokeWidth="0.8"
              />
              {/* Cute little toes */}
              <circle cx="106" cy="252.5" r="1.2" fill="#fecdd3" />
              <circle cx="108.5" cy="254" r="1.4" fill="#fecdd3" />
              <circle cx="111.5" cy="254" r="1.5" fill="#fecdd3" />
              <circle cx="114.5" cy="252" r="1.4" fill="#fecdd3" />
            </g>

            {/* Foot glow ring on hover */}
            {hoveredZone === "foot" && (
              <ellipse cx="100" cy="252" rx="22" ry="7" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" className="animate-pulse" />
            )}
          </g>

          {/* ===================== WHITE LONG GHOST DRESS (GHOST VIBE) ===================== */}
          <g className="animate-[ghostDressSway_3s_ease-in-out_infinite]">
            {/* Main flowing gown body */}
            <path
              d="
                M 82 104
                C 72 122, 64 155, 52 200
                C 42 232, 48 248, 68 248
                C 85 248, 100 244, 115 244
                C 132 244, 148 248, 168 248
                C 188 248, 192 232, 182 200
                C 170 155, 162 122, 152 104
                C 140 100, 94 100, 82 104
                Z
              "
              fill="url(#sawakoGhostDress)"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />

            {/* Soft draped fabric shadow folds */}
            <path d="M 88 108 C 80 140, 74 192, 68 246 C 76 246, 82 244, 86 244 C 84 192, 92 140, 94 108 Z" fill="url(#sawakoDressFolds)" />
            <path d="M 146 108 C 154 140, 160 192, 166 246 C 158 246, 152 244, 148 244 C 150 192, 142 140, 140 108 Z" fill="url(#sawakoDressFolds)" />
            <path d="M 112 118 C 110 152, 108 198, 106 243 C 112 243, 116 243, 122 243 C 120 198, 118 152, 116 118 Z" fill="#e2e8f0" fillOpacity="0.6" />

            {/* Soft fold contour line accents */}
            <path d="M 88 108 C 80 148, 74 198, 70 246" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M 104 115 C 102 152, 100 202, 98 244" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 130 115 C 132 152, 134 202, 136 244" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 146 108 C 154 148, 160 198, 164 246" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />

            {/* Ethereal scalloped fluttering hem */}
            <path
              d="
                M 56 246
                Q 66 252 76 246
                Q 86 252 96 246
                Q 106 252 116 246
                Q 126 252 136 246
                Q 146 252 156 246
                Q 166 252 176 246
              "
              stroke="#cbd5e1"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Sheer fabric under-layer peaking at hem */}
            <path
              d="M 62 246 Q 100 256 138 246 Q 158 252 172 246"
              stroke="#e0e7ff"
              strokeWidth="2"
              strokeDasharray="4,2"
              fill="none"
              opacity="0.75"
            />

            {/* Delicate round neckline */}
            <path d="M 88 104 Q 100 116 112 104" stroke="#d5dee8" strokeWidth="1.2" fill="none" />
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
            <g style={{ transform: leftArmTransform, transformOrigin: "78px 108px" }} className="transition-transform duration-200 ease-out">
              {/* Wide bell sleeve */}
              <path
                d="M 78 106 C 68 120, 62 138, 68 155 C 74 159, 88 155, 92 147 C 88 132, 84 120, 86 108 Z"
                fill="url(#sawakoGhostDress)"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <path d="M 66 153 Q 80 159 94 147" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              {/* Delicate pale hand */}
              <circle cx="89" cy="154" r="5" fill="url(#sawakoSkinGrad)" stroke="#f2d7ca" strokeWidth="0.8" />
              <path d="M 86 154 C 88 159, 92 159, 94 154" stroke="#eabdb0" strokeWidth="0.8" fill="none" />
            </g>

            {/* Right Arm & Flowing Bell Sleeve */}
            <g style={{ transform: rightArmTransform, transformOrigin: "122px 108px" }} className="transition-transform duration-200 ease-out">
              {/* Wide bell sleeve */}
              <path
                d="M 122 106 C 132 120, 138 138, 132 155 C 126 159, 112 155, 108 147 C 112 132, 116 120, 114 108 Z"
                fill="url(#sawakoGhostDress)"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <path d="M 134 153 Q 120 159 106 147" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              {/* Delicate pale hand */}
              <circle cx="111" cy="154" r="5" fill="url(#sawakoSkinGrad)" stroke="#f2d7ca" strokeWidth="0.8" />
              <path d="M 108 154 C 110 159, 114 159, 116 154" stroke="#eabdb0" strokeWidth="0.8" fill="none" />
            </g>

            {/* Hands sparkle aura on hover */}
            {hoveredZone === "hand" && (
              <circle cx="100" cy="154" r="16" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3,2" className="animate-spin origin-[100px_154px]" />
            )}
          </g>

          {/* ===================== FRONT LONG HAIR STRANDS (OVER GHOST GOWN) ===================== */}
          <g>
            {/* Left front strand falling gracefully over white dress */}
            <path
              d="M 60 52 C 55 76, 56 112, 56 168 C 56 182, 52 192, 56 194 C 60 192, 62 182, 62 168 C 64 116, 66 80, 71 62 Z"
              fill="url(#sawakoHairGrad)"
            />
            <path d="M 59 70 C 56 110, 57 150, 58 185" stroke="#353545" strokeWidth="0.9" strokeLinecap="round" fill="none" />

            {/* Right front strand falling gracefully over white dress */}
            <path
              d="M 140 52 C 145 76, 144 112, 144 168 C 144 182, 148 192, 144 194 C 140 192, 138 182, 138 168 C 136 116, 134 80, 129 62 Z"
              fill="url(#sawakoHairGrad)"
            />
            <path d="M 141 70 C 144 110, 143 150, 142 185" stroke="#353545" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          </g>

          {/* ===================== HEAD & ANIME FACE (PROPORTIONALLY TUNED TO SAWAKO BETTER.JPG) ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "100px 72px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Slender Pale Neck */}
            <path d="M 94 94 L 94 106 L 106 106 L 106 94 Z" fill="url(#sawakoSkinGrad)" />
            <polygon points="94,94 106,94 100,102" fill="#f1d6ca" />

            {/* Soft, Cute Round Face Contour from Sawako better.jpg */}
            <path
              d="
                M 60 52
                C 56 80, 68 102, 100 106
                C 132 102, 144 80, 140 52
                C 136 24, 64 24, 60 52
                Z
              "
              fill="url(#sawakoSkinGrad)"
            />

            {/* Soft Forehead Shadow cast under bangs */}
            <path d="M 62 50 C 62 64, 75 70, 100 70 C 125 70, 138 64, 138 50 Z" fill="url(#sawakoForeheadShadow)" />

            {/* Delicate Ears */}
            <ellipse cx="59" cy="72" rx="3.5" ry="6" fill="url(#sawakoSkinGrad)" />
            <ellipse cx="141" cy="72" rx="3.5" ry="6" fill="url(#sawakoSkinGrad)" />

            {/* ===================== CUTE CHEEK BLUSH (EXACT TO SAWAKO BETTER.JPG) ===================== */}
            <g>
              {/* Left Cheek Blush */}
              <ellipse cx="76" cy="84" rx="12.5" ry="7.5" fill="url(#sawakoBlushGrad)" />
              <line x1="71" y1="82" x2="72.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="75" y1="81" x2="76.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="79" y1="82" x2="80.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

              {/* Right Cheek Blush */}
              <ellipse cx="124" cy="84" rx="12.5" ry="7.5" fill="url(#sawakoBlushGrad)" />
              <line x1="119" y1="82" x2="120.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="123" y1="81" x2="124.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="127" y1="82" x2="128.5" y2="87" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

              {/* Soft Warmth over Nose Bridge */}
              <ellipse cx="100" cy="81" rx="6.5" ry="2.8" fill="url(#sawakoBlushGrad)" />
            </g>

            {/* Tiny beauty mark on lower cheek (from Sawako better.jpg) */}
            <circle cx="124" cy="94" r="1.1" fill="#d9777f" fillOpacity="0.8" />

            {/* ===================== BIG INNOCENT ROUND EYES WITH NATURAL BLINK ===================== */}
            {expression === "dizzy" ? (
              // Comedic Hypnotic Swirl Eyes (@.@)
              <g>
                <circle cx="80" cy="72" r="11" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
                <path
                  d="M 80 72 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-spin origin-[80px_72px]"
                />
                <circle cx="120" cy="72" r="11" fill="#ffffff" stroke="#1f2026" strokeWidth="2.2" />
                <path
                  d="M 120 72 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-spin origin-[120px_72px]"
                />
              </g>
            ) : expression === "sleepy" ? (
              // Sweet happy closed eyes (^ ^)
              <g>
                <path d="M 72 73 Q 80 80 88 73" stroke="#1c1d24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M 112 73 Q 120 80 128 73" stroke="#1c1d24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </g>
            ) : (
              // Dynamic Blinking Eye Group
              <g className="animate-[eyeBlink_5s_ease-in-out_infinite] origin-[100px_72px]">
                {/* Left Eye */}
                <ellipse cx="80" cy="72" rx="13" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="80" cy="72" rx="9" ry="11.5" fill="url(#sawakoIrisGrad)" />
                  <circle cx="80" cy="73" r="5" fill="#08080b" />
                  {/* Big crisp white specular shine in upper-left */}
                  <circle cx="77.5" cy="68" r="3.2" fill="#ffffff" />
                  <circle cx="83" cy="76" r="1.5" fill="#ffffff" fillOpacity="0.8" />
                </g>
                {/* Left Upper Lash Line (thick arched anime curve) */}
                <path d="M 66 68 Q 80 60 94 69" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
                <line x1="71" y1="81" x2="69.5" y2="84" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="76" y1="83" x2="75.5" y2="86.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="82" y1="83" x2="82" y2="86.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="87" y1="82" x2="88" y2="85" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />

                {/* Right Eye */}
                <ellipse cx="120" cy="72" rx="13" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="120" cy="72" rx="9" ry="11.5" fill="url(#sawakoIrisGrad)" />
                  <circle cx="120" cy="73" r="5" fill="#08080b" />
                  {/* Big crisp white specular shine in upper-left */}
                  <circle cx="117.5" cy="68" r="3.2" fill="#ffffff" />
                  <circle cx="123" cy="76" r="1.5" fill="#ffffff" fillOpacity="0.8" />
                </g>
                {/* Right Upper Lash Line (thick arched anime curve) */}
                <path d="M 106 69 Q 120 60 134 68" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
                <line x1="113" y1="82" x2="112" y2="85" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="118" y1="83" x2="118" y2="86.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="124" y1="83" x2="124.5" y2="86.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="129" y1="81" x2="130.5" y2="84" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* Thin Delicate Eyebrows (visible through natural bangs gap) */}
            <path d="M 72 58 Q 80 54 88 57" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 128 58 Q 120 54 112 57" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Tiny Nose Mark (from Sawako better.jpg) */}
            <line x1="100" y1="81" x2="100.5" y2="85" stroke="#9e5660" strokeWidth="1.2" strokeLinecap="round" />

            {/* ===================== SHY MOUTH (MATCHING SAWAKO BETTER.JPG) ===================== */}
            {expression === "pout" ? (
              // Cute flustered wavy pout
              <path d="M 95 95 Q 100 91 105 95" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : expression === "dizzy" ? (
              // Squiggly dizzy mouth
              <path d="M 94 94 Q 97 91 100 94 Q 103 97 106 94" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            ) : expression === "happy" ? (
              // Sweet beaming smile
              <path d="M 94 92 Q 100 99 106 92 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.2" />
            ) : (
              // Shy slightly-open gentle lips from Sawako better.jpg
              <g>
                <ellipse cx="100" cy="93" rx="4.5" ry="2.2" fill="#fda4af" stroke="#be123c" strokeWidth="1.2" />
                <line x1="97" y1="97" x2="103" y2="97" stroke="#fb7185" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}

            {/* ===================== STRAIGHT BANGS FRAMING EYES WITH FOREHEAD GAP ===================== */}
            <g>
              {/* Top Head Crown */}
              <path
                d="M 58 52 C 55 20, 72 10, 100 10 C 128 10, 145 20, 142 52 C 130 46, 70 46, 58 52 Z"
                fill="url(#sawakoHairGrad)"
              />

              {/* Continuous Natural Bangs ending cleanly right above the eyes at y=66 (never blocking eyes!) */}
              <path
                d="
                  M 58 52
                  C 58 64, 60 76, 62 86
                  C 64 88, 67 88, 68 84
                  C 68 76, 69 68, 70 60
                  C 71 63, 72 66, 75 66
                  C 77 66, 78 63, 79 58
                  C 80 62, 81 66, 85 66
                  C 88 66, 90 63, 91 58
                  C 92 62, 94 65, 97 65
                  C 99 65, 100 62, 101 54
                  C 102 52, 106 52, 107 54
                  C 108 61, 109 65, 112 65
                  C 114 65, 116 62, 117 58
                  C 118 62, 120 66, 123 66
                  C 126 66, 127 62, 128 58
                  C 129 63, 131 66, 134 66
                  C 136 66, 138 63, 139 58
                  C 140 68, 141 76, 140 84
                  C 141 88, 144 88, 146 86
                  C 148 76, 146 64, 142 52
                  Z
                "
                fill="url(#sawakoHairGrad)"
              />
            </g>

            {/* ===================== THE ICONIC WHITE STAR HAIR CLIP (FROM SAWAKO BETTER.JPG) ===================== */}
            <g
              transform="translate(68, 40) rotate(-8)"
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
          <g transform="translate(18, 115)" className="animate-[hitodamaWisp_3s_ease-in-out_infinite]">
            <path d="M 7 0 C 14 8, 16 16, 10 20 C 4 24, -2 18, 1 10 Z" fill="#67e8f9" fillOpacity="0.5" />
            <circle cx="5" cy="14" r="3.5" fill="#ffffff" fillOpacity="0.8" />
          </g>

          {/* Floating hitodama ghost flame on upper right */}
          <g transform="translate(176, 90)" className="animate-[hitodamaWisp_3.5s_ease-in-out_infinite_0.8s]">
            <path d="M 7 0 C 14 8, 16 16, 10 20 C 4 24, -2 18, 1 10 Z" fill="#a5b4fc" fillOpacity="0.5" />
            <circle cx="5" cy="14" r="3" fill="#ffffff" fillOpacity="0.8" />
          </g>

          {/* Floating white doodle star on left (from Sawako better.jpg) */}
          <g transform="translate(16, 65)" className="animate-pulse opacity-85">
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
          <g transform="translate(172, 38)" className="animate-bounce opacity-85">
            <line x1="0" y1="0" x2="10" y2="10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="8" y1="-8" x2="16" y2="-16" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="12" y1="4" x2="22" y2="4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* ===================== FLOATING ANIME EMOTION SYMBOLS ===================== */}
          {symbol === "anger" && (
            <g transform="translate(152, 22) scale(0.85)" className="animate-bounce">
              <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {symbol === "sweat" && (
            <g transform="translate(154, 38)" className="animate-pulse">
              <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
              <circle cx="4" cy="11" r="1.2" fill="#ffffff" />
            </g>
          )}

          {symbol === "sparkle" && (
            <g transform="translate(154, 24)" className="animate-spin origin-[154px_24px]">
              <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#facc15" />
            </g>
          )}

          {symbol === "zzz" && (
            <g transform="translate(148, 18)" className="animate-bounce">
              <text x="0" y="10" fill="#93c5fd" fontSize="12" fontWeight="bold" fontFamily="monospace">
                Zzz..
              </text>
            </g>
          )}

          {symbol === "heart" && (
            <g transform="translate(152, 22)" className="animate-ping origin-center">
              <path d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z" fill="#f43f5e" transform="rotate(45 5 5)" />
            </g>
          )}

          {symbol === "question" && (
            <g transform="translate(152, 20)" className="animate-bounce">
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
