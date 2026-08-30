import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoBaseArtworkProps {
  expression?: SawakoExpression;
}

/**
 * SawakoBaseArtwork - Ethereal Muse Dress with Scooped Neckline
 * Features:
 * - Scooped-in romantic muse neckline (khoét cổ sâu thanh thoát) showcasing graceful neck & clavicle
 * - Ruffled lace trim along the scooped neckline and delicate satin rosette bow
 * - Romantic ruched gathered bust and tiered cascading billowing ruffled skirt
 * - Pure pristine white silk with pearlescent and silver-silk gradient shading
 * - Slender anime oval face with soft cute chin and bashful blushing cheeks
 * - Sleek, fluttering silky hair with angel ring gloss sheen
 * - 3D white star hairpin on temple
 */
export function SawakoBaseArtwork({ expression }: SawakoBaseArtworkProps) {
  const isShy = expression === "shy";

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

        {/* Neck & Clavicle Shadow Gradient */}
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
          <stop offset="0%" stopColor="#FF6B6B" stopOpacity={isShy ? 0.75 : 0.6} />
          <stop offset="45%" stopColor="#FF8F8F" stopOpacity={isShy ? 0.45 : 0.35} />
          <stop offset="75%" stopColor="#FFB8B8" stopOpacity={isShy ? 0.2 : 0.12} />
          <stop offset="100%" stopColor="#FFB8B8" stopOpacity="0" />
        </radialGradient>

        {/* Pristine White Muse Silk Dress Gradient */}
        <linearGradient id="museDressSilk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FEFEFF" />
          <stop offset="60%" stopColor="#F4F7FB" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Dress Layer Tier Shadow */}
        <linearGradient id="museTierShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
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

        <path d="M 186 440 C 172 580, 178 720, 202 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
        <path d="M 550 440 C 564 580, 558 720, 534 840" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />
      </g>

      {/* ===================== 2. ETHEREAL MUSE DRESS (ĐẦM NÀNG THƠ KHOÉT CỔ SÂU) ===================== */}
      <g id="pure-white-muse-dress">
        {/* Under-layer Main Silhouette */}
        <path
          d="
            M 276 522
            Q 368 534 460 522
            C 472 570, 466 618, 444 656
            C 482 710, 514 772, 526 846
            Q 368 876 210 846
            C 222 772, 254 710, 292 656
            C 270 618, 264 570, 276 522
            Z
          "
          fill="url(#museDressSilk)"
          stroke="#CBD5E1"
          strokeWidth={2.2}
        />

        {/* --- Bodice with Scooped Neckline --- */}
        {/* Soft gathered ruched fabric under scooped bust */}
        <path
          d="
            M 306 526
            C 324 554, 346 558, 368 556
            C 390 558, 412 554, 430 526
            C 434 560, 426 592, 404 602
            C 386 592, 370 592, 352 602
            C 328 592, 318 560, 306 526
            Z
          "
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={1.6}
        />

        {/* Scooped Neckline Scalloped Lace Frill Trim (Khoét cổ sâu quyến rũ) */}
        <path
          d="
            M 304 526
            Q 316 540 326 534
            Q 336 548 348 544
            Q 358 556 368 554
            Q 378 556 388 544
            Q 400 548 410 534
            Q 420 540 432 526
          "
          stroke="#CBD5E1"
          strokeWidth={2.2}
          fill="none"
        />
        <path
          d="
            M 306 528
            C 326 554, 346 558, 368 556
            C 390 558, 410 554, 430 528
          "
          stroke="#FFFFFF"
          strokeWidth={2.6}
          fill="none"
        />

        {/* Muse Bodice Ribbons / Corsetry Ruching */}
        <g stroke="#E2E8F0" strokeWidth={1.4} strokeLinecap="round" fill="none">
          <path d="M 338 548 C 340 566, 344 584, 348 600" />
          <path d="M 358 556 C 360 572, 362 588, 364 601" />
          <path d="M 378 556 C 376 572, 374 588, 372 601" />
          <path d="M 398 548 C 396 566, 392 584, 388 600" />
        </g>

        {/* Petite Center Silk Bow at Scooped Neckline Apex */}
        <g id="muse-bodice-bow" transform="translate(368, 558)">
          <circle cx="0" cy="0" r="3.5" fill="#FDE2E4" stroke="#F472B6" strokeWidth={1.2} />
          <path d="M 0 0 C -7 -7, -15 -5, -13 2 C -11 6, -4 2, 0 0 Z" fill="#FFF1F2" stroke="#F472B6" strokeWidth={1} />
          <path d="M 0 0 C 7 -7, 15 -5, 13 2 C 11 6, 4 2, 0 0 Z" fill="#FFF1F2" stroke="#F472B6" strokeWidth={1} />
          <path d="M -2 2 Q -5 14 -8 24" stroke="#F472B6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 2 2 Q 5 14 8 24" stroke="#F472B6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>

        {/* Fitted High-Empire Waist Sash */}
        <path
          d="M 292 656 Q 368 668 444 656"
          stroke="#CBD5E1"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 296 660 Q 368 672 440 660"
          stroke="#FFFFFF"
          strokeWidth={2}
          fill="none"
        />

        {/* --- Skirt Tier 1: Flowing Upper Flounce --- */}
        <path
          d="
            M 288 660
            C 264 705, 252 748, 250 762
            Q 368 784 486 762
            C 484 748, 472 705, 448 660
            Q 368 672 288 660
            Z
          "
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.8}
        />
        <path
          d="
            M 250 762
            Q 276 774 302 768
            Q 328 776 354 770
            Q 380 776 406 770
            Q 432 776 458 768
            Q 476 774 486 762
          "
          stroke="#CBD5E1"
          strokeWidth={2}
          fill="none"
        />
        <path
          d="M 252 764 Q 368 786 484 764 Q 368 778 252 764 Z"
          fill="url(#museTierShadow)"
        />

        {/* --- Skirt Tier 2: Billowing Lower Flounce with Cascading Folds --- */}
        <g stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M 248 768 C 242 805, 230 836, 218 852" />
          <path d="M 290 772 C 288 808, 280 844, 274 860" />
          <path d="M 334 772 C 334 812, 332 850, 328 864" />
          <path d="M 368 774 C 368 815, 368 854, 368 866" strokeWidth={2.4} stroke="#94A3B8" />
          <path d="M 402 772 C 402 812, 404 850, 408 864" />
          <path d="M 446 772 C 448 808, 456 844, 462 860" />
          <path d="M 488 768 C 494 805, 506 836, 518 852" />
        </g>

        {/* Luminous Pure White Silk Highlights on Flounce */}
        <g stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity="0.95">
          <path d="M 270 774 C 268 810, 260 844, 252 858" />
          <path d="M 312 772 C 314 814, 312 852, 308 864" />
          <path d="M 424 772 C 422 814, 424 852, 428 864" />
          <path d="M 466 774 C 468 810, 476 844, 484 858" />
        </g>

        {/* Dreamy Ruffled Scalloped Bottom Hem */}
        <path
          d="
            M 210 846
            Q 240 860 270 854
            Q 302 864 336 858
            Q 368 866 400 858
            Q 434 864 466 854
            Q 496 860 526 846
          "
          stroke="#FFFFFF"
          strokeWidth={3.6}
          fill="none"
        />
        <path
          d="M 212 848 Q 368 878 524 848 Q 368 868 212 848 Z"
          fill="#CBD5E1"
          opacity="0.5"
        />
      </g>

      {/* ===================== 3. DELICATE NECK & EXTENDED CLAVICLE ===================== */}
      <g id="neck-layer">
        {/* Slender neck extending down to scooped neckline */}
        <path d="M 346 480 L 346 548 Q 368 556 390 548 L 390 480 Z" fill="#FEE5D8" />
        <path d="M 346 482 Q 368 506 390 482 L 390 502 Q 368 522 346 502 Z" fill="url(#sawakoNeckShadow)" />

        {/* Delicate Clavicle Definition Lines (Xương quai xanh duyên dáng) */}
        <path d="M 342 534 Q 354 538 364 535" stroke="#DFB49C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <path d="M 394 534 Q 382 538 372 535" stroke="#DFB49C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <circle cx="368" cy="535" r="1.4" fill="#DFB49C" />

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

      <path
        d="M 220 270 Q 368 285 516 270 L 516 312 Q 368 322 220 312 Z"
        fill="url(#sawakoBangsShadow)"
      />

      {/* ===================== 5. AIRBRUSH CHEEKS BLUSH & HATCHINGS ===================== */}
      <g id="cheeks-blush-layer">
        <ellipse cx="272" cy="382" rx={isShy ? 44 : 40} ry={isShy ? 26 : 24} fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={isShy ? 2.1 : 1.8} strokeLinecap="round" opacity={isShy ? 0.92 : 0.82}>
          <line x1="254" y1="384" x2="262" y2="372" />
          <line x1="262" y1="387" x2="270" y2="372" />
          <line x1="270" y1="388" x2="278" y2="372" />
          <line x1="278" y1="388" x2="286" y2="372" />
          <line x1="286" y1="386" x2="294" y2="374" />
        </g>

        <ellipse cx="464" cy="382" rx={isShy ? 44 : 40} ry={isShy ? 26 : 24} fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={isShy ? 2.1 : 1.8} strokeLinecap="round" opacity={isShy ? 0.92 : 0.82}>
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
