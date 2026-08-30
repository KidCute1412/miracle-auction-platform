import React from "react";

/**
 * SawakoBaseArtwork - Authentic Full-Body Chibi Vector Puppet
 * Modeled after the reference anime portrait from Kimi ni Todoke ("Sawako better.jpg")
 * Features:
 * - Nendoroid Chibi proportions (~2.5 heads tall)
 * - Jet-black hair dome with soft gloss highlight
 * - Cute rounded chibi face contour with soft blush
 * - Signature white 5-pointed star clip on character's right hair temple
 * - Button-up cream cardigan with detailed collar and placket
 * - Ton-sur-ton flared pleated skirt
 * - Soft anime aesthetic without bulky autotrace code (<15KB clean SVG)
 */
export function SawakoBaseArtwork() {
  return (
    <g className="sawako-base-artwork">
      <defs>
        {/* Soft Face Skin Gradient */}
        <radialGradient id="sawakoSkinGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFBF7" />
          <stop offset="75%" stopColor="#FFF2E9" />
          <stop offset="100%" stopColor="#FEE4D6" />
        </radialGradient>

        {/* Hair Gloss Sheen Gradient */}
        <linearGradient id="sawakoHairGloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d4052" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#555a73" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e2029" stopOpacity="0.2" />
        </linearGradient>

        {/* Cream Cardigan Gradient */}
        <linearGradient id="sawakoCardigan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF5EE" />
          <stop offset="60%" stopColor="#F5ECE1" />
          <stop offset="100%" stopColor="#EADCCB" />
        </linearGradient>

        {/* Ton-Sur-Ton Skirt Gradient */}
        <linearGradient id="sawakoSkirt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F6EEE4" />
          <stop offset="50%" stopColor="#EFE3D5" />
          <stop offset="100%" stopColor="#DFCDBA" />
        </linearGradient>

        {/* Soft Cheeks Blush Glow */}
        <radialGradient id="sawakoBlushGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8B8B" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#FFA4A4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFA4A4" stopOpacity="0" />
        </radialGradient>

        {/* Drop shadow for clothes and hair */}
        <filter id="chibiSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1a121e" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* ===================== 1. BACK HAIR DOME ===================== */}
      {/* Massive silky long black hair flowing behind the body down past waist */}
      <path
        d="
          M 368 140
          C 250 140, 150 220, 130 360
          C 115 480, 110 650, 125 790
          C 135 880, 160 930, 210 945
          C 250 955, 290 920, 310 880
          C 335 830, 345 770, 368 770
          C 391 770, 401 830, 426 880
          C 446 920, 486 955, 526 945
          C 576 930, 601 880, 611 790
          C 626 650, 621 480, 606 360
          C 586 220, 486 140, 368 140
          Z
        "
        fill="#13141a"
      />

      {/* Hair Depth Shading & Inner Silhouette Strands */}
      <path
        d="
          M 160 380
          C 145 520, 145 720, 175 870
          C 185 915, 205 925, 220 900
          C 200 780, 185 580, 195 420
          Z
        "
        fill="#0c0d11"
        opacity="0.6"
      />
      <path
        d="
          M 576 380
          C 591 520, 591 720, 561 870
          C 551 915, 531 925, 516 900
          C 536 780, 551 580, 541 420
          Z
        "
        fill="#0c0d11"
        opacity="0.6"
      />

      {/* ===================== 2. TON-SUR-TON PLEATED SKIRT ===================== */}
      <g id="chibi-skirt" filter="url(#chibiSoftShadow)">
        {/* Flared skirt base */}
        <path
          d="
            M 292 705
            Q 368 720 444 705
            C 475 750, 495 805, 502 835
            Q 368 858 234 835
            C 241 805, 261 750, 292 705
            Z
          "
          fill="url(#sawakoSkirt)"
          stroke="#D5C5B2"
          strokeWidth={2.5}
        />

        {/* Pleat shadow folds for 3D depth */}
        <path d="M 270 715 C 275 755, 275 800, 270 838" stroke="#D1BEA8" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M 310 718 C 315 758, 318 805, 320 844" stroke="#D1BEA8" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M 368 720 C 368 760, 368 808, 368 847" stroke="#C9B49D" strokeWidth={2.8} strokeLinecap="round" fill="none" />
        <path d="M 426 718 C 421 758, 418 805, 416 844" stroke="#D1BEA8" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M 466 715 C 461 755, 461 800, 466 838" stroke="#D1BEA8" strokeWidth={2.5} strokeLinecap="round" fill="none" />

        {/* Subtle skirt hem scallop highlight */}
        <path
          d="M 235 835 Q 268 844 301 842 Q 335 847 368 847 Q 401 847 435 842 Q 468 844 501 835"
          stroke="#FAF5EE"
          strokeWidth={2}
          fill="none"
        />
      </g>

      {/* ===================== 3. CREAM BUTTON-UP CARDIGAN ===================== */}
      <g id="chibi-cardigan" filter="url(#chibiSoftShadow)">
        {/* Main Cardigan Body */}
        <path
          d="
            M 278 522
            Q 368 535 458 522
            C 475 580, 482 650, 452 710
            Q 368 724 284 710
            C 254 650, 261 580, 278 522
            Z
          "
          fill="url(#sawakoCardigan)"
          stroke="#D5C5B2"
          strokeWidth={2.5}
        />

        {/* Soft Inner Camisole visible at collar V-neck */}
        <path d="M 346 518 Q 368 544 390 518 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={2} />

        {/* Cardigan Collar Fold (Left & Right lapels) */}
        <path
          d="M 334 515 C 342 538, 356 550, 368 554 C 358 540, 350 522, 344 515 Z"
          fill="#FAF4EC"
          stroke="#CDBEA9"
          strokeWidth={2}
        />
        <path
          d="M 402 515 C 394 538, 380 550, 368 554 C 378 540, 386 522, 392 515 Z"
          fill="#FAF4EC"
          stroke="#CDBEA9"
          strokeWidth={2}
        />

        {/* Center Placket Line */}
        <path d="M 368 554 L 368 718" stroke="#D1BEA8" strokeWidth={3} strokeLinecap="round" />

        {/* Delicate Cardigan Buttons from Sawako better.jpg */}
        <g id="cardigan-buttons">
          {/* Button 1 */}
          <circle cx="368" cy="582" r="5" fill="#FFFFFF" stroke="#C4AF98" strokeWidth={1.8} />
          <line x1="366" y1="582" x2="370" y2="582" stroke="#B8A188" strokeWidth={1.2} />
          {/* Button 2 */}
          <circle cx="368" cy="624" r="5" fill="#FFFFFF" stroke="#C4AF98" strokeWidth={1.8} />
          <line x1="366" y1="624" x2="370" y2="624" stroke="#B8A188" strokeWidth={1.2} />
          {/* Button 3 */}
          <circle cx="368" cy="666" r="5" fill="#FFFFFF" stroke="#C4AF98" strokeWidth={1.8} />
          <line x1="366" y1="666" x2="370" y2="666" stroke="#B8A188" strokeWidth={1.2} />
        </g>

        {/* Cardigan Vertical Fit Dart Seams (from reference photo) */}
        <path d="M 322 560 C 326 610, 328 660, 324 695" stroke="#E0D2C1" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />
        <path d="M 414 560 C 410 610, 408 660, 412 695" stroke="#E0D2C1" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />
      </g>

      {/* ===================== 4. NECK & EARS ===================== */}
      <path d="M 350 485 L 350 530 Q 368 538 386 530 L 386 485 Z" fill="#FEE3D4" />
      {/* Neck Shadow under chin */}
      <path d="M 350 488 Q 368 504 386 488 L 386 500 Q 368 514 350 500 Z" fill="#F8CCA8" opacity="0.6" />

      {/* Petite Chibi Ears */}
      <ellipse cx="204" cy="360" rx="14" ry="22" fill="#FEE4D6" stroke="#1c1d24" strokeWidth={2} />
      <ellipse cx="532" cy="360" rx="14" ry="22" fill="#FEE4D6" stroke="#1c1d24" strokeWidth={2} />

      {/* ===================== 5. ROUND CHIBI FACE ===================== */}
      <path
        d="
          M 204 330
          C 190 410, 240 485, 368 495
          C 496 485, 546 410, 532 330
          C 532 230, 480 180, 368 180
          C 256 180, 204 230, 204 330
          Z
        "
        fill="url(#sawakoSkinGlow)"
        stroke="#1c1d24"
        strokeWidth={3}
      />

      {/* Soft Rosy Blushing Cheeks from Sawako better.jpg */}
      <g id="cheeks-blush">
        {/* Left Blush Radial Soft Glow */}
        <ellipse cx="270" cy="385" rx="38" ry="22" fill="url(#sawakoBlushGlow)" />
        {/* Left Anime Diagonal Blush Lines */}
        <line x1="254" y1="388" x2="260" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="264" y1="390" x2="270" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="274" y1="390" x2="280" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="284" y1="388" x2="290" y2="380" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />

        {/* Right Blush Radial Soft Glow */}
        <ellipse cx="466" cy="385" rx="38" ry="22" fill="url(#sawakoBlushGlow)" />
        {/* Right Anime Diagonal Blush Lines */}
        <line x1="450" y1="388" x2="456" y2="380" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="460" y1="390" x2="466" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="470" y1="390" x2="476" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
        <line x1="480" y1="388" x2="486" y2="378" stroke="#FF5C5C" strokeWidth={2.2} strokeLinecap="round" opacity="0.7" />
      </g>

      {/* Cute Chibi Nose Dot */}
      <circle cx="368" cy="392" r="2.5" fill="#E28678" />

      {/* ===================== 6. STRAIGHT BANGS & STAR HAIRPIN ===================== */}
      {/* Front Bangs (Sawako's classic blunt fringe with delicate scissor notch gaps) */}
      <path
        d="
          M 194 300
          C 190 230, 240 150, 368 150
          C 496 150, 546 230, 542 300
          C 530 295, 520 290, 510 305
          L 502 268
          C 490 295, 480 305, 465 305
          L 458 268
          C 445 295, 435 305, 420 305
          L 412 268
          C 398 295, 388 305, 368 305
          C 348 305, 338 295, 324 268
          L 316 305
          C 301 305, 291 295, 278 268
          L 270 305
          C 255 305, 245 295, 234 268
          L 226 305
          C 216 290, 206 295, 194 300
          Z
        "
        fill="#181920"
        stroke="#101115"
        strokeWidth={2}
      />

      {/* Angel Halo Hair Shine Band (Tenshi no Wa) */}
      <path
        d="M 230 225 Q 368 200 506 225 Q 368 215 230 225 Z"
        fill="url(#sawakoHairGloss)"
      />

      {/* Iconic 5-Pointed White Star Hairpin from Sawako better.jpg */}
      {/* Positioned on the character's right temple (viewer's upper left) */}
      <g id="star-hairpin" transform="translate(254, 218) rotate(-14) scale(1.35)">
        {/* Star shadow */}
        <polygon
          points="0,-16 4.7,-4.9 16.5,-4.9 7,2 10.6,13.7 0,6.7 -10.6,13.7 -7,2 -16.5,-4.9 -4.7,-4.9"
          fill="#000000"
          opacity="0.3"
          transform="translate(1, 2)"
        />
        {/* Crisp White Star */}
        <polygon
          points="0,-16 4.7,-4.9 16.5,-4.9 7,2 10.6,13.7 0,6.7 -10.6,13.7 -7,2 -16.5,-4.9 -4.7,-4.9"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Star Center Glimmer */}
        <circle cx="-1" cy="-2" r="3" fill="#FFFDE7" />
      </g>
    </g>
  );
}
