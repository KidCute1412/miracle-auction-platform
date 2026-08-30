import React from "react";

/**
 * SawakoBaseArtwork - Pure White Dress (Đầm trắng liền thân) Anime Chibi Puppet
 * Features:
 * - Unified one-piece white dress: delicate collar, ribbon bow, fitted bodice, and flowing A-line skirt
 * - Solves disjointed clothing look with seamless fabric transitions and pearlescent silk gradients
 * - Slender anime oval face with cute rounded chin
 * - Sleek, fluttering silky hair with angel ring gloss sheen
 * - 3D white star hairpin on temple
 */
export function SawakoBaseArtwork() {
  return (
    <g className="sawako-base-artwork">
      <defs>
        {/* Soft Face Skin Gradient */}
        <radialGradient id="sawakoFaceSkin" cx="50%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#FFFDFC" />
          <stop offset="65%" stopColor="#FFF4ED" />
          <stop offset="90%" stopColor="#FEE9DC" />
          <stop offset="100%" stopColor="#F8DDCB" />
        </radialGradient>

        {/* Neck Shadow under Chin */}
        <linearGradient id="sawakoNeckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6BCA4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FEE9DC" stopOpacity="0" />
        </linearGradient>

        {/* Deep Silky Hair Gradient */}
        <linearGradient id="sawakoHairBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#181922" />
          <stop offset="35%" stopColor="#111218" />
          <stop offset="80%" stopColor="#0B0C10" />
          <stop offset="100%" stopColor="#07080B" />
        </linearGradient>

        {/* Hair Gloss Angel Ring */}
        <linearGradient id="sawakoHairSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6C728F" stopOpacity="0" />
          <stop offset="45%" stopColor="#A4ABC9" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#DDE3FB" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#A4ABC9" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#6C728F" stopOpacity="0" />
        </linearGradient>

        {/* Soft Airbrush Cheeks Blush */}
        <radialGradient id="sawakoCheekAirbrush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A7A" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#FF9999" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#FFB8B8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFB8B8" stopOpacity="0" />
        </radialGradient>

        {/* Pure White Silk Dress Gradient */}
        <linearGradient id="whiteDressSilk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FCFDFE" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Dress Bodice Shading */}
        <linearGradient id="whiteDressBodice" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EDF2F7" />
        </linearGradient>

        {/* Bangs Forehead Drop Shadow */}
        <linearGradient id="sawakoBangsShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3B42" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4A3B42" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===================== 1. SLEEK, FLUTTERING BACK HAIR ===================== */}
      <g id="back-hair-layer">
        <path
          d="
            M 368 135
            C 255 135, 165 210, 146 335
            C 132 450, 134 600, 146 750
            C 154 845, 180 910, 225 930
            C 256 942, 286 910, 304 875
            C 328 825, 342 775, 368 775
            C 394 775, 408 825, 432 875
            C 450 910, 480 942, 511 930
            C 556 910, 582 845, 590 750
            C 602 600, 604 450, 590 335
            C 571 210, 481 135, 368 135
            Z
          "
          fill="url(#sawakoHairBase)"
          stroke="#07080B"
          strokeWidth={2.4}
        />

        {/* Side Hair Breeze Strands */}
        <path
          d="
            M 166 360
            C 152 480, 150 670, 178 820
            C 186 865, 204 880, 218 860
            C 200 750, 186 560, 194 400
            Z
          "
          fill="#08090C"
          opacity="0.75"
        />
        <path
          d="
            M 570 360
            C 584 480, 586 670, 558 820
            C 550 865, 532 880, 518 860
            C 536 750, 550 560, 542 400
            Z
          "
          fill="#08090C"
          opacity="0.75"
        />

        {/* Silky Hair Flow Lines */}
        <path d="M 186 440 C 172 580, 178 720, 202 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
        <path d="M 550 440 C 564 580, 558 720, 534 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
      </g>

      {/* ===================== 2. UNIFIED PURE WHITE DRESS (ĐẦM TRẮNG LIỀN THÂN) ===================== */}
      {/* Seamless one-piece dress flowing from shoulders to hemline, overlapping legs */}
      <g id="pure-white-dress">
        {/* Continuous Full Dress Silhouette (Bodice + Waist + Flowing Skirt) */}
        <path
          d="
            M 276 522
            Q 368 534 460 522
            C 472 570, 468 620, 448 664
            C 478 715, 502 775, 510 838
            Q 368 864 226 838
            C 234 775, 258 715, 288 664
            C 268 620, 264 570, 276 522
            Z
          "
          fill="url(#whiteDressSilk)"
          stroke="#CBD5E1"
          strokeWidth={2.2}
        />

        {/* Upper Bodice Soft Princess Seams */}
        <path d="M 324 532 C 330 575, 334 620, 332 664" stroke="#E2E8F0" strokeWidth={1.6} strokeLinecap="round" fill="none" />
        <path d="M 412 532 C 406 575, 402 620, 404 664" stroke="#E2E8F0" strokeWidth={1.6} strokeLinecap="round" fill="none" />

        {/* Delicate Scallop Neckline with Petal Collar */}
        <path
          d="
            M 326 514
            C 342 536, 356 544, 368 546
            C 356 534, 344 522, 336 514
            Z
          "
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.6}
        />
        <path
          d="
            M 410 514
            C 394 536, 380 544, 368 546
            C 380 534, 392 522, 400 514
            Z
          "
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.6}
        />

        {/* Petite Pastel Pink Ribbon Bow at Neckline */}
        <g id="dress-neck-bow" transform="translate(368, 544)">
          {/* Bow Knot */}
          <circle cx="0" cy="0" r="3.5" fill="#F472B6" stroke="#DB2777" strokeWidth={1} />
          {/* Left Loop */}
          <path d="M 0 0 C -6 -6, -14 -4, -12 2 C -10 6, -4 2, 0 0 Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth={1} />
          {/* Right Loop */}
          <path d="M 0 0 C 6 -6, 14 -4, 12 2 C 10 6, 4 2, 0 0 Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth={1} />
          {/* Ribbon Tails */}
          <path d="M -1 2 Q -4 10 -6 16" stroke="#F472B6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 1 2 Q 4 10 6 16" stroke="#F472B6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>

        {/* Gentle Empire Waistline Sash Curve */}
        <path
          d="M 288 664 Q 368 678 448 664"
          stroke="#CBD5E1"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 292 668 Q 368 682 444 668"
          stroke="#FFFFFF"
          strokeWidth={2}
          fill="none"
          opacity="0.9"
        />

        {/* Elegant Flowing Skirt Folds cascading from waist to hem */}
        <g stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M 260 720 C 265 760, 260 804, 252 840" />
          <path d="M 300 690 C 304 740, 304 795, 302 847" />
          <path d="M 338 678 C 342 730, 344 790, 340 852" />
          <path d="M 368 678 C 368 732, 368 795, 368 854" strokeWidth={2.5} stroke="#94A3B8" />
          <path d="M 398 678 C 394 730, 392 790, 396 852" />
          <path d="M 436 690 C 432 740, 432 795, 434 847" />
          <path d="M 476 720 C 471 760, 476 804, 484 840" />
        </g>

        {/* Pearlescent Silk Highlights on Dress Skirt */}
        <g stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity="0.95">
          <path d="M 280 700 C 284 750, 284 800, 280 844" />
          <path d="M 320 682 C 324 735, 324 795, 320 850" />
          <path d="M 416 682 C 412 735, 412 795, 416 850" />
          <path d="M 456 700 C 452 750, 452 800, 456 844" />
        </g>

        {/* Translucent Ruffled Scallop Hemline */}
        <path
          d="M 226 838 Q 262 848 298 846 Q 334 853 368 854 Q 402 853 438 846 Q 474 848 510 838"
          stroke="#FFFFFF"
          strokeWidth={3}
          fill="none"
        />
        {/* Soft Dress Bottom Hem Shadow */}
        <path
          d="M 228 840 Q 368 866 508 840 Q 368 858 228 840 Z"
          fill="#E2E8F0"
          opacity="0.45"
        />
      </g>

      {/* ===================== 3. DELICATE NECK & CLAVICLE ===================== */}
      <g id="neck-layer">
        <path d="M 348 480 L 348 528 Q 368 536 388 528 L 388 480 Z" fill="#FEE5D8" />
        <path d="M 348 482 Q 368 506 388 482 L 388 498 Q 368 518 348 498 Z" fill="url(#sawakoNeckShadow)" />
        <path d="M 358 520 Q 368 524 378 520" stroke="#E0B69E" strokeWidth={1.5} strokeLinecap="round" fill="none" />

        {/* Petite Chibi Ears */}
        <g id="left-ear">
          <ellipse cx="214" cy="358" rx="13" ry="20" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 216 350 Q 210 358 216 366" stroke="#E6B4A0" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </g>
        <g id="right-ear">
          <ellipse cx="522" cy="358" rx="13" ry="20" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 520 350 Q 526 358 520 366" stroke="#E6B4A0" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* ===================== 4. SLENDER ANIME OVAL FACE ===================== */}
      <path
        d="
          M 216 324
          C 206 396, 252 474, 368 486
          C 484 474, 530 396, 520 324
          C 520 224, 476 174, 368 174
          C 260 174, 216 224, 216 324
          Z
        "
        fill="url(#sawakoFaceSkin)"
        stroke="#1c1d24"
        strokeWidth={2.6}
      />

      {/* Forehead Shadow under bangs */}
      <path
        d="M 220 270 Q 368 285 516 270 L 516 312 Q 368 322 220 312 Z"
        fill="url(#sawakoBangsShadow)"
      />

      {/* ===================== 5. AIRBRUSH CHEEKS BLUSH & HATCHINGS ===================== */}
      <g id="cheeks-blush-layer">
        <ellipse cx="272" cy="382" rx="40" ry="24" fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={1.8} strokeLinecap="round" opacity="0.82">
          <line x1="254" y1="384" x2="262" y2="372" />
          <line x1="262" y1="387" x2="270" y2="372" />
          <line x1="270" y1="388" x2="278" y2="372" />
          <line x1="278" y1="388" x2="286" y2="372" />
          <line x1="286" y1="386" x2="294" y2="374" />
        </g>

        <ellipse cx="464" cy="382" rx="40" ry="24" fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={1.8} strokeLinecap="round" opacity="0.82">
          <line x1="442" y1="384" x2="450" y2="374" />
          <line x1="450" y1="386" x2="458" y2="372" />
          <line x1="458" y1="388" x2="466" y2="372" />
          <line x1="466" y1="388" x2="474" y2="372" />
          <line x1="474" y1="387" x2="482" y2="372" />
        </g>
      </g>

      {/* Tiny Delicate Anime Nose */}
      <g id="anime-nose">
        <line x1="368" y1="385" x2="368" y2="392" stroke="#D18374" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx="368" cy="392" r="1.5" fill="#B9695C" />
      </g>

      {/* ===================== 6. STRAIGHT BANGS & STAR HAIRPIN ===================== */}
      <g id="front-bangs-layer">
        <path
          d="
            M 204 304
            C 198 230, 244 146, 368 146
            C 492 146, 538 230, 532 304
            C 520 298, 514 292, 504 308
            L 496 270
            C 484 298, 474 308, 460 308
            L 452 270
            C 438 298, 428 308, 414 308
            L 406 270
            C 392 298, 384 308, 368 308
            C 352 308, 344 298, 330 270
            L 322 308
            C 308 308, 298 298, 284 270
            L 276 308
            C 262 308, 252 298, 240 270
            L 232 308
            C 222 292, 214 298, 204 304
            Z
          "
          fill="#14151D"
          stroke="#0A0B0E"
          strokeWidth={2.2}
        />

        <g stroke="#2C2E3C" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.8">
          <line x1="250" y1="200" x2="256" y2="280" />
          <line x1="298" y1="185" x2="302" y2="285" />
          <line x1="346" y1="180" x2="348" y2="288" />
          <line x1="390" y1="180" x2="388" y2="288" />
          <line x1="438" y1="185" x2="434" y2="285" />
          <line x1="486" y1="200" x2="480" y2="280" />
        </g>

        <path
          d="M 236 228 Q 368 200 500 228 Q 368 214 236 228 Z"
          fill="url(#sawakoHairSheen)"
        />

        {/* 3D White Star Clip on Temple */}
        <g id="star-hairclip" transform="translate(260, 218) rotate(-14) scale(1.35)">
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#6B7280" strokeWidth={3} strokeLinecap="round" />
          <polygon
            points="0,-17 4.9,-5.2 17.5,-5.2 7.4,2.2 11.2,14.5 0,7 -11.2,14.5 -7.4,2.2 -17.5,-5.2 -4.9,-5.2"
            fill="#000000"
            opacity="0.35"
            transform="translate(1.5, 2)"
          />
          <polygon
            points="0,-17 4.9,-5.2 17.5,-5.2 7.4,2.2 11.2,14.5 0,7 -11.2,14.5 -7.4,2.2 -17.5,-5.2 -4.9,-5.2"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <polygon points="0,-17 0,0 4.9,-5.2" fill="#F8FAFC" opacity="0.9" />
          <polygon points="17.5,-5.2 0,0 7.4,2.2" fill="#E2E8F0" opacity="0.7" />
          <polygon points="11.2,14.5 0,0 0,7" fill="#CBD5E1" opacity="0.6" />
          <polygon points="-11.2,14.5 0,0 -7.4,2.2" fill="#F1F5F9" opacity="0.9" />
          <polygon points="-17.5,-5.2 0,0 -4.9,-5.2" fill="#FFFFFF" />
          <circle cx="-1" cy="-2" r="3.2" fill="#FFFDE7" />
        </g>
      </g>
    </g>
  );
}
