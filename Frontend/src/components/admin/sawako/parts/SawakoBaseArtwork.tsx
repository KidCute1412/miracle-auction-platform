import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoBaseArtworkProps {
  expression?: SawakoExpression;
  isHovered?: boolean;
  onPokeStarClip?: (e: React.MouseEvent) => void;
  onHeadpatStroke?: (e: React.MouseEvent) => void;
}

/**
 * SawakoBaseArtwork - Ethereal Muse Chibi with Authentic Shoujo Anime Hair
 * Faithfully redesigned to eliminate the "ngố" (dorky high bangs) look:
 * - Bangs lengthened down to eye level (Y=312-316), gracefully skimming above upper lashes
 * - Sleek side hime locks (tóc mai ôm má) framing the cheeks down to Y=370
 * - Soft feathery airy fringe tips with delicate forehead glimpses
 * - Clean white star clip with dual dark bobby pins
 * - Pure white scooped-neckline muse dress with cascading ruffled flounces
 * - Slender anime oval face with delicate blushing cheeks
 */
export function SawakoBaseArtwork({
  expression,
  isHovered,
  onPokeStarClip,
  onHeadpatStroke,
}: SawakoBaseArtworkProps) {
  const isShy = expression === "shy" || Boolean(isHovered);

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

        {/* Deep Silky Hair Gradient - Obsidian with subtle violet-indigo undertone */}
        <linearGradient id="sawakoHairBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C1D26" />
          <stop offset="25%" stopColor="#14151E" />
          <stop offset="65%" stopColor="#0E0F15" />
          <stop offset="100%" stopColor="#07080B" />
        </linearGradient>

        {/* Hair Gloss Angel Ring - High-end Shoujo Anime Luster */}
        <linearGradient id="sawakoHairSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5E6584" stopOpacity="0" />
          <stop offset="35%" stopColor="#8F96B8" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#E4E9FC" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#8F96B8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#5E6584" stopOpacity="0" />
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

        {/* Soft Natural Forehead Shadow directly under lengthened bangs */}
        <linearGradient id="sawakoForeheadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2E2026" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#2E2026" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#2E2026" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===================== 1. ETHEREAL MUSE DRESS ===================== */}
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

        {/* Bodice with Scooped Neckline */}
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

        {/* Scooped Neckline Scalloped Lace Frill Trim */}
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

        {/* Muse Bodice Ribbons */}
        <g stroke="#E2E8F0" strokeWidth={1.4} strokeLinecap="round" fill="none">
          <path d="M 338 548 C 340 566, 344 584, 348 600" />
          <path d="M 358 556 C 360 572, 362 588, 364 601" />
          <path d="M 378 556 C 376 572, 374 588, 372 601" />
          <path d="M 398 548 C 396 566, 392 584, 388 600" />
        </g>

        {/* Petite Center Silk Bow at Scooped Neckline */}
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

        {/* Skirt Tier 1: Flowing Upper Flounce */}
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

        {/* Skirt Tier 2: Billowing Lower Flounce with Cascading Folds */}
        <g stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M 248 768 C 242 805, 230 836, 218 852" />
          <path d="M 290 772 C 288 808, 280 844, 274 860" />
          <path d="M 334 772 C 334 812, 332 850, 328 864" />
          <path d="M 368 774 C 368 815, 368 854, 368 866" strokeWidth={2.4} stroke="#94A3B8" />
          <path d="M 402 772 C 402 812, 404 850, 408 864" />
          <path d="M 446 772 C 448 808, 456 844, 462 860" />
          <path d="M 488 768 C 494 805, 506 836, 518 852" />
        </g>

        {/* Luminous Silk Highlights on Flounce */}
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

      {/* ===================== 3. DELICATE NECK & CLAVICLE ===================== */}
      <g id="neck-layer">
        <path d="M 346 480 L 346 548 Q 368 556 390 548 L 390 480 Z" fill="#FEE5D8" />
        <path d="M 346 482 Q 368 506 390 482 L 390 502 Q 368 522 346 502 Z" fill="url(#sawakoNeckShadow)" />

        {/* Clavicle Lines */}
        <path d="M 342 534 Q 354 538 364 535" stroke="#DFB49C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <path d="M 394 534 Q 382 538 372 535" stroke="#DFB49C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <circle cx="368" cy="535" r="1.4" fill="#DFB49C" />

        <g id="left-ear">
          <ellipse cx="218" cy="356" rx="12.5" ry="19" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 220 348 Q 214 356 220 364" stroke="#E6B4A0" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </g>
        <g id="right-ear">
          <ellipse cx="518" cy="356" rx="12.5" ry="19" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 516 348 Q 522 356 516 364" stroke="#E6B4A0" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* ===================== 4. BALANCED SWEET SHOUJO OVAL FACE ===================== */}
      <path
        d="
          M 218 318
          C 214 382, 262 462, 368 484
          C 474 462, 522 382, 518 318
          C 518 222, 474 174, 368 174
          C 262 174, 218 222, 218 318
          Z
        "
        fill="url(#sawakoFaceSkin)"
        stroke="#1c1d24"
        strokeWidth={2.6}
      />

      {/* Forehead Shadow softly placed under the long bangs */}
      <path
        d="M 218 260 Q 368 274 518 260 L 518 320 Q 368 330 218 320 Z"
        fill="url(#sawakoForeheadShadow)"
      />

      {/* ===================== 5. AIRBRUSH CHEEKS BLUSH & HATCHINGS ===================== */}
      <g id="cheeks-blush-layer">
        <ellipse cx="274" cy="380" rx={isShy ? 41 : 37} ry={isShy ? 24 : 22} fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={isShy ? 2 : 1.75} strokeLinecap="round" opacity={isShy ? 0.92 : 0.82}>
          <line x1="258" y1="382" x2="266" y2="370" />
          <line x1="266" y1="385" x2="274" y2="370" />
          <line x1="274" y1="386" x2="282" y2="370" />
          <line x1="282" y1="386" x2="290" y2="370" />
          <line x1="290" y1="384" x2="298" y2="372" />
        </g>

        <ellipse cx="462" cy="380" rx={isShy ? 41 : 37} ry={isShy ? 24 : 22} fill="url(#sawakoCheekAirbrush)" />
        <g stroke="#FF4D4D" strokeWidth={isShy ? 2 : 1.75} strokeLinecap="round" opacity={isShy ? 0.92 : 0.82}>
          <line x1="438" y1="382" x2="446" y2="372" />
          <line x1="446" y1="384" x2="454" y2="370" />
          <line x1="454" y1="386" x2="462" y2="370" />
          <line x1="462" y1="386" x2="470" y2="370" />
          <line x1="470" y1="385" x2="478" y2="370" />
        </g>
      </g>

      {/* Tiny Delicate Anime Nose */}
      <g id="anime-nose">
        <line x1="368" y1="385" x2="368" y2="392" stroke="#D18374" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx="368" cy="392" r="1.5" fill="#B9695C" />
      </g>

      {/* ===================== 6. SIGNATURE LONG ANIME BANGS & HIME CHEEK LOCKS ===================== */}
      {/*
        True to Kuronuma Sawako in "Sawako better.jpg":
        1. Length: Bangs reach down to eye level (Y=312 to 316), skimming right over the upper eyelashes.
           Completely removes the "ngố" (dorky high bangs) appearance.
        2. Cheek Locks (Tóc mai ôm má): Tapered strands hug both cheeks down to Y=370, giving Sawako her
           iconic slender, innocent, beautiful shoujo anime face.
        3. Center Lock: Soft, feathery, natural center bang falling between the eyes.
        4. Airy Slits: Small organic peeks showing the soft brow line underneath.
      */}
      <g id="sawako-lengthened-shoujo-bangs">
        {/* Main Hair Silhouette: Crown, Long Bangs reaching down to eyes (Y=314), and Cheek-Framing Strands (Y=370) */}
        <path
          d="
            M 204 316
            C 192 220, 244 136, 368 136
            C 492 136, 544 220, 532 316
            C 528 348, 516 380, 508 372
            C 502 344, 498 316, 490 312
            C 482 290, 474 290, 468 312
            C 462 316, 452 316, 446 312
            C 438 292, 430 292, 424 312
            C 418 316, 404 316, 396 314
            L 392 316
            C 384 317, 352 317, 344 316
            L 340 314
            C 332 316, 318 316, 312 312
            C 306 292, 298 292, 290 312
            C 284 316, 274 316, 268 312
            C 262 290, 254 290, 246 312
            C 238 316, 234 344, 228 372
            C 220 380, 208 348, 204 316
            Z
          "
          fill="url(#sawakoHairBase)"
          stroke="#07080B"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />

        {/* Delicate inner separation shadow lines for feathery depth */}
        <g stroke="#090A0E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.85">
          {/* Cheek Framing Strands Separation */}
          <path d="M 226 318 C 228 340, 226 360, 228 372" />
          <path d="M 510 318 C 508 340, 510 360, 508 372" />

          {/* Left Bangs Feathery Slits */}
          <path d="M 258 288 C 262 300, 266 312, 268 312" />
          <path d="M 280 290 C 284 302, 288 312, 290 312" />
          <path d="M 302 290 C 306 302, 310 312, 312 312" />

          {/* Center Signature Fringe Boundaries */}
          <path d="M 342 284 L 342 315" />
          <path d="M 394 284 L 394 315" />
          <line x1="368" y1="290" x2="368" y2="316" stroke="#252736" strokeWidth={1.2} />

          {/* Right Bangs Feathery Slits */}
          <path d="M 424 312 C 426 302, 430 290, 434 290" />
          <path d="M 446 312 C 448 302, 452 290, 456 290" />
          <path d="M 468 312 C 470 300, 474 288, 478 288" />
        </g>

        {/* Fine, flowing hair luster lines running along the length */}
        <g stroke="#3A3E54" strokeWidth={1.2} strokeLinecap="round" fill="none" opacity="0.6">
          {/* Left Cheek Lock Luster */}
          <path d="M 214 260 C 218 295, 220 335, 222 365" />
          <line x1="246" y1="240" x2="248" y2="308" />
          <line x1="276" y1="225" x2="278" y2="306" />
          <line x1="308" y1="215" x2="308" y2="306" />
          {/* Center Lock Luster */}
          <line x1="356" y1="205" x2="356" y2="310" />
          <line x1="380" y1="205" x2="380" y2="310" />
          {/* Right Bangs Luster */}
          <line x1="428" y1="215" x2="428" y2="306" />
          <line x1="458" y1="225" x2="458" y2="306" />
          <line x1="490" y1="240" x2="488" y2="308" />
          {/* Right Cheek Lock Luster */}
          <path d="M 522 260 C 518 295, 516 335, 514 365" />
        </g>

        {/* Luminous Angel-Ring Curved Hair Sheen */}
        <path
          d="M 220 220 Q 368 186 516 220 Q 368 200 220 220 Z"
          fill="url(#sawakoHairSheen)"
        />

        {/* Secondary gentle hair highlight shimmer */}
        <path
          d="M 244 232 Q 368 208 492 232 Q 368 218 244 232 Z"
          fill="#FFFFFF"
          fillOpacity={0.22}
        />

        {/* Crisp Anime Rim Light Contour on Top Crown */}
        <path
          d="M 216 280 C 206 215, 252 140, 368 140 C 484 140, 530 215, 520 280"
          stroke="#686F8E"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />

        {/* ===================== 7. AUTHENTIC WHITE STAR HAIRPIN & BOBBY PINS ===================== */}
        {/* Crisp pure white star with dual dark bobby pins pinning hair, faithful to Sawako better.jpg */}
        <g
          id="star-hairclip"
          data-testid="sawako-star-clip-target"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onPokeStarClip?.(e);
          }}
          className="cursor-pointer pointer-events-auto group focus:outline-hidden"
          aria-label="Touch Sawako's white star clip"
          transform="translate(252, 210) rotate(-14)"
        >
          {/* Stable circular invisible hit target preventing cursor edge flutter */}
          <circle cx="10" cy="0" r="32" fill="transparent" pointerEvents="all" />

          {/* Dual Dark Bobby Pins underneath the star */}
          <line x1="-16" y1="-5" x2="36" y2="-5" stroke="#101116" strokeWidth={3.8} strokeLinecap="round" />
          <line x1="-12" y1="5" x2="32" y2="5" stroke="#101116" strokeWidth={3.8} strokeLinecap="round" />
          <line x1="-15" y1="-5" x2="35" y2="-5" stroke="#373B4D" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="-11" y1="5" x2="31" y2="5" stroke="#373B4D" strokeWidth={1.5} strokeLinecap="round" />

          {/* Crisp Pure White Five-Pointed Star (★) */}
          <g transform="translate(4, 0) scale(1.4)">
            {/* Star Drop Shadow */}
            <polygon
              points="0,-16 4.7,-4.9 16.6,-4.9 7,2.1 10.7,13.7 0,6.6 -10.7,13.7 -7,2.1 -16.6,-4.9 -4.7,-4.9"
              fill="#000000"
              opacity="0.3"
              transform="translate(1, 1.5)"
            />
            {/* Solid Pure White Star */}
            <polygon
              points="0,-16 4.7,-4.9 16.6,-4.9 7,2.1 10.7,13.7 0,6.6 -10.7,13.7 -7,2.1 -16.6,-4.9 -4.7,-4.9"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            {/* Gentle Star Highlight */}
            <polygon points="0,-16 0,0 4.7,-4.9" fill="#F8FAFC" opacity="0.9" />
            <polygon points="-10.7,13.7 0,0 -7,2.1" fill="#F1F5F9" opacity="0.9" />
          </g>
        </g>

        {/* ===================== 8. HEADPAT INTERACTIVE SENSING ZONE ===================== */}
        {/* Generous sensory area covering crown and bangs for gentle stroking */}
        <path
          d="M 218 200 C 218 130, 368 118, 518 130 C 530 190, 520 280, 500 320 C 440 330, 300 330, 236 320 Z"
          fill="transparent"
          data-testid="sawako-headpat-target"
          className="cursor-pointer pointer-events-auto"
          onMouseMove={onHeadpatStroke}
          aria-label="Pet Sawako's hair"
        />
      </g>
    </g>
  );
}
