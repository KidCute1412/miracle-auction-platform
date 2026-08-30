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
          {/* Hair Gradient: Jet black as in Sawako better.jpg */}
          <linearGradient id="sawakoHair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#18181e" />
            <stop offset="50%" stopColor="#121216" />
            <stop offset="100%" stopColor="#0a0a0d" />
          </linearGradient>

          {/* Skin Gradient: Pure porcelain fair skin from Sawako better.jpg */}
          <linearGradient id="sawakoSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffaf6" />
            <stop offset="100%" stopColor="#fcedea" />
          </linearGradient>

          {/* Forehead Shadow under Bangs */}
          <linearGradient id="foreheadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ebb7a7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ebb7a7" stopOpacity="0" />
          </linearGradient>

          {/* Eye Iris Gradient: Deep anime charcoal */}
          <linearGradient id="sawakoIris" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e303a" />
            <stop offset="40%" stopColor="#1b1c22" />
            <stop offset="100%" stopColor="#08080b" />
          </linearGradient>

          {/* Cardigan / Blouse: Soft cream knitwear from Sawako better.jpg */}
          <linearGradient id="sawakoCardigan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdfbf8" />
            <stop offset="100%" stopColor="#eee7dc" />
          </linearGradient>

          {/* Navy Pleated Skirt */}
          <linearGradient id="sawakoSkirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#25334a" />
            <stop offset="100%" stopColor="#121b2a" />
          </linearGradient>

          {/* Dark Knee-High Socks */}
          <linearGradient id="sawakoSocks" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1f2430" />
            <stop offset="100%" stopColor="#0f1218" />
          </linearGradient>

          {/* Soft Strawberry Cheek Blush */}
          <radialGradient id="sawakoBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff627e" stopOpacity="0.65" />
            <stop offset="65%" stopColor="#ff627e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff627e" stopOpacity="0" />
          </radialGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===================== GROUND SHADOW ===================== */}
        <ellipse cx="100" cy="240" rx="38" ry="4.5" fill="url(#groundShadow)" />

        {/* ===================== LONG BACK HAIR (SILKY DRAPING) ===================== */}
        <g className="transition-transform duration-300">
          <path
            d="M 52 48 C 34 82, 28 138, 35 215 C 39 226, 48 226, 54 212 C 60 190, 68 160, 72 135 C 72 135, 128 135, 128 135 C 132 160, 140 190, 146 212 C 152 226, 161 226, 165 215 C 172 138, 166 82, 148 48 Z"
            fill="url(#sawakoHair)"
            className={isDragging ? "animate-pulse" : ""}
          />
        </g>

        {/* ===================== FULL BODY: LEGS & SHOES ===================== */}
        <g>
          {/* Left Leg & Dark Knee-High Sock */}
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

          {/* Right Leg & Dark Knee-High Sock */}
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

        {/* ===================== FULL BODY: PLEATED NAVY SKIRT ===================== */}
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

        {/* ===================== FULL BODY: CARDIGAN / BLOUSE (MATCHING SAWAKO BETTER.JPG) ===================== */}
        <g>
          {/* Cream School Cardigan */}
          <path
            d="M 68 106 C 64 115, 61 130, 59 156 C 72 159, 128 159, 141 156 C 139 130, 136 115, 132 106 C 122 103, 78 103, 68 106 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="1"
          />

          {/* Delicate Rounded Neckline from Sawako better.jpg */}
          <path d="M 86 104 Q 100 114 114 104 L 110 118 Q 100 125 90 118 Z" fill="url(#sawakoSkin)" />

          {/* Front Button Stitching Placket (from Sawako better.jpg) */}
          <line x1="100" y1="122" x2="100" y2="157" stroke="#d5cbbe" strokeWidth="1.2" strokeDasharray="3,1.5" />
          {/* Three Delicate Cardigan Buttons (from Sawako better.jpg) */}
          <circle cx="100" cy="129" r="2.4" fill="#ffffff" stroke="#b8aca0" strokeWidth="0.8" />
          <circle cx="100" cy="141" r="2.4" fill="#ffffff" stroke="#b8aca0" strokeWidth="0.8" />
          <circle cx="100" cy="152" r="2.4" fill="#ffffff" stroke="#b8aca0" strokeWidth="0.8" />

          {/* Left Sleeve & Petite Hand */}
          <path
            d="M 69 108 C 60 122, 53 140, 57 155 C 60 156, 64 154, 66 150 C 67 136, 71 122, 75 112 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="0.8"
          />
          <circle cx="58" cy="159" r="4.2" fill="url(#sawakoSkin)" stroke="#f2d7ca" strokeWidth="0.6" />

          {/* Right Sleeve & Petite Hand */}
          <path
            d="M 131 108 C 140 122, 147 140, 143 155 C 140 156, 136 154, 134 150 C 133 136, 129 122, 125 112 Z"
            fill="url(#sawakoCardigan)"
            stroke="#d8cfc0"
            strokeWidth="0.8"
          />
          <circle cx="142" cy="159" r="4.2" fill="url(#sawakoSkin)" stroke="#f2d7ca" strokeWidth="0.6" />
        </g>

        {/* ===================== FRONT LONG HAIR STRANDS ===================== */}
        <g>
          {/* Two iconic straight strands falling over chest (matching Sawako better.jpg) */}
          <path
            d="M 60 52 C 55 76, 56 112, 56 160 C 56 174, 52 181, 56 182 C 60 181, 62 172, 62 160 C 64 116, 66 80, 71 62 Z"
            fill="url(#sawakoHair)"
          />
          <path
            d="M 140 52 C 145 76, 144 112, 144 160 C 144 174, 148 181, 144 182 C 140 181, 138 172, 138 160 C 136 116, 134 80, 129 62 Z"
            fill="url(#sawakoHair)"
          />
        </g>

        {/* ===================== HEAD & CUTE FACE (EXACT TO SAWAKO BETTER.JPG) ===================== */}
        <g
          style={{
            transform: `rotate(${headRotate}deg)`,
            transformOrigin: "100px 75px",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Slender Petite Neck */}
          <path d="M 94 92 L 94 106 L 106 106 L 106 92 Z" fill="url(#sawakoSkin)" />
          <polygon points="94,92 106,92 100,101" fill="#f1d6ca" />

          {/* Cute Round Face Contour (matching Sawako better.jpg) */}
          <path
            d="M 60 52 C 57 80, 66 98, 100 102 C 134 98, 143 80, 140 52 C 138 28, 62 28, 60 52 Z"
            fill="url(#sawakoSkin)"
          />

          {/* Soft Forehead Shadow cast under bangs */}
          <path d="M 62 50 C 62 66, 75 74, 100 74 C 125 74, 138 66, 138 50 Z" fill="url(#foreheadShadow)" />

          {/* Delicate Ears */}
          <ellipse cx="59" cy="70" rx="3.5" ry="6" fill="url(#sawakoSkin)" />
          <ellipse cx="141" cy="70" rx="3.5" ry="6" fill="url(#sawakoSkin)" />

          {/* ===================== CUTE CHEEK BLUSH (EXACT TO SAWAKO BETTER.JPG) ===================== */}
          <g>
            {/* Left Cheek Blush */}
            <ellipse cx="76" cy="80" rx="12" ry="7" fill="url(#sawakoBlush)" />
            {/* Fine delicate anime blush ticks from Sawako better.jpg */}
            <line x1="71" y1="78" x2="72.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="75" y1="77" x2="76.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="79" y1="78" x2="80.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

            {/* Right Cheek Blush */}
            <ellipse cx="124" cy="80" rx="12" ry="7" fill="url(#sawakoBlush)" />
            {/* Fine delicate anime blush ticks from Sawako better.jpg */}
            <line x1="119" y1="78" x2="120.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="123" y1="77" x2="124.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="127" y1="78" x2="128.5" y2="83" stroke="#ff627e" strokeWidth="0.9" strokeLinecap="round" />

            {/* Soft Warmth over Nose Bridge */}
            <ellipse cx="100" cy="78" rx="6" ry="2.5" fill="url(#sawakoBlush)" />
          </g>

          {/* Tiny beauty mark on lower cheek (from Sawako better.jpg) */}
          <circle cx="124" cy="89" r="1.1" fill="#d9777f" fillOpacity="0.8" />

          {/* ===================== INNOCENT ROUND EYES (FROM SAWAKO BETTER.JPG) ===================== */}
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
            // Sawako's large, wide, innocent round eyes (matching Sawako better.jpg)
            <g>
              {/* Left Eye Whites */}
              <ellipse cx="80" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
              {/* Left Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="80" cy="68" rx="9" ry="11.5" fill="url(#sawakoIris)" />
                <circle cx="80" cy="69" r="5" fill="#08080b" />
                {/* Big crisp white specular shine in upper-left */}
                <circle cx="77.5" cy="64" r="3.2" fill="#ffffff" />
                {/* Secondary soft reflection in lower-right */}
                <circle cx="83" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
              </g>
              {/* Left Upper Lash Line (thick arched anime curve) */}
              <path d="M 66 64 Q 80 57 94 65" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
              <line x1="71" y1="77" x2="69.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="76" y1="79" x2="75.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="82" y1="79" x2="82" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="87" y1="78" x2="88" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />

              {/* Right Eye Whites */}
              <ellipse cx="120" cy="68" rx="12.5" ry="14" fill="#ffffff" stroke="#1c1d24" strokeWidth="1.5" />
              {/* Right Iris & Pupil */}
              <g transform={`translate(${pupilX}, ${pupilY})`}>
                <ellipse cx="120" cy="68" rx="9" ry="11.5" fill="url(#sawakoIris)" />
                <circle cx="120" cy="69" r="5" fill="#08080b" />
                {/* Big crisp white specular shine in upper-left */}
                <circle cx="117.5" cy="64" r="3.2" fill="#ffffff" />
                {/* Secondary soft reflection in lower-right */}
                <circle cx="123" cy="72" r="1.5" fill="#ffffff" fillOpacity="0.8" />
              </g>
              {/* Right Upper Lash Line (thick arched anime curve) */}
              <path d="M 106 65 Q 120 57 134 64" stroke="#101115" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              {/* Exactly 4 Delicate Lower Eyelash Ticks (from Sawako better.jpg) */}
              <line x1="113" y1="78" x2="112" y2="81" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="118" y1="79" x2="118" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="124" y1="79" x2="124.5" y2="82.5" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="129" y1="77" x2="130.5" y2="80" stroke="#101115" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* Delicate Eyebrows (peeking under the bangs gap) */}
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

          {/* ===================== STRAIGHT BANGS WITH NOTCHED GAP (FROM SAWAKO BETTER.JPG) ===================== */}
          <g>
            {/* Top Crown Cap */}
            <path
              d="M 58 52 C 55 20, 72 10, 100 10 C 128 10, 145 20, 142 52 C 130 46, 70 46, 58 52 Z"
              fill="url(#sawakoHair)"
            />

            {/* Straight Blunt Bangs with Distinct Rectangular Gaps (matching Sawako better.jpg) */}
            {/* Far Left Strand */}
            <path d="M 58 50 C 58 64, 60 82, 63 94 C 65 96, 68 96, 68 92 C 67 78, 68 64, 70 52 Z" fill="url(#sawakoHair)" />
            {/* Left Mid Strand */}
            <path d="M 71 52 C 72 62, 73 73, 76 75 C 78 76, 80 76, 81 74 C 82 66, 83 58, 84 52 Z" fill="url(#sawakoHair)" />
            {/* Center-Left Strand */}
            <path d="M 85 52 C 86 62, 87 72, 90 74 C 92 75, 95 75, 96 72 C 96 66, 97 58, 97 52 Z" fill="url(#sawakoHair)" />
            
            {/* Center Strand (Notice the wide gap to the right as in Sawako better.jpg!) */}
            <path d="M 98 52 C 99 60, 100 68, 103 70 C 105 71, 108 71, 109 69 C 109 64, 110 58, 111 52 Z" fill="url(#sawakoHair)" />
            
            {/* Center-Right Strand */}
            <path d="M 115 52 C 116 62, 117 72, 120 74 C 122 75, 125 75, 126 72 C 127 66, 128 58, 129 52 Z" fill="url(#sawakoHair)" />
            {/* Right Mid Strand */}
            <path d="M 130 52 C 131 62, 132 74, 134 76 C 136 77, 138 77, 139 74 C 140 66, 140 58, 141 52 Z" fill="url(#sawakoHair)" />
            {/* Far Right Strand */}
            <path d="M 141 52 C 142 66, 142 82, 140 94 C 141 97, 144 97, 145 93 C 147 80, 145 64, 142 52 Z" fill="url(#sawakoHair)" />
          </g>

          {/* ===================== THE ICONIC WHITE STAR HAIR CLIP (FROM SAWAKO BETTER.JPG) ===================== */}
          {/* Positioned on viewer's LEFT (her right side) at x ~ 65, y ~ 34 */}
          <g
            transform="translate(68, 36) rotate(-8)"
            className={isHovered ? "transition-transform duration-200 scale-110" : "transition-transform duration-300"}
          >
            {/* Brown/Dark Bobby Pin Bar underneath star (from Sawako better.jpg) */}
            <line x1="-12" y1="4" x2="16" y2="4" stroke="#4a3b32" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="-10" y1="7" x2="14" y2="7" stroke="#382b24" strokeWidth="1.8" strokeLinecap="round" />

            {/* Crisp 5-Pointed White Star Clip (matching Sawako better.jpg) */}
            <polygon
              points="0,-9 2.8,-2.8 9.5,-2.8 4.2,1.5 6.2,8 0,3.8 -6.2,8 -4.2,1.5 -9.5,-2.8 -2.8,-2.8"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            {/* Soft specular star center glow */}
            <circle cx="0" cy="-1" r="1.5" fill="#f8fafc" />
          </g>
        </g>

        {/* ===================== ANIMATED DOODLE STARS (FROM SAWAKO BETTER.JPG) ===================== */}
        {/* Floating white doodle star on left (from Sawako better.jpg) */}
        <g transform="translate(18, 70)" className="animate-pulse opacity-85">
          <path
            d="M 0 -8 L 2.5 -2.5 L 8 -2.5 L 3.5 1.2 L 5.2 7 L 0 3.2 L -5.2 7 L -3.5 1.2 L -8 -2.5 L -2.5 -2.5 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Floating doodle sparkles on upper-right (from Sawako better.jpg) */}
        <g transform="translate(170, 35)" className="animate-bounce opacity-85">
          <line x1="0" y1="0" x2="10" y2="10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="8" y1="-8" x2="16" y2="-16" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="4" x2="22" y2="4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ===================== FLOATING ANIME EMOTION SYMBOLS ===================== */}
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
