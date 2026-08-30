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
  const pupilX = Math.max(-3, Math.min(3, eyeOffset.x * 3));
  const pupilY = Math.max(-2.5, Math.min(2.5, eyeOffset.y * 2.5));

  // Dynamic head & body tilt with cursor
  const headRotate = Math.max(-5, Math.min(5, eyeOffset.x * 5));

  // Dynamic Arm/Hand poses based on interaction state
  let leftArmTransform = "translate(0, 0) rotate(0)";
  let rightArmTransform = "translate(0, 0) rotate(0)";

  if (isDragging) {
    // Both arms flail upward as she is picked up like a floating ghost
    leftArmTransform = "translate(-8, -20) rotate(-28)";
    rightArmTransform = "translate(8, -20) rotate(28)";
  } else if (expression === "dizzy") {
    // Both hands clutch her spinning head (@.@)
    leftArmTransform = "translate(10, -28) rotate(25)";
    rightArmTransform = "translate(-10, -28) rotate(-25)";
  } else if (expression === "pout") {
    // Hands fly to her blushing cheeks in surprise
    leftArmTransform = "translate(8, -16) rotate(18)";
    rightArmTransform = "translate(-8, -16) rotate(-18)";
  } else if (isHovered || hoveredZone === "hand") {
    // Shy cute ghost wave
    leftArmTransform = "translate(-3, -8) rotate(12)";
    rightArmTransform = "translate(3, -8) rotate(-12)";
  }

  // Dynamic Foot poses
  let leftFootTransform = "translate(0, 0) rotate(0)";
  let rightFootTransform = "translate(0, 0) rotate(0)";

  if (isDragging) {
    leftFootTransform = "translate(-2, -2) rotate(-10)";
    rightFootTransform = "translate(2, -2) rotate(10)";
  } else if (expression === "dizzy") {
    leftFootTransform = "translate(-3, -3) rotate(14)";
    rightFootTransform = "translate(3, -3) rotate(-14)";
  } else if (hoveredZone === "foot" || expression === "pout") {
    leftFootTransform = "translate(0, -4) rotate(-10)";
    rightFootTransform = "translate(0, -2) rotate(6)";
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
            {/* Silky Raven Black Hair Gradient */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#24242c" />
              <stop offset="35%" stopColor="#18181f" />
              <stop offset="100%" stopColor="#0a0a0d" />
            </linearGradient>

            {/* Fair Porcelain Skin Gradient */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffaf7" />
              <stop offset="100%" stopColor="#faeee7" />
            </linearGradient>

            {/* Deep Anime Eye Iris */}
            <linearGradient id="irisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#343642" />
              <stop offset="40%" stopColor="#1e1f28" />
              <stop offset="100%" stopColor="#0a0a0e" />
            </linearGradient>

            {/* Pure White Ghost Dress */}
            <linearGradient id="dressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#edf2f7" />
            </linearGradient>

            {/* Dress Shadow Folds */}
            <linearGradient id="dressFolds" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
            </linearGradient>

            {/* Soft Strawberry Cheek Blush */}
            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5983" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#ff5983" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff5983" stopOpacity="0" />
            </radialGradient>

            {/* Ethereal Ground Mist */}
            <radialGradient id="groundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#c7d2fe" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ===================== ETHEREAL GROUND MIST ===================== */}
          <ellipse cx="100" cy="265" rx="55" ry="8" fill="url(#groundMist)" />
          <ellipse cx="100" cy="266" rx="36" ry="4" fill="#e0e7ff" fillOpacity={0.4} />

          {/* ===================== BACK HAIR (FLOWING PAST KNEES) ===================== */}
          <g className="transition-transform duration-300">
            <path
              d="M 64 50 C 38 85, 30 145, 38 226 C 44 238, 54 236, 62 224 C 70 195, 78 160, 80 135 L 120 135 C 122 160, 130 195, 138 224 C 146 236, 156 238, 162 226 C 170 145, 162 85, 136 50 Z"
              fill="url(#hairGrad)"
              className={isDragging ? "animate-pulse" : ""}
            />
            {/* Silky hair sheen lines */}
            <path d="M 44 100 C 40 150, 44 198, 52 224" stroke="#333342" strokeWidth={1.2} strokeLinecap="round" fill="none" />
            <path d="M 156 100 C 160 150, 156 198, 148 224" stroke="#333342" strokeWidth={1.2} strokeLinecap="round" fill="none" />
          </g>

          {/* ===================== BARE FEET (INTERACTIVE TARGET) ===================== */}
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
                d="M 87 238 C 84 242, 83 249, 87 253 C 91 255, 95 253, 96 248 C 97 243, 96 239, 94 238 Z"
                fill="url(#skinGrad)"
                stroke="#f1d6ca"
                strokeWidth={0.7}
              />
              <circle cx="87" cy="251.5" r={1.3} fill="#fecdd3" />
              <circle cx="89.5" cy="253" r={1.4} fill="#fecdd3" />
              <circle cx="92" cy="253" r={1.3} fill="#fecdd3" />
              <circle cx="94.2" cy="251.8" r={1.1} fill="#fecdd3" />
            </g>

            {/* Right Foot */}
            <g style={{ transform: rightFootTransform, transformOrigin: "112px 240px" }} className="transition-transform duration-200">
              <path
                d="M 106 238 C 104 239, 103 243, 104 248 C 105 253, 109 255, 113 253 C 117 249, 116 242, 113 238 Z"
                fill="url(#skinGrad)"
                stroke="#f1d6ca"
                strokeWidth={0.7}
              />
              <circle cx="105.8" cy="251.8" r={1.1} fill="#fecdd3" />
              <circle cx="108" cy="253" r={1.3} fill="#fecdd3" />
              <circle cx="110.5" cy="253" r={1.4} fill="#fecdd3" />
              <circle cx="113" cy="251.5" r={1.3} fill="#fecdd3" />
            </g>

            {/* Foot glow ring on hover */}
            {hoveredZone === "foot" && (
              <ellipse cx="100" cy="252" rx="20" ry="6" fill="none" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3,2" className="animate-pulse" />
            )}
          </g>

          {/* ===================== FLOWING WHITE GHOST DRESS ===================== */}
          <g className="animate-[ghostDressSway_3s_ease-in-out_infinite]">
            {/* Main dress body */}
            <path
              d="
                M 84 104
                C 74 122, 68 155, 58 200
                C 50 232, 56 248, 74 248
                C 88 248, 100 244, 112 244
                C 126 244, 138 248, 152 248
                C 168 248, 172 232, 164 200
                C 154 155, 148 122, 138 104
                C 126 100, 96 100, 84 104
                Z
              "
              fill="url(#dressGrad)"
              stroke="#e2e8f0"
              strokeWidth={1.2}
            />

            {/* Draped fold shading */}
            <path d="M 90 108 C 82 140, 76 192, 72 246 C 78 246, 84 244, 88 244 C 86 192, 94 140, 96 108 Z" fill="url(#dressFolds)" />
            <path d="M 142 108 C 150 140, 154 192, 158 246 C 152 246, 146 244, 142 244 C 144 192, 138 140, 136 108 Z" fill="url(#dressFolds)" />
            <path d="M 112 118 C 110 152, 108 198, 106 243 C 112 243, 116 243, 120 243 C 118 198, 116 152, 114 118 Z" fill="#e2e8f0" fillOpacity={0.6} />

            {/* Soft fold contour lines */}
            <path d="M 90 108 C 82 148, 76 198, 72 246" stroke="#cbd5e1" strokeWidth={0.8} strokeLinecap="round" fill="none" />
            <path d="M 142 108 C 150 148, 154 198, 158 246" stroke="#cbd5e1" strokeWidth={0.8} strokeLinecap="round" fill="none" />

            {/* Scalloped hemline */}
            <path
              d="M 62 246 Q 72 252 82 246 Q 92 252 102 246 Q 112 252 122 246 Q 132 252 142 246 Q 152 252 162 246"
              stroke="#cbd5e1"
              strokeWidth={1.2}
              fill="none"
            />

            {/* Delicate round neckline */}
            <path d="M 88 104 Q 100 114 112 104" stroke="#cbd5e1" strokeWidth={1.2} fill="none" />
          </g>

          {/* ===================== INTERACTIVE BELL SLEEVES & HANDS ===================== */}
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
            {/* Left Sleeve & Clapsed Hand */}
            <g style={{ transform: leftArmTransform, transformOrigin: "82px 105px" }} className="transition-transform duration-200 ease-out">
              <path
                d="M 82 105 C 72 118, 64 136, 70 154 C 76 158, 88 155, 94 147 C 90 132, 88 118, 88 107 Z"
                fill="url(#dressGrad)"
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <path
                d="M 88 150 C 87 154, 91 158, 95 156 C 97 154, 96 149, 93 148 Z"
                fill="url(#skinGrad)"
                stroke="#f1d6ca"
                strokeWidth={0.7}
              />
              <circle cx="91" cy="154" r={1.1} fill="#fecdd3" />
              <circle cx="93" cy="155" r={1.1} fill="#fecdd3" />
            </g>

            {/* Right Sleeve & Clapsed Hand */}
            <g style={{ transform: rightArmTransform, transformOrigin: "118px 105px" }} className="transition-transform duration-200 ease-out">
              <path
                d="M 118 105 C 128 118, 136 136, 130 154 C 124 158, 112 155, 106 147 C 110 132, 112 118, 112 107 Z"
                fill="url(#dressGrad)"
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <path
                d="M 112 150 C 113 154, 109 158, 105 156 C 103 154, 104 149, 107 148 Z"
                fill="url(#skinGrad)"
                stroke="#f1d6ca"
                strokeWidth={0.7}
              />
              <circle cx="109" cy="154" r={1.1} fill="#fecdd3" />
              <circle cx="107" cy="155" r={1.1} fill="#fecdd3" />
            </g>

            {/* Hands sparkle aura on hover */}
            {hoveredZone === "hand" && (
              <circle cx="100" cy="152" r={14} fill="none" stroke="#f472b6" strokeWidth={1.5} strokeDasharray="3,2" className="animate-spin origin-[100px_152px]" />
            )}
          </g>

          {/* ===================== FRONT HAIR STRANDS (OVER SHOULDERS) ===================== */}
          <g>
            <path
              d="M 64 52 C 58 76, 59 112, 59 168 C 59 180, 56 188, 59 190 C 62 188, 64 180, 64 168 C 66 116, 68 80, 72 62 Z"
              fill="url(#hairGrad)"
            />
            <path
              d="M 136 52 C 142 76, 141 112, 141 168 C 141 180, 144 188, 141 190 C 138 188, 136 180, 136 168 C 134 116, 132 80, 128 62 Z"
              fill="url(#hairGrad)"
            />
          </g>

          {/* ===================== HEAD & ANIME FACE ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "100px 72px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Slender Neck */}
            <path d="M 94 94 L 94 106 L 106 106 L 106 94 Z" fill="url(#skinGrad)" />
            <polygon points="94,94 106,94 100,102" fill="#f1d6ca" />

            {/* Cute Round Face Contour (Soft porcelain anime jawline) */}
            <path
              d="
                M 62 52
                C 58 80, 70 103, 100 107
                C 130 103, 142 80, 138 52
                C 134 24, 66 24, 62 52
                Z
              "
              fill="url(#skinGrad)"
            />

            {/* Soft Forehead Shadow */}
            <path d="M 64 50 C 64 64, 76 70, 100 70 C 124 70, 136 64, 136 50 Z" fill="#ebb7a7" fillOpacity={0.35} />

            {/* Delicate Ears */}
            <ellipse cx="61" cy="72" rx="3.5" ry="6" fill="url(#skinGrad)" />
            <ellipse cx="139" cy="72" rx="3.5" ry="6" fill="url(#skinGrad)" />

            {/* Rosy Cheek Blush */}
            <ellipse cx="75" cy="83" rx="12" ry="7" fill="url(#blushGrad)" />
            <line x1="71" y1="81" x2="72.2" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />
            <line x1="74.5" y1="80" x2="75.7" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />
            <line x1="78" y1="81" x2="79.2" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />

            <ellipse cx="125" cy="83" rx="12" ry="7" fill="url(#blushGrad)" />
            <line x1="121" y1="81" x2="122.2" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />
            <line x1="124.5" y1="80" x2="125.7" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />
            <line x1="128" y1="81" x2="129.2" y2="86" stroke="#ff5983" strokeWidth={0.9} strokeLinecap="round" />

            <ellipse cx="100" cy="81" rx="6" ry="2.5" fill="url(#blushGrad)" />

            {/* Beauty mark (Exact to Sawako better.jpg) */}
            <circle cx="123.5" cy="91.5" r={0.9} fill="#d9777f" fillOpacity={0.8} />

            {/* BIG INNOCENT TARE-ME EYES WITH NATURAL BLINK */}
            {expression === "dizzy" ? (
              // Hypnotic Swirl Eyes (@.@)
              <g>
                <circle cx="76" cy="73" r={11} fill="#ffffff" stroke="#1f2026" strokeWidth={2} />
                <path
                  d="M 76 73 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="animate-spin origin-[76px_73px]"
                />
                <circle cx="124" cy="73" r={11} fill="#ffffff" stroke="#1f2026" strokeWidth={2} />
                <path
                  d="M 124 73 m -7, 0 a 7,7 0 1,0 14,0 a 4.5,4.5 0 1,0 -9,0 a 2.2,2.2 0 1,0 4.4,0"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="animate-spin origin-[124px_73px]"
                />
              </g>
            ) : expression === "sleepy" ? (
              // Sweet happy closed eyes (^ ^)
              <g>
                <path d="M 68 74 Q 76 81 84 74" stroke="#1c1d24" strokeWidth={2.8} strokeLinecap="round" fill="none" />
                <path d="M 116 74 Q 124 81 132 74" stroke="#1c1d24" strokeWidth={2.8} strokeLinecap="round" fill="none" />
              </g>
            ) : (
              // Dynamic Blinking Eye Group
              <g className="animate-[eyeBlink_5s_ease-in-out_infinite] origin-[100px_73px]">
                {/* Left Eye */}
                <ellipse cx="76" cy="73" rx={11.5} ry={12.5} fill="#ffffff" stroke="#1c1d24" strokeWidth={1.3} />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="76" cy="73" rx={8.5} ry={10} fill="url(#irisGrad)" />
                  <circle cx="76" cy="74" r={4.2} fill="#08080a" />
                  <circle cx="73.8" cy="69.5" r={3} fill="#ffffff" />
                  <circle cx="78.5" cy="76.5" r={1.3} fill="#ffffff" fillOpacity={0.85} />
                </g>
                {/* Gentle Tare-Me Upper Eyelid */}
                <path d="M 64 70 Q 75 63 87 69" stroke="#121318" strokeWidth={3} strokeLinecap="round" fill="none" />
                {/* 4 Lower Eyelashes from Sawako better.jpg */}
                <line x1="69" y1="81.5" x2="68" y2="84.2" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="73.5" y1="82.8" x2="73" y2="85.8" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="78.5" y1="82.8" x2="78.5" y2="85.8" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="83" y1="81.8" x2="84" y2="84.5" stroke="#121318" strokeWidth={1} strokeLinecap="round" />

                {/* Right Eye */}
                <ellipse cx="124" cy="73" rx={11.5} ry={12.5} fill="#ffffff" stroke="#1c1d24" strokeWidth={1.3} />
                <g transform={`translate(${pupilX}, ${pupilY})`}>
                  <ellipse cx="124" cy="73" rx={8.5} ry={10} fill="url(#irisGrad)" />
                  <circle cx="124" cy="74" r={4.2} fill="#08080a" />
                  <circle cx="121.8" cy="69.5" r={3} fill="#ffffff" />
                  <circle cx="126.5" cy="76.5" r={1.3} fill="#ffffff" fillOpacity={0.85} />
                </g>
                {/* Gentle Tare-Me Upper Eyelid */}
                <path d="M 113 69 Q 125 63 136 70" stroke="#121318" strokeWidth={3} strokeLinecap="round" fill="none" />
                {/* 4 Lower Eyelashes from Sawako better.jpg */}
                <line x1="117" y1="81.8" x2="116" y2="84.5" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="121.5" y1="82.8" x2="121.5" y2="85.8" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="126.5" y1="82.8" x2="127" y2="85.8" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
                <line x1="131" y1="81.5" x2="132" y2="84.2" stroke="#121318" strokeWidth={1} strokeLinecap="round" />
              </g>
            )}

            {/* Eyebrows */}
            <path d="M 70 59 Q 76 55 83 58" stroke="#2a2a32" strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <path d="M 130 59 Q 124 55 117 58" stroke="#2a2a32" strokeWidth={1.5} strokeLinecap="round" fill="none" />

            {/* Delicate Tiny Nose Mark */}
            <circle cx="100" cy="80.5" r={0.9} fill="#c27581" />

            {/* DYNAMIC SHY MOUTH */}
            {expression === "pout" ? (
              <path d="M 95 93 Q 100 89 105 93" stroke="#be123c" strokeWidth={2} strokeLinecap="round" fill="none" />
            ) : expression === "dizzy" ? (
              <path d="M 94 92 Q 97 89 100 92 Q 103 95 106 92" stroke="#be123c" strokeWidth={1.8} strokeLinecap="round" fill="none" />
            ) : expression === "happy" ? (
              <path d="M 94 90 Q 100 97 106 90 Z" fill="#f43f5e" stroke="#be123c" strokeWidth={1.2} />
            ) : (
              <g>
                <path d="M 96.5 91.5 Q 100 93.8 103.5 91.5" stroke="#be123c" strokeWidth={1.4} strokeLinecap="round" fill="none" />
                <ellipse cx="100" cy="92.5" rx={2.5} ry={1.2} fill="#fda4af" fillOpacity={0.8} />
              </g>
            )}

            {/* UNIFIED HAIR DOME & NATURAL STRAIGHT BLUNT BANGS */}
            <path
              d="
                M 60 52
                C 56 18, 72 8, 100 8
                C 128 8, 144 18, 140 52
                C 141 64, 141 74, 140 82
                C 139 84, 137 84, 136 80
                C 135 72, 134 65, 133 65
                L 130 65
                C 130 62, 129 57, 128 57
                L 125 57
                C 125 62, 124 65, 123 65
                L 118 65
                C 118 62, 117 57, 116 57
                L 113 57
                C 113 62, 112 65, 110 65
                L 105 65
                /* Forehead Gap from Sawako better.jpg */
                C 104 56, 103 52, 100 52
                C 97 52, 96 56, 95 65
                L 90 65
                C 90 62, 89 57, 88 57
                L 85 57
                C 85 62, 84 65, 82 65
                L 77 65
                C 77 62, 76 57, 75 57
                L 72 57
                C 71 62, 70 65, 67 65
                L 65 65
                C 64 65, 64 72, 63 80
                C 62 84, 60 84, 59 82
                C 58 74, 58 64, 60 52
                Z
              "
              fill="url(#hairGrad)"
            />

            {/* WHITE STAR HAIR CLIP (FROM SAWAKO BETTER.JPG) */}
            <g
              transform="translate(68, 38) rotate(-10)"
              className={isHovered ? "transition-transform duration-200 scale-110" : "transition-transform duration-300"}
            >
              {/* Dark Bobby Pin */}
              <line x1="-12" y1="3" x2="16" y2="3" stroke="#3e2d24" strokeWidth={2.2} strokeLinecap="round" />
              {/* Crisp 5-Pointed White Star */}
              <polygon
                points="0,-9 2.7,-2.7 9,-2.7 4,1.4 5.8,7.5 0,3.5 -5.8,7.5 -4,1.4 -9,-2.7 -2.7,-2.7"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth={0.8}
              />
            </g>
          </g>

          {/* ===================== FLOATING HITODAMA GHOST FLAMES ===================== */}
          <g transform="translate(22, 105)" className="animate-[hitodamaWisp_3s_ease-in-out_infinite]">
            <path d="M 6 0 C 12 7, 14 14, 9 17 C 4 20, -1 15, 1 8 Z" fill="#67e8f9" fillOpacity={0.6} />
            <circle cx="4.5" cy="12" r={2.8} fill="#ffffff" fillOpacity={0.85} />
          </g>
          <g transform="translate(172, 80)" className="animate-[hitodamaWisp_3.5s_ease-in-out_infinite_0.8s]">
            <path d="M 6 0 C 12 7, 14 14, 9 17 C 4 20, -1 15, 1 8 Z" fill="#a5b4fc" fillOpacity={0.6} />
            <circle cx="4.5" cy="12" r={2.8} fill="#ffffff" fillOpacity={0.85} />
          </g>

          {/* ===================== FLOATING ANIME EMOTION SYMBOLS ===================== */}
          {symbol === "anger" && (
            <g transform="translate(152, 22) scale(0.85)" className="animate-bounce">
              <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
            </g>
          )}

          {symbol === "sweat" && (
            <g transform="translate(154, 38)" className="animate-pulse">
              <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
              <circle cx="4" cy="11" r={1.2} fill="#ffffff" />
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
