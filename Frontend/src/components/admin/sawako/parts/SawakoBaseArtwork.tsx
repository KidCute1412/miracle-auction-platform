import React from "react";

/**
 * SawakoBaseArtwork - Slim, Silky, Authentic Full-Body Chibi Vector Puppet
 * Features:
 * - Slender, delicate anime oval face with cute rounded chin (not round/ball-shaped)
 * - Sleek, fluttering silky hair with breeze sway lines and angel ring gloss
 * - Pure crisp white silky flared skirt (#FFFFFF with pearlescent silk folds) overlapping legs
 * - Detailed button-up cream cardigan with collar, placket, and tailored dart seams
 * - 3D white star hairpin on temple
 */
export function SawakoBaseArtwork() {
  return (
    <g className="sawako-base-artwork">
      <defs>
        {/* Soft Face Skin Gradient with Fair Anime Tone */}
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

        {/* Hair Gloss Angel Ring (Tenshi no Wa) */}
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

        {/* Pure White Silky Skirt Gradient (Crisp, Pearlescent & Lustrous) */}
        <linearGradient id="sawakoPureWhiteSilk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FCFDFE" />
          <stop offset="75%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Cream Cardigan Shading */}
        <linearGradient id="sawakoCardiganFabric" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDF9F3" />
          <stop offset="40%" stopColor="#F7EFE4" />
          <stop offset="85%" stopColor="#EFE3D4" />
          <stop offset="100%" stopColor="#E2D2C0" />
        </linearGradient>

        {/* Collar Drop Shadow onto Chest */}
        <linearGradient id="sawakoCollarShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D5C2AD" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F7EFE4" stopOpacity="0" />
        </linearGradient>

        {/* Bangs Forehead Drop Shadow */}
        <linearGradient id="sawakoBangsShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3B42" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4A3B42" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===================== 1. SLEEK, FLUTTERING BACK HAIR ===================== */}
      {/* Sleeker silhouette, tapered naturally with breeze curves instead of a heavy bulky dome */}
      <g id="back-hair-layer">
        {/* Main Hair Silhouette with gentle wind flutter */}
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

        {/* Left Side Hair Breeze Flutter Strands */}
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
        {/* Right Side Hair Breeze Flutter Strands */}
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

        {/* Silky Hair Flow Wave Lines */}
        <path d="M 186 440 C 172 580, 178 720, 202 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
        <path d="M 550 440 C 564 580, 558 720, 534 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
      </g>

      {/* ===================== 2. PURE WHITE SILKY SKIRT (OVERLAPS LEGS) ===================== */}
      {/* Rendered directly over the legs to provide authentic physical overlap */}
      <g id="pure-white-skirt-layer">
        {/* Flared Skirt Base with crisp pure white silk gradient */}
        <path
          d="
            M 292 706
            Q 368 720 444 706
            C 476 748, 496 804, 504 836
            Q 368 858 232 836
            C 240 804, 260 748, 292 706
            Z
          "
          fill="url(#sawakoPureWhiteSilk)"
          stroke="#CBD5E1"
          strokeWidth={2}
        />

        {/* Delicate Silk Pleat Shadow Folds */}
        <g stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M 264 718 C 268 758, 265 802, 258 838" />
          <path d="M 302 721 C 306 760, 308 806, 308 845" />
          <path d="M 342 723 C 344 762, 346 808, 344 848" />
          <path d="M 368 724 C 368 764, 368 810, 368 850" strokeWidth={2.4} stroke="#94A3B8" />
          <path d="M 394 723 C 392 762, 390 808, 392 848" />
          <path d="M 434 721 C 430 760, 428 806, 428 845" />
          <path d="M 472 718 C 468 758, 471 802, 478 838" />
        </g>

        {/* Pearlescent Silk Gloss Sheen on Pleats */}
        <g stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity="0.95">
          <path d="M 284 718 C 288 758, 290 802, 290 842" />
          <path d="M 324 720 C 326 760, 328 805, 326 846" />
          <path d="M 412 720 C 410 760, 408 805, 410 846" />
          <path d="M 452 718 C 448 758, 446 802, 446 842" />
        </g>

        {/* Delicate Scallop Hem Highlight */}
        <path
          d="M 232 836 Q 268 846 304 844 Q 336 849 368 850 Q 400 849 432 844 Q 468 846 504 836"
          stroke="#FFFFFF"
          strokeWidth={2.8}
          fill="none"
        />
      </g>

      {/* ===================== 3. CREAM BUTTON-UP CARDIGAN ===================== */}
      <g id="cardigan-layer">
        {/* Main Cardigan Torso */}
        <path
          d="
            M 276 522
            Q 368 536 460 522
            C 478 580, 484 650, 454 712
            Q 368 726 282 712
            C 252 650, 258 580, 276 522
            Z
          "
          fill="url(#sawakoCardiganFabric)"
          stroke="#C8B6A2"
          strokeWidth={2.4}
        />

        {/* Inner Camisole at throat */}
        <path d="M 344 516 Q 368 544 392 516 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.8} />

        {/* Tailored Lapel Collar Fold */}
        <path
          d="M 330 514 C 340 538, 356 552, 368 556 C 356 540, 348 522, 342 514 Z"
          fill="#FAF4EC"
          stroke="#C2B09C"
          strokeWidth={2}
        />
        <path
          d="M 406 514 C 396 538, 380 552, 368 556 C 378 540, 386 522, 392 514 Z"
          fill="#FAF4EC"
          stroke="#C2B09C"
          strokeWidth={2}
        />

        {/* Collar Shadow */}
        <path d="M 342 546 Q 368 564 394 546 Q 368 556 342 546 Z" fill="url(#sawakoCollarShadow)" />

        {/* Center Placket Column */}
        <path d="M 364 556 L 364 720 L 372 720 L 372 556 Z" fill="#F4ECE0" stroke="#C8B6A2" strokeWidth={1.2} />
        <line x1="368" y1="556" x2="368" y2="720" stroke="#BAA692" strokeWidth={1.8} />

        {/* Fit Dart Tailored Seams */}
        <path d="M 318 560 C 322 610, 324 660, 320 696" stroke="#D1C0AF" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />
        <path d="M 418 560 C 414 610, 412 660, 416 696" stroke="#D1C0AF" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />

        {/* 3D Realistic Circular Buttons */}
        <g id="cardigan-buttons">
          {/* Button 1 */}
          <g transform="translate(368, 584)">
            <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" stroke="#B8A48F" strokeWidth={1.8} />
            <circle cx="0" cy="0" r="3.8" fill="#FBF7F1" />
            <line x1="-2" y1="-2" x2="2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
            <line x1="2" y1="-2" x2="-2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
          </g>
          {/* Button 2 */}
          <g transform="translate(368, 626)">
            <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" stroke="#B8A48F" strokeWidth={1.8} />
            <circle cx="0" cy="0" r="3.8" fill="#FBF7F1" />
            <line x1="-2" y1="-2" x2="2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
            <line x1="2" y1="-2" x2="-2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
          </g>
          {/* Button 3 */}
          <g transform="translate(368, 668)">
            <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" stroke="#B8A48F" strokeWidth={1.8} />
            <circle cx="0" cy="0" r="3.8" fill="#FBF7F1" />
            <line x1="-2" y1="-2" x2="2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
            <line x1="2" y1="-2" x2="-2" y2="2" stroke="#9C8773" strokeWidth={1.2} strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* ===================== 4. DELICATE NECK & CLAVICLE ===================== */}
      <g id="neck-layer">
        <path d="M 348 480 L 348 532 Q 368 540 388 532 L 388 480 Z" fill="#FEE5D8" />
        <path d="M 348 482 Q 368 506 388 482 L 388 498 Q 368 518 348 498 Z" fill="url(#sawakoNeckShadow)" />
        <path d="M 358 522 Q 368 526 378 522" stroke="#E0B69E" strokeWidth={1.5} strokeLinecap="round" fill="none" />

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

      {/* ===================== 5. SLENDER ANIME OVAL FACE ===================== */}
      {/* Tapered jawline with soft cheeks and cute rounded chin, avoiding wide round ball shape */}
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

      {/* ===================== 6. AIRBRUSH CHEEKS BLUSH & HATCHINGS ===================== */}
      <g id="cheeks-blush-layer">
        {/* Left Blush Airbrush Cloud */}
        <ellipse cx="272" cy="382" rx="40" ry="24" fill="url(#sawakoCheekAirbrush)" />
        {/* Left Anime Diagonal Blush Lines */}
        <g stroke="#FF4D4D" strokeWidth={1.8} strokeLinecap="round" opacity="0.82">
          <line x1="254" y1="384" x2="262" y2="372" />
          <line x1="262" y1="387" x2="270" y2="372" />
          <line x1="270" y1="388" x2="278" y2="372" />
          <line x1="278" y1="388" x2="286" y2="372" />
          <line x1="286" y1="386" x2="294" y2="374" />
        </g>

        {/* Right Blush Airbrush Cloud */}
        <ellipse cx="464" cy="382" rx="40" ry="24" fill="url(#sawakoCheekAirbrush)" />
        {/* Right Anime Diagonal Blush Lines */}
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

      {/* ===================== 7. STRAIGHT BANGS & STAR HAIRPIN ===================== */}
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

        {/* Bang Strand Separation Lines */}
        <g stroke="#2C2E3C" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.8">
          <line x1="250" y1="200" x2="256" y2="280" />
          <line x1="298" y1="185" x2="302" y2="285" />
          <line x1="346" y1="180" x2="348" y2="288" />
          <line x1="390" y1="180" x2="388" y2="288" />
          <line x1="438" y1="185" x2="434" y2="285" />
          <line x1="486" y1="200" x2="480" y2="280" />
        </g>

        {/* Tenshi no Wa Hair Gloss Arch */}
        <path
          d="M 236 228 Q 368 200 500 228 Q 368 214 236 228 Z"
          fill="url(#sawakoHairSheen)"
        />

        {/* Iconic White 5-Pointed Star Clip with Clip Bar & Bevel Gleam */}
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
