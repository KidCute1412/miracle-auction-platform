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
  // Clamp eye tracking offset
  const pupilX = Math.max(-5, Math.min(5, eyeOffset.x * 5));
  const pupilY = Math.max(-4, Math.min(4, eyeOffset.y * 4));

  // Head tilt based on tracking
  const headRotate = Math.max(-6, Math.min(6, eyeOffset.x * 6));

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 200 220"
        className="w-40 h-44 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] overflow-visible"
        aria-label="Sawako Cat-Eared Anime Mascot"
        role="img"
      >
        <defs>
          {/* Hair gradient: Dark espresso to warm amber */}
          <linearGradient id="sawakoHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c1a1d" />
            <stop offset="60%" stopColor="#42252a" />
            <stop offset="100%" stopColor="#5a333a" />
          </linearGradient>

          {/* Skin gradient: Soft peach */}
          <linearGradient id="sawakoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff2eb" />
            <stop offset="100%" stopColor="#fde0d2" />
          </linearGradient>

          {/* Eye gradient: Vibrant amber gold */}
          <linearGradient id="sawakoEyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Champagne Gold Vanguard Elite accent */}
          <linearGradient id="sawakoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="100%" stopColor="#aa8c2c" />
          </linearGradient>

          {/* Obsidian suit gradient */}
          <linearGradient id="sawakoVestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1e24" />
            <stop offset="100%" stopColor="#0f0f14" />
          </linearGradient>

          {/* Ear inner blush */}
          <linearGradient id="sawakoEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>

          {/* Cheek blush */}
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===================== TWIN TAILS (BACK HAIR) ===================== */}
        <g className="transition-transform duration-300">
          {/* Left Twin Tail */}
          <path
            d="M 50 100 C 20 120, 10 160, 22 195 C 28 200, 38 185, 45 160 C 50 145, 55 125, 58 110 Z"
            fill="url(#sawakoHairGrad)"
            className={isDragging ? "animate-bounce" : isHovered ? "animate-pulse" : ""}
          />
          {/* Left Hair Ribbon (Gold) */}
          <ellipse cx="48" cy="105" rx="6" ry="4" fill="url(#sawakoGoldGrad)" transform="rotate(-20 48 105)" />

          {/* Right Twin Tail */}
          <path
            d="M 150 100 C 180 120, 190 160, 178 195 C 172 200, 162 185, 155 160 C 150 145, 145 125, 142 110 Z"
            fill="url(#sawakoHairGrad)"
            className={isDragging ? "animate-bounce" : isHovered ? "animate-pulse" : ""}
          />
          {/* Right Hair Ribbon (Gold) */}
          <ellipse cx="152" cy="105" rx="6" ry="4" fill="url(#sawakoGoldGrad)" transform="rotate(20 152 105)" />
        </g>

        {/* ===================== BODY & VEST ===================== */}
        <g transform="translate(0, 10)">
          {/* Shoulders / Torso */}
          <path
            d="M 68 140 C 60 145, 55 180, 52 205 C 80 210, 120 210, 148 205 C 145 180, 140 145, 132 140 Z"
            fill="url(#sawakoVestGrad)"
            stroke="url(#sawakoGoldGrad)"
            strokeWidth="1.5"
          />

          {/* White Shirt Collar */}
          <polygon points="100,165 82,142 118,142" fill="#ffffff" />

          {/* Champagne Gold Tie */}
          <polygon points="97,148 103,148 105,175 100,185 95,175" fill="url(#sawakoGoldGrad)" />

          {/* Gold Lapel Trims & Buttons */}
          <circle cx="100" cy="192" r="2.5" fill="url(#sawakoGoldGrad)" />
          <circle cx="100" cy="201" r="2" fill="url(#sawakoGoldGrad)" />

          {/* Miniature Chief Auditor Golden Badge */}
          <polygon points="76,165 80,160 84,165 82,172 78,172" fill="url(#sawakoGoldGrad)" />
        </g>

        {/* ===================== HEAD GROUP (TILTS WITH MOUSE) ===================== */}
        <g
          style={{
            transform: `rotate(${headRotate}deg)`,
            transformOrigin: "100px 120px",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Cat Ears (Nekomimi) */}
          {/* Left Cat Ear */}
          <g
            className={
              isHovered
                ? "transition-transform duration-150 -rotate-6 origin-[70px_55px]"
                : "transition-transform duration-300"
            }
          >
            {/* Outer Ear */}
            <path
              d="M 52 65 C 48 35, 58 12, 75 18 C 85 24, 88 45, 84 62 Z"
              fill="url(#sawakoHairGrad)"
              stroke="#2c1a1d"
              strokeWidth="2"
            />
            {/* Inner Pink Ear */}
            <path d="M 58 60 C 56 38, 64 24, 73 26 C 80 29, 82 46, 78 58 Z" fill="url(#sawakoEarInner)" />
            {/* Gold Ribbon Bell on Left Ear */}
            <circle cx="50" cy="65" r="4.5" fill="url(#sawakoGoldGrad)" />
            <circle cx="50" cy="66" r="1" fill="#713f12" />
          </g>

          {/* Right Cat Ear */}
          <g
            className={
              isHovered
                ? "transition-transform duration-150 rotate-6 origin-[130px_55px]"
                : "transition-transform duration-300"
            }
          >
            {/* Outer Ear */}
            <path
              d="M 148 65 C 152 35, 142 12, 125 18 C 115 24, 112 45, 116 62 Z"
              fill="url(#sawakoHairGrad)"
              stroke="#2c1a1d"
              strokeWidth="2"
            />
            {/* Inner Pink Ear */}
            <path d="M 142 60 C 144 38, 136 24, 127 26 C 120 29, 118 46, 122 58 Z" fill="url(#sawakoEarInner)" />
            {/* Gold Ribbon Bell on Right Ear */}
            <circle cx="150" cy="65" r="4.5" fill="url(#sawakoGoldGrad)" />
            <circle cx="150" cy="66" r="1" fill="#713f12" />
          </g>

          {/* Face Base */}
          <path
            d="M 60 75 C 55 110, 68 145, 100 148 C 132 145, 145 110, 140 75 C 138 52, 62 52, 60 75 Z"
            fill="url(#sawakoSkinGrad)"
          />

          {/* Hair Fringe / Bangs */}
          <path
            d="M 58 72 C 65 60, 85 50, 100 52 C 115 50, 135 60, 142 72 C 135 82, 122 88, 115 85 C 108 92, 95 94, 88 86 C 78 92, 68 85, 58 72 Z"
            fill="url(#sawakoHairGrad)"
          />

          {/* Eyebrows */}
          {expression === "pout" || expression === "smug" ? (
            <>
              {/* Tsundere furrowed angry/annoyed brows */}
              <path d="M 72 88 Q 82 93 88 90" stroke="#2c1a1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 128 88 Q 118 93 112 90" stroke="#2c1a1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : expression === "sleepy" ? (
            <>
              <path d="M 72 92 Q 80 89 88 92" stroke="#2c1a1d" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 128 92 Q 120 89 112 92" stroke="#2c1a1d" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Normal gentle arched brows */}
              <path d="M 72 89 Q 80 84 88 88" stroke="#2c1a1d" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 128 89 Q 120 84 112 88" stroke="#2c1a1d" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* ===================== EYES ===================== */}
          {expression === "dizzy" ? (
            // Comedic Hypnotic Swirl Eyes (@.@)
            <g>
              <circle cx="80" cy="104" r="10" fill="#ffffff" stroke="#2c1a1d" strokeWidth="2" />
              <path
                d="M 80 104 m -6, 0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-spin origin-[80px_104px]"
              />
              <circle cx="120" cy="104" r="10" fill="#ffffff" stroke="#2c1a1d" strokeWidth="2" />
              <path
                d="M 120 104 m -6, 0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-spin origin-[120px_104px]"
              />
            </g>
          ) : expression === "sleepy" ? (
            // Happy sleepy closed eye arcs (^ ^)
            <g>
              <path d="M 72 106 Q 80 114 88 106" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 112 106 Q 120 114 128 106" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Open expressive anime eyes with iris tracking
            <g>
              {/* Left Eye Whites */}
              <ellipse cx="80" cy="104" rx="10" ry="12" fill="#ffffff" stroke="#2c1a1d" strokeWidth="1.5" />
              {/* Left Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="80" cy="104" rx="7" ry="9" fill="url(#sawakoEyeGrad)" />
                <circle cx="80" cy="104" r="4" fill="#2c1a1d" />
                {/* Anime Light Highlights */}
                <circle cx="78" cy="100" r="2.5" fill="#ffffff" />
                <circle cx="82" cy="107" r="1.2" fill="#ffffff" />
              </g>
              {/* Top Eyelash */}
              <path d="M 68 98 Q 80 93 92 99" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Right Eye Whites */}
              <ellipse cx="120" cy="104" rx="10" ry="12" fill="#ffffff" stroke="#2c1a1d" strokeWidth="1.5" />
              {/* Right Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="120" cy="104" rx="7" ry="9" fill="url(#sawakoEyeGrad)" />
                <circle cx="120" cy="104" r="4" fill="#2c1a1d" />
                {/* Anime Light Highlights */}
                <circle cx="118" cy="100" r="2.5" fill="#ffffff" />
                <circle cx="122" cy="107" r="1.2" fill="#ffffff" />
              </g>
              {/* Top Eyelash */}
              <path d="M 108 99 Q 120 93 132 98" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* ===================== CHEEK BLUSH ===================== */}
          {(expression === "pout" || expression === "happy" || isHovered) && (
            <g>
              <ellipse cx="70" cy="116" rx="8" ry="5" fill="url(#cheekBlush)" />
              {/* Cute anime blush slashes */}
              <line x1="68" y1="114" x2="72" y2="118" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="71" y1="114" x2="75" y2="118" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />

              <ellipse cx="130" cy="116" rx="8" ry="5" fill="url(#cheekBlush)" />
              <line x1="125" y1="114" x2="129" y2="118" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="128" y1="114" x2="132" y2="118" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* Tiny Nose */}
          <circle cx="100" cy="116" r="1" fill="#e29578" />

          {/* ===================== MOUTH ===================== */}
          {expression === "pout" ? (
            // Annoyed tsundere pout frown
            <path d="M 94 130 Q 100 124 106 130" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : expression === "dizzy" ? (
            // Comedic wavy squiggly mouth
            <path d="M 93 128 Q 97 125 100 128 Q 103 131 107 128" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : expression === "happy" ? (
            // Cat w-mouth (:3)
            <path d="M 93 126 Q 96 130 100 127 Q 104 130 107 126" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            // Subtle cute small smile
            <path d="M 96 127 Q 100 131 104 127" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* ===================== FOREGROUND PAWS ===================== */}
        <g transform="translate(0, 12)">
          {/* Left Paws */}
          <ellipse cx="76" cy="198" rx="9" ry="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="76" cy="198" r="3" fill="#fda4af" />

          {/* Right Paws */}
          <ellipse cx="124" cy="198" rx="9" ry="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="124" cy="198" r="3" fill="#fda4af" />
        </g>

        {/* ===================== FLOATING ANIME SYMBOLS ===================== */}
        {symbol === "anger" && (
          // Anime anger vein mark 💢
          <g transform="translate(142, 42) scale(0.85)" className="animate-bounce">
            <path
              d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {symbol === "sweat" && (
          // Anime giant blue sweatdrop 💧
          <g transform="translate(140, 68)" className="animate-pulse">
            <path d="M 8 0 C 14 8, 16 14, 10 18 C 4 22, -2 16, 2 10 Z" fill="#38bdf8" />
            <circle cx="5" cy="14" r="1.5" fill="#ffffff" />
          </g>
        )}

        {symbol === "sparkle" && (
          // Sparkling stars ✨
          <g transform="translate(145, 45)" className="animate-spin origin-[145px_45px]">
            <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#facc15" />
          </g>
        )}

        {symbol === "zzz" && (
          // Sleepy Zzz
          <g transform="translate(138, 40)" className="animate-bounce">
            <text x="0" y="10" fill="#93c5fd" fontSize="14" fontWeight="bold" fontFamily="monospace">
              Zzz..
            </text>
          </g>
        )}

        {symbol === "heart" && (
          // Anime tsundere surprise heart ❤️
          <g transform="translate(142, 44)" className="animate-ping origin-center">
            <path
              d="M 12 4 A 4 4 0 0 0 6 9 A 4 4 0 0 0 0 4 A 4 4 0 0 0 6 0 A 4 4 0 0 0 12 4 Z"
              fill="#f43f5e"
              transform="rotate(45 6 6)"
            />
          </g>
        )}

        {symbol === "question" && (
          // Question mark ❓
          <g transform="translate(144, 42)" className="animate-bounce">
            <text x="0" y="16" fill="#f59e0b" fontSize="18" fontWeight="black" fontFamily="sans-serif">
              ?
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
