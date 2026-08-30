import type { SawakoExpression, SawakoSymbol } from "./types";

interface SawakoSvgProps {
  expression: SawakoExpression;
  symbol: SawakoSymbol;
  eyeOffset: { x: number; y: number };
  isHovered: boolean;
  isDragging: boolean;
  scaleX?: number;
  scaleY?: number;
}

export default function SawakoSvg({
  expression,
  symbol,
  eyeOffset,
  isHovered,
  isDragging,
  scaleX = 1,
  scaleY = 1,
}: SawakoSvgProps) {
  // Clamp eye tracking offset (proportional to eye dimensions)
  const pupilX = Math.max(-4, Math.min(4, eyeOffset.x * 4));
  const pupilY = Math.max(-3.5, Math.min(3.5, eyeOffset.y * 3.5));

  // Head tilt based on tracking
  const headRotate = Math.max(-5, Math.min(5, eyeOffset.x * 5));

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 240 380"
        className="w-44 h-72 drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] overflow-visible"
        aria-label="Sawako Anime Mascot"
        role="img"
      >
        <defs>
          {/* Hair gradient: Jet black with subtle deep slate sheen as in Kimi ni Todoke */}
          <linearGradient id="sawakoHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1f" />
            <stop offset="50%" stopColor="#22222a" />
            <stop offset="100%" stopColor="#121216" />
          </linearGradient>

          {/* Hair shine band */}
          <linearGradient id="sawakoHairShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b3b47" stopOpacity="0" />
            <stop offset="50%" stopColor="#525263" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3b3b47" stopOpacity="0" />
          </linearGradient>

          {/* Skin gradient: Pure fair porcelain with delicate warmth */}
          <linearGradient id="sawakoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff7f2" />
            <stop offset="100%" stopColor="#fae7de" />
          </linearGradient>

          {/* Eye Iris Gradient: Deep reflective charcoal-black */}
          <linearGradient id="sawakoEyeIris" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2d35" />
            <stop offset="40%" stopColor="#1f2026" />
            <stop offset="100%" stopColor="#0d0e12" />
          </linearGradient>

          {/* Iconic Pink Ribbon Bow Gradient (matching Sawako.jpg) */}
          <linearGradient id="sawakoPinkBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd1dc" />
            <stop offset="40%" stopColor="#fba3b7" />
            <stop offset="100%" stopColor="#f47290" />
          </linearGradient>

          {/* Ribbon Bow Highlight */}
          <linearGradient id="bowHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Blouse / Cardigan Gradient: Soft cream school knitwear */}
          <linearGradient id="sawakoCardiganGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#faf7f2" />
            <stop offset="100%" stopColor="#eee7dc" />
          </linearGradient>

          {/* Cardigan Shading */}
          <linearGradient id="sawakoCardiganShade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e3dbce" />
            <stop offset="15%" stopColor="#f3eee6" />
            <stop offset="85%" stopColor="#f3eee6" />
            <stop offset="100%" stopColor="#dfd7c9" />
          </linearGradient>

          {/* Pleated Navy School Skirt */}
          <linearGradient id="sawakoSkirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Socks Gradient: Dark Charcoal Navy */}
          <linearGradient id="sawakoSocksGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e2430" />
            <stop offset="100%" stopColor="#11141c" />
          </linearGradient>

          {/* Loafers Gradient */}
          <linearGradient id="sawakoShoesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#45271d" />
            <stop offset="100%" stopColor="#24140e" />
          </linearGradient>

          {/* Cheek Blush Radial Gradient */}
          <radialGradient id="sawakoCheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7b92" stopOpacity="0.65" />
            <stop offset="70%" stopColor="#ff7b92" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff7b92" stopOpacity="0" />
          </radialGradient>

          {/* Soft Ground Drop Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===================== GROUND DROP SHADOW ===================== */}
        <ellipse cx="120" cy="374" rx="46" ry="6" fill="url(#groundShadow)" />

        {/* ===================== BACK HAIR (FULL BODY LENGTH) ===================== */}
        <g className="transition-transform duration-300">
          {/* Long cascading straight black hair extending down past hips */}
          <path
            d="M 68 80 C 45 130, 38 210, 48 310 C 52 335, 62 345, 75 330 C 85 305, 90 270, 92 230 C 92 230, 148 230, 148 230 C 150 270, 155 305, 165 330 C 178 345, 188 335, 192 310 C 202 210, 195 130, 172 80 Z"
            fill="url(#sawakoHairGrad)"
            className={isDragging ? "animate-pulse" : ""}
          />
          {/* Hair shine overlay band */}
          <rect x="42" y="140" width="156" height="28" fill="url(#sawakoHairShine)" />
        </g>

        {/* ===================== LEGS & SOCKS & SHOES (FULL BODY) ===================== */}
        <g>
          {/* Left Leg (Dark Knee-high Sock) */}
          <path
            d="M 98 270 L 96 348 C 96 352, 98 356, 102 356 L 108 356 C 112 356, 114 352, 114 348 L 112 270 Z"
            fill="url(#sawakoSocksGrad)"
          />
          {/* Left Sock Top Band */}
          <line x1="98" y1="278" x2="112" y2="278" stroke="#334155" strokeWidth="1.5" />

          {/* Left Loafer / School Shoe */}
          <path
            d="M 94 352 C 94 348, 104 346, 114 348 C 118 350, 120 356, 118 364 C 117 367, 112 368, 98 368 C 93 368, 92 364, 93 358 Z"
            fill="url(#sawakoShoesGrad)"
            stroke="#1c0f0a"
            strokeWidth="1"
          />
          {/* Left Shoe Sole */}
          <path d="M 92 365 L 118 365 L 117 369 L 93 369 Z" fill="#1c0f0a" />
          {/* Left Shoe Highlight */}
          <ellipse cx="106" cy="354" rx="5" ry="2" fill="#ffffff" fillOpacity="0.3" />

          {/* Right Leg (Dark Knee-high Sock) */}
          <path
            d="M 128 270 L 126 348 C 126 352, 128 356, 132 356 L 138 356 C 142 356, 144 352, 144 348 L 142 270 Z"
            fill="url(#sawakoSocksGrad)"
          />
          {/* Right Sock Top Band */}
          <line x1="128" y1="278" x2="142" y2="278" stroke="#334155" strokeWidth="1.5" />

          {/* Right Loafer / School Shoe */}
          <path
            d="M 124 352 C 124 348, 134 346, 144 348 C 148 350, 150 356, 148 364 C 147 367, 142 368, 128 368 C 123 368, 122 364, 123 358 Z"
            fill="url(#sawakoShoesGrad)"
            stroke="#1c0f0a"
            strokeWidth="1"
          />
          {/* Right Shoe Sole */}
          <path d="M 122 365 L 148 365 L 147 369 L 123 369 Z" fill="#1c0f0a" />
          {/* Right Shoe Highlight */}
          <ellipse cx="136" cy="354" rx="5" ry="2" fill="#ffffff" fillOpacity="0.3" />
        </g>

        {/* ===================== PLEATED NAVY SKIRT ===================== */}
        <g>
          {/* Base skirt */}
          <path
            d="M 85 228 L 155 228 L 168 272 C 145 277, 95 277, 72 272 Z"
            fill="url(#sawakoSkirtGrad)"
            stroke="#0b1120"
            strokeWidth="1"
          />
          {/* Skirt pleat lines & shadow folds */}
          <path d="M 94 228 L 86 273" stroke="#334155" strokeWidth="1.2" />
          <path d="M 107 228 L 103 274" stroke="#334155" strokeWidth="1.2" />
          <path d="M 120 228 L 120 275" stroke="#334155" strokeWidth="1.2" />
          <path d="M 133 228 L 137 274" stroke="#334155" strokeWidth="1.2" />
          <path d="M 146 228 L 154 273" stroke="#334155" strokeWidth="1.2" />
        </g>

        {/* ===================== CARDIGAN / BLOUSE (MATCHING SAWAKO.JPG) ===================== */}
        <g>
          {/* Cardigan Torso */}
          <path
            d="M 78 142 C 72 155, 68 185, 66 228 C 84 232, 156 232, 174 228 C 172 185, 168 155, 162 142 C 148 138, 92 138, 78 142 Z"
            fill="url(#sawakoCardiganShade)"
            stroke="#d5cbbe"
            strokeWidth="1.2"
          />

          {/* Gentle scooped V-neck collar from Sawako.jpg */}
          <path
            d="M 100 140 Q 120 156 140 140 L 134 162 Q 120 172 106 162 Z"
            fill="url(#sawakoSkinGrad)"
          />
          {/* Collarbones / Neck shadow */}
          <path d="M 112 155 Q 120 159 128 155" stroke="#ecc8b8" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Front Button Placket */}
          <line x1="120" y1="168" x2="120" y2="230" stroke="#d5cbbe" strokeWidth="1.5" />

          {/* Cardigan Buttons (as in Sawako.jpg) */}
          <circle cx="120" cy="178" r="3.2" fill="#ffffff" stroke="#c4b8a7" strokeWidth="1" />
          <circle cx="120" cy="195" r="3.2" fill="#ffffff" stroke="#c4b8a7" strokeWidth="1" />
          <circle cx="120" cy="212" r="3.2" fill="#ffffff" stroke="#c4b8a7" strokeWidth="1" />

          {/* Cardigan Hem Band */}
          <path d="M 68 224 Q 120 231 172 224" stroke="#c4b8a7" strokeWidth="2.5" fill="none" />

          {/* Left Sleeve & Hand */}
          <path
            d="M 80 144 C 68 165, 58 195, 64 226 C 68 228, 74 224, 76 218 C 76 195, 82 170, 88 152 Z"
            fill="url(#sawakoCardiganGrad)"
            stroke="#d5cbbe"
            strokeWidth="1"
          />
          {/* Left Hand / Fingers */}
          <ellipse cx="64" cy="232" rx="5" ry="6" fill="url(#sawakoSkinGrad)" stroke="#f0d5c8" strokeWidth="0.8" />

          {/* Right Sleeve & Hand */}
          <path
            d="M 160 144 C 172 165, 182 195, 176 226 C 172 228, 166 224, 164 218 C 164 195, 158 170, 152 152 Z"
            fill="url(#sawakoCardiganGrad)"
            stroke="#d5cbbe"
            strokeWidth="1"
          />
          {/* Right Hand / Fingers */}
          <ellipse cx="176" cy="232" rx="5" ry="6" fill="url(#sawakoSkinGrad)" stroke="#f0d5c8" strokeWidth="0.8" />
        </g>

        {/* ===================== FRONT LONG HAIR STRANDS ===================== */}
        <g>
          {/* Left long hair strand falling over shoulder & chest (as in Sawako.jpg) */}
          <path
            d="M 72 82 C 65 110, 68 160, 68 220 C 68 245, 62 270, 66 278 C 70 270, 74 245, 74 220 C 76 160, 78 115, 84 90 Z"
            fill="url(#sawakoHairGrad)"
          />
          {/* Right long hair strand falling over shoulder & chest (as in Sawako.jpg) */}
          <path
            d="M 168 82 C 175 110, 172 160, 172 220 C 172 245, 178 270, 174 278 C 170 270, 166 245, 166 220 C 164 160, 162 115, 156 90 Z"
            fill="url(#sawakoHairGrad)"
          />
        </g>

        {/* ===================== HEAD GROUP (TILTS WITH MOUSE) ===================== */}
        <g
          style={{
            transform: `rotate(${headRotate}deg)`,
            transformOrigin: "120px 105px",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Neck */}
          <path d="M 112 125 L 112 145 L 128 145 L 128 125 Z" fill="url(#sawakoSkinGrad)" />
          {/* Soft neck shadow below chin */}
          <polygon points="112,125 128,125 120,136" fill="#f0d3c6" />

          {/* Sawako's Delicate Face Contour */}
          <path
            d="M 72 75 C 68 105, 80 134, 120 140 C 160 134, 172 105, 168 75 C 165 42, 75 42, 72 75 Z"
            fill="url(#sawakoSkinGrad)"
          />

          {/* Ears */}
          <ellipse cx="71" cy="98" rx="4.5" ry="8" fill="url(#sawakoSkinGrad)" />
          <ellipse cx="169" cy="98" rx="4.5" ry="8" fill="url(#sawakoSkinGrad)" />

          {/* ===================== CHEEK BLUSH (SAWAKO'S SIGNATURE WARM BLUSH) ===================== */}
          <g>
            {/* Left Cheek Blush */}
            <ellipse cx="88" cy="114" rx="14" ry="8" fill="url(#sawakoCheekBlush)" />
            {/* Delicate fine anime blush lines across left cheek as in Sawako.jpg */}
            <line x1="82" y1="112" x2="84" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />
            <line x1="86" y1="111" x2="88" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />
            <line x1="90" y1="112" x2="92" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />

            {/* Right Cheek Blush */}
            <ellipse cx="152" cy="114" rx="14" ry="8" fill="url(#sawakoCheekBlush)" />
            {/* Delicate fine anime blush lines across right cheek as in Sawako.jpg */}
            <line x1="148" y1="112" x2="150" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />
            <line x1="152" y1="111" x2="154" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />
            <line x1="156" y1="112" x2="158" y2="117" stroke="#ff7b92" strokeWidth="1" strokeLinecap="round" />

            {/* Subtle warmth over nose bridge */}
            <ellipse cx="120" cy="112" rx="8" ry="3.5" fill="url(#sawakoCheekBlush)" />
          </g>

          {/* Tiny beauty mark / drop circle on lower cheek from Sawako.jpg */}
          <circle cx="152" cy="125" r="1.2" fill="#d9777f" fillOpacity="0.75" />

          {/* ===================== EYES (LARGE, INNOCENT, DEEP ANIME EYES) ===================== */}
          {expression === "dizzy" ? (
            // Comedic Hypnotic Swirl Eyes (@.@)
            <g>
              <circle cx="94" cy="98" r="13" fill="#ffffff" stroke="#1f2026" strokeWidth="2.5" />
              <path
                d="M 94 98 m -8, 0 a 8,8 0 1,0 16,0 a 5,5 0 1,0 -10,0 a 2.5,2.5 0 1,0 5,0"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="animate-spin origin-[94px_98px]"
              />
              <circle cx="146" cy="98" r="13" fill="#ffffff" stroke="#1f2026" strokeWidth="2.5" />
              <path
                d="M 146 98 m -8, 0 a 8,8 0 1,0 16,0 a 5,5 0 1,0 -10,0 a 2.5,2.5 0 1,0 5,0"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="animate-spin origin-[146px_98px]"
              />
            </g>
          ) : expression === "sleepy" ? (
            // Sweet peaceful sleepy eyes (^ ^)
            <g>
              <path d="M 84 100 Q 94 108 104 100" stroke="#1f2026" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M 136 100 Q 146 108 156 100" stroke="#1f2026" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Sawako's big iconic anime eyes with pupil tracking
            <g>
              {/* Left Eye Whites */}
              <ellipse cx="94" cy="98" rx="14" ry="16" fill="#ffffff" stroke="#1f2026" strokeWidth="1.8" />
              {/* Left Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="94" cy="98" rx="10" ry="13" fill="url(#sawakoEyeIris)" />
                <circle cx="94" cy="99" r="6" fill="#090a0d" />
                {/* Specular White Highlights (matching Sawako.jpg) */}
                <circle cx="91" cy="93" r="3.6" fill="#ffffff" />
                <circle cx="97" cy="103" r="1.8" fill="#ffffff" fillOpacity="0.85" />
              </g>
              {/* Left Upper Eyelash (thick black anime lash line) */}
              <path d="M 78 92 Q 94 85 110 93" stroke="#111217" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              {/* Left Lower Eyelash Ticks (fine lash flicks as in Sawako.jpg) */}
              <path d="M 83 108 L 81 112" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 89 111 L 88 115" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 96 111 L 96 115" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 103 109 L 104 113" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />

              {/* Right Eye Whites */}
              <ellipse cx="146" cy="98" rx="14" ry="16" fill="#ffffff" stroke="#1f2026" strokeWidth="1.8" />
              {/* Right Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="146" cy="98" rx="10" ry="13" fill="url(#sawakoEyeIris)" />
                <circle cx="146" cy="99" r="6" fill="#090a0d" />
                {/* Specular White Highlights (matching Sawako.jpg) */}
                <circle cx="143" cy="93" r="3.6" fill="#ffffff" />
                <circle cx="149" cy="103" r="1.8" fill="#ffffff" fillOpacity="0.85" />
              </g>
              {/* Right Upper Eyelash (thick black anime lash line) */}
              <path d="M 130 93 Q 146 85 162 92" stroke="#111217" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              {/* Right Lower Eyelash Ticks (fine lash flicks as in Sawako.jpg) */}
              <path d="M 137 109 L 136 113" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 144 111 L 144 115" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 151 111 L 152 115" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 157 108 L 159 112" stroke="#111217" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          )}

          {/* Delicate Eyebrows (fine thin straight lines visible through hair) */}
          {expression === "pout" ? (
            <>
              <path d="M 84 81 Q 94 85 104 83" stroke="#22222a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 156 81 Q 146 85 136 83" stroke="#22222a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <path d="M 84 80 Q 94 76 104 80" stroke="#22222a" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 156 80 Q 146 76 136 80" stroke="#22222a" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Nose (delicate vertical anime line from Sawako.jpg) */}
          <line x1="120" y1="112" x2="121" y2="117" stroke="#944d56" strokeWidth="1.4" strokeLinecap="round" />

          {/* Mouth (small, delicate, gentle as in Sawako.jpg) */}
          {expression === "pout" ? (
            // Cute flustered wavy pout
            <path d="M 113 128 Q 120 123 127 128" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : expression === "dizzy" ? (
            // Flustered squiggly mouth
            <path d="M 112 127 Q 116 124 120 127 Q 124 130 128 127" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : expression === "happy" ? (
            // Sweet open smile
            <path d="M 112 125 Q 120 133 128 125 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
          ) : (
            // Gentle slightly-parted lips from Sawako.jpg
            <g>
              <path d="M 114 125 Q 120 128 126 125" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="117" y1="130" x2="123" y2="130" stroke="#f47290" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* ===================== SAWAKO'S ICONIC STRAIGHT FRINGE BANGS ===================== */}
          <g>
            {/* Outer Hair Crown Cap */}
            <path
              d="M 68 80 C 66 38, 85 24, 120 24 C 155 24, 174 38, 172 80 C 160 76, 80 76, 68 80 Z"
              fill="url(#sawakoHairGrad)"
            />

            {/* Straight anime fringe / bangs cut straight across with neat gaps (matching Sawako.jpg) */}
            {/* Left side strand */}
            <path d="M 70 78 L 76 112 L 82 86 Z" fill="url(#sawakoHairGrad)" />
            {/* Left mid strand */}
            <path d="M 82 82 L 88 108 L 94 84 Z" fill="url(#sawakoHairGrad)" />
            {/* Center-left strand */}
            <path d="M 94 80 L 102 106 L 108 82 Z" fill="url(#sawakoHairGrad)" />
            {/* Center strand */}
            <path d="M 108 80 L 116 104 L 124 80 Z" fill="url(#sawakoHairGrad)" />
            {/* Center-right strand */}
            <path d="M 124 82 L 132 106 L 140 82 Z" fill="url(#sawakoHairGrad)" />
            {/* Right mid strand */}
            <path d="M 140 82 L 148 108 L 154 84 Z" fill="url(#sawakoHairGrad)" />
            {/* Right side strand */}
            <path d="M 154 78 L 164 112 L 170 82 Z" fill="url(#sawakoHairGrad)" />

            {/* Side framing hime locks */}
            <path d="M 68 80 C 65 110, 68 140, 72 155 L 76 150 C 73 130, 73 100, 76 82 Z" fill="url(#sawakoHairGrad)" />
            <path d="M 172 80 C 175 110, 172 140, 168 155 L 164 150 C 167 130, 167 100, 164 82 Z" fill="url(#sawakoHairGrad)" />
          </g>

          {/* ===================== THE ICONIC PINK RIBBON BOW (MATCHING SAWAKO.JPG) ===================== */}
          {/* Positioned on the left side of Sawako's hair (viewer's right, at x ~ 162, y ~ 52) */}
          <g
            transform="translate(162, 52) rotate(12)"
            className={isHovered ? "transition-transform duration-200 scale-110" : "transition-transform duration-300"}
          >
            {/* Left Bow Loop */}
            <path
              d="M 0 0 C -16 -12, -26 -2, -18 8 C -14 12, -4 4, 0 0 Z"
              fill="url(#sawakoPinkBowGrad)"
              stroke="#e16182"
              strokeWidth="1.5"
            />
            {/* Left Bow Inner Hole */}
            <ellipse cx="-12" cy="0" rx="3.5" ry="2.5" fill="#fdf2f4" />

            {/* Right Bow Loop */}
            <path
              d="M 0 0 C 16 -12, 26 -2, 18 8 C 14 12, 4 4, 0 0 Z"
              fill="url(#sawakoPinkBowGrad)"
              stroke="#e16182"
              strokeWidth="1.5"
            />
            {/* Right Bow Inner Hole */}
            <ellipse cx="12" cy="0" rx="3.5" ry="2.5" fill="#fdf2f4" />

            {/* Center Bow Knot */}
            <ellipse cx="0" cy="0" rx="5.5" ry="6" fill="#f47290" stroke="#be123c" strokeWidth="1.2" />
            <circle cx="-1" cy="-1.5" r="1.5" fill="#ffffff" fillOpacity="0.75" />

            {/* Gentle Ribbon Tail ends */}
            <path d="M -3 4 C -8 14, -14 18, -12 22 C -8 20, -4 14, -1 6 Z" fill="url(#sawakoPinkBowGrad)" stroke="#e16182" strokeWidth="1" />
            <path d="M 3 4 C 8 14, 14 18, 12 22 C 8 20, 4 14, 1 6 Z" fill="url(#sawakoPinkBowGrad)" stroke="#e16182" strokeWidth="1" />
          </g>
        </g>

        {/* ===================== FLOATING ANIME SYMBOLS ===================== */}
        {symbol === "anger" && (
          // Anime anger vein mark 💢
          <g transform="translate(182, 38) scale(0.9)" className="animate-bounce">
            <path
              d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {symbol === "sweat" && (
          // Classic Sawako giant blue sweatdrop 💧
          <g transform="translate(184, 58)" className="animate-pulse">
            <path d="M 8 0 C 14 8, 16 14, 10 18 C 4 22, -2 16, 2 10 Z" fill="#38bdf8" />
            <circle cx="5" cy="14" r="1.5" fill="#ffffff" />
          </g>
        )}

        {symbol === "sparkle" && (
          // Sparkling stars ✨
          <g transform="translate(186, 42)" className="animate-spin origin-[186px_42px]">
            <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#facc15" />
          </g>
        )}

        {symbol === "zzz" && (
          // Sleepy Zzz
          <g transform="translate(178, 36)" className="animate-bounce">
            <text x="0" y="10" fill="#93c5fd" fontSize="14" fontWeight="bold" fontFamily="monospace">
              Zzz..
            </text>
          </g>
        )}

        {symbol === "heart" && (
          // Anime shy heart ❤️
          <g transform="translate(182, 40)" className="animate-ping origin-center">
            <path
              d="M 12 4 A 4 4 0 0 0 6 9 A 4 4 0 0 0 0 4 A 4 4 0 0 0 6 0 A 4 4 0 0 0 12 4 Z"
              fill="#f43f5e"
              transform="rotate(45 6 6)"
            />
          </g>
        )}

        {symbol === "question" && (
          // Question mark ❓
          <g transform="translate(184, 38)" className="animate-bounce">
            <text x="0" y="16" fill="#f59e0b" fontSize="18" fontWeight="black" fontFamily="sans-serif">
              ?
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
