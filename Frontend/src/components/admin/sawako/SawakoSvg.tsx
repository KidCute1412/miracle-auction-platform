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
  // Clamp pupil tracking
  const pupilX = Math.max(-3.5, Math.min(3.5, eyeOffset.x * 3.5));
  const pupilY = Math.max(-3, Math.min(3, eyeOffset.y * 3));

  // Gentle head tilt
  const headRotate = Math.max(-4, Math.min(4, eyeOffset.x * 4));

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 200 245"
        className="w-36 h-44 drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] overflow-visible"
        aria-label="Sawako Anime Mascot"
        role="img"
      >
        <defs>
          {/* Hair Gradient: Jet black to silky charcoal with subtle cool blue sheen */}
          <linearGradient id="sawakoHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a20" />
            <stop offset="45%" stopColor="#141419" />
            <stop offset="100%" stopColor="#0b0b0e" />
          </linearGradient>

          {/* Silky Hair Shine Arc (Tenshi no wa) */}
          <linearGradient id="sawakoHairGlossArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a4a5e" stopOpacity="0" />
            <stop offset="25%" stopColor="#686882" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8282a0" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#686882" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4a4a5e" stopOpacity="0" />
          </linearGradient>

          {/* Skin Gradient: Pure porcelain with soft warmth */}
          <linearGradient id="sawakoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffaf6" />
            <stop offset="100%" stopColor="#fdeee6" />
          </linearGradient>

          {/* Forehead Shadow Cast by Bangs */}
          <linearGradient id="bangsShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ecc0b0" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ecc0b0" stopOpacity="0" />
          </linearGradient>

          {/* Eye Iris Gradient: Deep anime charcoal */}
          <linearGradient id="sawakoEyeIris" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b2d36" />
            <stop offset="40%" stopColor="#1a1b22" />
            <stop offset="100%" stopColor="#0a0a0e" />
          </linearGradient>

          {/* Puffy Pink Hair Bow Gradient (matching Sawako.jpg) */}
          <linearGradient id="sawakoBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd8e2" />
            <stop offset="45%" stopColor="#fcaec1" />
            <stop offset="100%" stopColor="#f47895" />
          </linearGradient>

          {/* Cream School Cardigan Gradient */}
          <linearGradient id="sawakoCardigan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fcf9f4" />
            <stop offset="100%" stopColor="#ede5d8" />
          </linearGradient>

          {/* Navy Pleated Skirt Gradient */}
          <linearGradient id="sawakoSkirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#25334a" />
            <stop offset="100%" stopColor="#121b2a" />
          </linearGradient>

          {/* Dark Knee-High Socks */}
          <linearGradient id="sawakoSocks" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1f2430" />
            <stop offset="100%" stopColor="#0f1218" />
          </linearGradient>

          {/* Cute Strawberry Cheek Blush */}
          <radialGradient id="cuteBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6584" stopOpacity="0.65" />
            <stop offset="65%" stopColor="#ff6584" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff6584" stopOpacity="0" />
          </radialGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===================== SOFT GROUND SHADOW ===================== */}
        <ellipse cx="100" cy="240" rx="38" ry="4.5" fill="url(#groundShadow)" />

        {/* ===================== LONG BACK HAIR (SILKY FLOW) ===================== */}
        <g className="transition-transform duration-300">
          <path
            d="M 52 48 C 34 82, 28 138, 35 215 C 39 226, 48 226, 54 212 C 60 190, 68 160, 72 135 C 72 135, 128 135, 128 135 C 132 160, 140 190, 146 212 C 152 226, 161 226, 165 215 C 172 138, 166 82, 148 48 Z"
            fill="url(#sawakoHairGrad)"
            className={isDragging ? "animate-pulse" : ""}
          />
        </g>

        {/* ===================== FULL BODY: LEGS & SHOES ===================== */}
        <g>
          {/* Left Leg & Sock */}
          <path
            d="M 83 185 L 81 228 C 81 231, 83 233, 86 233 L 90 233 C 93 233, 95 231, 95 228 L 94 185 Z"
            fill="url(#sawakoSocks)"
          />
          {/* Left Shoe */}
          <path
            d="M 79 230 C 79 227, 88 226, 96 227 C 98 229, 99 233, 97 238 C 95 240, 92 241, 82 241 C 78 241, 78 238, 79 233 Z"
            fill="#301c14"
            stroke="#170c08"
            strokeWidth="0.8"
          />
          <ellipse cx="88" cy="230" rx="3.5" ry="1.2" fill="#ffffff" fillOpacity="0.3" />

          {/* Right Leg & Sock */}
          <path
            d="M 106 185 L 105 228 C 105 231, 107 233, 110 233 L 114 233 C 117 233, 119 231, 119 228 L 117 185 Z"
            fill="url(#sawakoSocks)"
          />
          {/* Right Shoe */}
          <path
            d="M 104 230 C 104 227, 113 226, 121 227 C 123 229, 124 233, 122 238 C 120 240, 117 241, 107 241 C 103 241, 103 238, 104 233 Z"
            fill="#301c14"
            stroke="#170c08"
            strokeWidth="0.8"
          />
          <ellipse cx="113" cy="230" rx="3.5" ry="1.2" fill="#ffffff" fillOpacity="0.3" />
        </g>

        {/* ===================== FULL BODY: PLEATED SKIRT ===================== */}
        <g>
          <path
            d="M 72 155 L 128 155 L 138 186 C 120 190, 80 190, 62 186 Z"
            fill="url(#sawakoSkirt)"
            stroke="#0d141e"
            strokeWidth="0.8"
          />
          {/* Skirt pleats */}
          <line x1="80" y1="155" x2="74" y2="187" stroke="#334155" strokeWidth="1" />
          <line x1="92" y1="155" x2="89" y2="188" stroke="#334155" strokeWidth="1" />
          <line x1="100" y1="155" x2="100" y2="188" stroke="#334155" strokeWidth="1" />
          <line x1="108" y1="155" x2="111" y2="188" stroke="#334155" strokeWidth="1" />
          <line x1="120" y1="155" x2="126" y2="187" stroke="#334155" strokeWidth="1" />
        </g>

        {/* ===================== FULL BODY: CARDIGAN / BLOUSE ===================== */}
        <g>
          {/* Cream School Cardigan */}
          <path
            d="M 68 106 C 64 115, 61 130, 59 156 C 72 159, 128 159, 141 156 C 139 130, 136 115, 132 106 C 122 103, 78 103, 68 106 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="1"
          />

          {/* Neck Opening */}
          <path d="M 86 104 Q 100 114 114 104 L 110 118 Q 100 125 90 118 Z" fill="url(#sawakoSkinGrad)" />

          {/* Front Button Line */}
          <line x1="100" y1="122" x2="100" y2="157" stroke="#d5cbbe" strokeWidth="1.2" />
          {/* Delicate Cardigan Buttons (from Sawako.jpg) */}
          <circle cx="100" cy="129" r="2.4" fill="#ffffff" stroke="#c2b6a4" strokeWidth="0.8" />
          <circle cx="100" cy="141" r="2.4" fill="#ffffff" stroke="#c2b6a4" strokeWidth="0.8" />
          <circle cx="100" cy="152" r="2.4" fill="#ffffff" stroke="#c2b6a4" strokeWidth="0.8" />

          {/* Left Sleeve & Petite Hand */}
          <path
            d="M 69 108 C 60 122, 53 140, 57 155 C 60 156, 64 154, 66 150 C 67 136, 71 122, 75 112 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="0.8"
          />
          <circle cx="58" cy="159" r="4.2" fill="url(#sawakoSkinGrad)" stroke="#f2d7ca" strokeWidth="0.6" />

          {/* Right Sleeve & Petite Hand */}
          <path
            d="M 131 108 C 140 122, 147 140, 143 155 C 140 156, 136 154, 134 150 C 133 136, 129 122, 125 112 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="0.8"
          />
          <circle cx="142" cy="159" r="4.2" fill="url(#sawakoSkinGrad)" stroke="#f2d7ca" strokeWidth="0.6" />
        </g>

        {/* ===================== FRONT HAIR STRANDS (SILKY DRAPING) ===================== */}
        <g>
          {/* Left front strand falling smoothly over chest */}
          <path
            d="M 60 52 C 55 76, 56 112, 56 160 C 56 174, 52 181, 56 182 C 60 181, 62 172, 62 160 C 64 116, 66 80, 71 62 Z"
            fill="url(#sawakoHairGrad)"
          />
          {/* Left front strand hair highlight line */}
          <path d="M 61 70 C 58 100, 59 135, 59 160" stroke="#373748" strokeWidth="0.9" strokeLinecap="round" fill="none" />

          {/* Right front strand falling smoothly over chest */}
          <path
            d="M 140 52 C 145 76, 144 112, 144 160 C 144 174, 148 181, 144 182 C 140 181, 138 172, 138 160 C 136 116, 134 80, 129 62 Z"
            fill="url(#sawakoHairGrad)"
          />
          {/* Right front strand hair highlight line */}
          <path d="M 139 70 C 142 100, 141 135, 141 160" stroke="#373748" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        </g>

        {/* ===================== HEAD & CUTE FACE (MATCHING SAWAKO.JPG) ===================== */}
        <g
          style={{
            transform: `rotate(${headRotate}deg)`,
            transformOrigin: "100px 75px",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Slender Petite Neck */}
          <path d="M 94 92 L 94 106 L 106 106 L 106 92 Z" fill="url(#sawakoSkinGrad)" />
          <polygon points="94,92 106,92 100,101" fill="#f1d6ca" />

          {/* Cute Round Face Contour with soft chubby anime cheeks */}
          <path
            d="M 60 52 C 57 80, 66 98, 100 102 C 134 98, 143 80, 140 52 C 138 28, 62 28, 60 52 Z"
            fill="url(#sawakoSkinGrad)"
          />

          {/* Soft Forehead Shadow cast under bangs */}
          <path d="M 62 50 C 62 66, 75 74, 100 74 C 125 74, 138 66, 138 50 Z" fill="url(#bangsShadowGrad)" />

          {/* Delicate Ears */}
          <ellipse cx="59" cy="70" rx="3.5" ry="6" fill="url(#sawakoSkinGrad)" />
          <ellipse cx="141" cy="70" rx="3.5" ry="6" fill="url(#sawakoSkinGrad)" />

          {/* ===================== CUTE CHEEK BLUSH (EXACT TO SAWAKO.JPG) ===================== */}
          <g>
            {/* Left Cheek Blush */}
            <ellipse cx="76" cy="80" rx="12" ry="7" fill="url(#cuteBlush)" />
            {/* Fine delicate anime blush ticks */}
            <line x1="71" y1="78" x2="72.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="75" y1="77" x2="76.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="79" y1="78" x2="80.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />

            {/* Right Cheek Blush */}
            <ellipse cx="124" cy="80" rx="12" ry="7" fill="url(#cuteBlush)" />
            {/* Fine delicate anime blush ticks */}
            <line x1="119" y1="78" x2="120.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="123" y1="77" x2="124.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="127" y1="78" x2="128.5" y2="83" stroke="#ff6584" strokeWidth="0.9" strokeLinecap="round" />

            {/* Soft Warmth over Nose Bridge */}
            <ellipse cx="100" cy="78" rx="6" ry="2.5" fill="url(#cuteBlush)" />
          </g>

          {/* Tiny beauty mark circle from Sawako.jpg on lower cheek */}
          <circle cx="124" cy="89" r="1.1" fill="#d9777f" fillOpacity="0.8" />

          {/* ===================== BIG CUTE INNOCENT EYES ===================== */}
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
            // Sawako's large, wide, innocent round eyes (from Sawako.jpg)
            <g>
              {/* Left Eye Whites */}
              <ellipse cx="80" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
              {/* Left Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="80" cy="68" rx="9" ry="11.5" fill="url(#sawakoEyeIris)" />
                <circle cx="80" cy="69" r="5" fill="#08080b" />
                {/* Big cute specular shine in upper-left */}
                <circle cx="77.5" cy="64" r="3.2" fill="#ffffff" />
                {/* Secondary soft reflection in lower-right */}
                <circle cx="83" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
              </g>
              {/* Left Upper Lash Line (thick arched anime curve) */}
              <path d="M 66 64 Q 80 57 94 65" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              {/* Delicate Lower Eyelash Ticks (from Sawako.jpg) */}
              <line x1="71" y1="77" x2="69.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="76" y1="79" x2="75.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="82" y1="79" x2="82" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="87" y1="78" x2="88" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />

              {/* Right Eye Whites */}
              <ellipse cx="120" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
              {/* Right Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="120" cy="68" rx="9" ry="11.5" fill="url(#sawakoEyeIris)" />
                <circle cx="120" cy="69" r="5" fill="#08080b" />
                {/* Big cute specular shine in upper-left */}
                <circle cx="117.5" cy="64" r="3.2" fill="#ffffff" />
                {/* Secondary soft reflection in lower-right */}
                <circle cx="123" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
              </g>
              {/* Right Upper Lash Line (thick arched anime curve) */}
              <path d="M 106 65 Q 120 57 134 64" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              {/* Delicate Lower Eyelash Ticks (from Sawako.jpg) */}
              <line x1="113" y1="78" x2="112" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="118" y1="79" x2="118" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="124" y1="79" x2="124.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="129" y1="77" x2="130.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* Thin Delicate Eyebrows (visible through natural bangs gaps) */}
          <path d="M 72 54 Q 80 50 88 53" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 128 54 Q 120 50 112 53" stroke="#22222a" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Tiny Nose Mark (from Sawako.jpg) */}
          <line x1="100" y1="77" x2="100.5" y2="81" stroke="#9e5660" strokeWidth="1.2" strokeLinecap="round" />

          {/* ===================== CUTE SHY MOUTH (MATCHING SAWAKO.JPG) ===================== */}
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
            // Shy slightly-open gentle lips from Sawako.jpg
            <g>
              <ellipse cx="100" cy="89" rx="4.5" ry="2.2" fill="#fda4af" stroke="#be123c" strokeWidth="1.2" />
              <line x1="97" y1="93" x2="103" y2="93" stroke="#fb7185" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* ===================== NATURAL ANIME STRAIGHT BLUNT BANGS ===================== */}
          <g>
            {/* Smooth Rounded Head Crown (Dome Contour) */}
            <path
              d="M 58 52 C 55 20, 72 10, 100 10 C 128 10, 145 20, 142 52 C 130 46, 70 46, 58 52 Z"
              fill="url(#sawakoHairGrad)"
            />

            {/* Tenshi no wa (Silky Gloss Halo Arc across Crown) */}
            <path
              d="M 64 36 C 74 27, 90 23, 100 23 C 110 23, 126 27, 136 36 C 126 31, 110 28, 100 28 C 90 28, 74 31, 64 36 Z"
              fill="url(#sawakoHairGlossArc)"
            />

            {/* Organic Straight Blunt Bangs with Natural Bezier Curves & Rounded Tips (matching Sawako.jpg) */}
            <path
              d="
                M 58 52
                C 56 64, 57 80, 60 96
                C 62 98, 65 98, 66 94
                C 65 82, 66 70, 68 62
                C 68 66, 68 74, 70 76
                C 71 78, 74 78, 75 75
                C 76 70, 77 65, 78 58
                C 79 64, 80 72, 82 74
                C 83 76, 86 76, 87 73
                C 88 68, 89 62, 90 56
                C 91 62, 92 70, 95 72
                C 96 74, 99 74, 100 71
                C 101 65, 102 60, 103 56
                C 104 62, 105 70, 108 72
                C 109 74, 112 74, 113 71
                C 114 66, 115 60, 116 56
                C 117 62, 118 71, 121 73
                C 122 75, 125 75, 126 72
                C 127 67, 128 62, 129 58
                C 130 64, 131 73, 133 75
                C 134 77, 137 77, 138 73
                C 139 66, 140 60, 141 54
                C 142 68, 143 82, 141 94
                C 142 98, 145 98, 147 95
                C 149 80, 146 64, 142 52
                Z
              "
              fill="url(#sawakoHairGrad)"
            />

            {/* Delicate Interior Hair Flow Accent Lines */}
            <path d="M 72 38 C 72 48, 73 60, 73 72" stroke="#2b2b38" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 85 32 C 85 44, 85 58, 85 70" stroke="#2b2b38" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 100 28 C 100 42, 100 56, 100 68" stroke="#2b2b38" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 115 32 C 115 44, 115 58, 115 70" stroke="#2b2b38" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 128 38 C 128 48, 127 60, 127 72" stroke="#2b2b38" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </g>

          {/* ===================== ICONIC PUFFY PINK RIBBON BOW ===================== */}
          {/* Positioned on left side of her hair (viewer's right) as in Sawako.jpg */}
          <g
            transform="translate(135, 34) rotate(10)"
            className={isHovered ? "transition-transform duration-200 scale-110" : "transition-transform duration-300"}
          >
            {/* Left Bow Loop */}
            <path
              d="M 0 0 C -13 -10, -21 -2, -15 6 C -11 10, -3 3, 0 0 Z"
              fill="url(#sawakoBowGrad)"
              stroke="#e16182"
              strokeWidth="1.2"
            />
            <ellipse cx="-9.5" cy="0" rx="3" ry="2" fill="#fff5f7" />

            {/* Right Bow Loop */}
            <path
              d="M 0 0 C 13 -10, 21 -2, 15 6 C 11 10, 3 3, 0 0 Z"
              fill="url(#sawakoBowGrad)"
              stroke="#e16182"
              strokeWidth="1.2"
            />
            <ellipse cx="9.5" cy="0" rx="3" ry="2" fill="#fff5f7" />

            {/* Center Knot */}
            <ellipse cx="0" cy="0" rx="4.5" ry="5" fill="#f47290" stroke="#be123c" strokeWidth="1" />
            <circle cx="-1" cy="-1" r="1.2" fill="#ffffff" fillOpacity="0.8" />

            {/* Cute Ribbon Tails */}
            <path d="M -2 3 C -6 11, -11 14, -9 18 C -6 16, -3 11, -1 5 Z" fill="url(#sawakoBowGrad)" stroke="#e16182" strokeWidth="0.8" />
            <path d="M 2 3 C 6 11, 11 14, 9 18 C 6 16, 3 11, 1 5 Z" fill="url(#sawakoBowGrad)" stroke="#e16182" strokeWidth="0.8" />
          </g>
        </g>

        {/* ===================== FLOATING ANIME SYMBOLS ===================== */}
        {symbol === "anger" && (
          <g transform="translate(152, 22) scale(0.8)" className="animate-bounce">
            <path d="M 0 6 L 16 6 M 6 0 L 6 16 M 10 0 L 10 16 M 0 10 L 16 10" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {symbol === "sweat" && (
          <g transform="translate(154, 40)" className="animate-pulse">
            <path d="M 7 0 C 12 7, 14 12, 9 15 C 4 18, -1 13, 2 8 Z" fill="#38bdf8" />
            <circle cx="4" cy="11" r="1.2" fill="#ffffff" />
          </g>
        )}

        {symbol === "sparkle" && (
          <g transform="translate(154, 25)" className="animate-spin origin-[154px_25px]">
            <polygon points="8,0 10,5 16,8 10,11 8,16 6,11 0,8 6,5" fill="#facc15" />
          </g>
        )}

        {symbol === "zzz" && (
          <g transform="translate(148, 20)" className="animate-bounce">
            <text x="0" y="10" fill="#93c5fd" fontSize="12" fontWeight="bold" fontFamily="monospace">
              Zzz..
            </text>
          </g>
        )}

        {symbol === "heart" && (
          <g transform="translate(152, 24)" className="animate-ping origin-center">
            <path d="M 10 3 A 3.5 3.5 0 0 0 5 7.5 A 3.5 3.5 0 0 0 0 3 A 3.5 3.5 0 0 0 5 0 A 3.5 3.5 0 0 0 10 3 Z" fill="#f43f5e" transform="rotate(45 5 5)" />
          </g>
        )}

        {symbol === "question" && (
          <g transform="translate(152, 22)" className="animate-bounce">
            <text x="0" y="14" fill="#f59e0b" fontSize="16" fontWeight="black" fontFamily="sans-serif">
              ?
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
