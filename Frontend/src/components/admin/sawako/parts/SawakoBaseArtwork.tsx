import React from "react";

/**
 * SawakoBaseArtwork - High-Fidelity Anime Chibi Vector Puppet
 * Masterfully crafted to capture the exact likeness of Kuronuma Sawako from "Sawako better.jpg"
 * Features:
 * - Authentic anime face contour: delicate rounded chin, fair ivory skin tone
 * - Rich multi-layered hair with individual strand cuts, angel ring gloss sheen
 * - Airbrush blush cheeks with distinct fine anime diagonal blush hatchings
 * - 3D white 5-pointed star hair clip with clip bar and bevel gleam
 * - Realistic button-up cardigan: turned-down collar, inner shirt, tailored seam stitches, 3D buttons
 * - Flared pleated ton-sur-ton skirt with volumetric pleat shadows
 */
export function SawakoBaseArtwork() {
  return (
    <g className="sawako-base-artwork">
      <defs>
        {/* Soft Face Skin Gradient with Fair Anime Undertones */}
        <radialGradient id="sawakoFaceSkin" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#FFFDFC" />
          <stop offset="65%" stopColor="#FFF4ED" />
          <stop offset="90%" stopColor="#FEE9DC" />
          <stop offset="100%" stopColor="#F8DDCB" />
        </radialGradient>

        {/* Neck Ambient Occlusion Shadow */}
        <linearGradient id="sawakoNeckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6BCA4" stopOpacity="0.75" />
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

        {/* Cream Cardigan Fabric Shading */}
        <linearGradient id="sawakoCardiganFabric" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDF9F3" />
          <stop offset="40%" stopColor="#F7EFE4" />
          <stop offset="85%" stopColor="#EFE3D4" />
          <stop offset="100%" stopColor="#E2D2C0" />
        </linearGradient>

        {/* Ton-Sur-Ton Skirt Shading */}
        <linearGradient id="sawakoSkirtFabric" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7EFE4" />
          <stop offset="50%" stopColor="#EDE0D0" />
          <stop offset="100%" stopColor="#D9C6B2" />
        </linearGradient>

        {/* Cardigan Collar Shadow */}
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

      {/* ===================== 1. BACK HAIR SILHOUETTE ===================== */}
      {/* Massive silky straight hair falling behind shoulders and waist */}
      <g id="back-hair-layer">
        {/* Main Hair Dome */}
        <path
          d="
            M 368 135
            C 240 135, 140 215, 118 350
            C 100 470, 95 640, 110 780
            C 122 880, 150 935, 205 950
            C 245 960, 285 925, 305 885
            C 330 835, 342 775, 368 775
            C 394 775, 406 835, 431 885
            C 451 925, 491 960, 531 950
            C 586 935, 614 880, 626 780
            C 641 640, 636 470, 618 350
            C 596 215, 496 135, 368 135
            Z
          "
          fill="url(#sawakoHairBase)"
          stroke="#07080B"
          strokeWidth={2.5}
        />

        {/* Left Side Hair Edge Layering */}
        <path
          d="
            M 148 380
            C 130 520, 130 720, 160 870
            C 170 915, 190 925, 205 900
            C 185 780, 170 580, 180 420
            Z
          "
          fill="#08090C"
          opacity="0.75"
        />
        {/* Right Side Hair Edge Layering */}
        <path
          d="
            M 588 380
            C 606 520, 606 720, 576 870
            C 566 915, 546 925, 531 900
            C 551 780, 566 580, 556 420
            Z
          "
          fill="#08090C"
          opacity="0.75"
        />

        {/* Silky Hair Strand Flow Highlights */}
        <path d="M 175 460 C 160 620, 168 770, 190 880" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 561 460 C 576 620, 568 770, 546 880" stroke="#3A3D4E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />
      </g>

      {/* ===================== 2. TON-SUR-TON PLEATED SKIRT ===================== */}
      <g id="skirt-layer">
        {/* Flared Skirt Base with rich fabric gradient */}
        <path
          d="
            M 292 706
            Q 368 722 444 706
            C 478 750, 498 806, 506 836
            Q 368 860 230 836
            C 238 806, 258 750, 292 706
            Z
          "
          fill="url(#sawakoSkirtFabric)"
          stroke="#C8B6A2"
          strokeWidth={2.2}
        />

        {/* Skirt Pleat Shadow Folds giving 3D realistic volume */}
        <g stroke="#BAA58E" strokeWidth={2.2} strokeLinecap="round" fill="none">
          <path d="M 264 718 C 268 758, 265 802, 258 838" />
          <path d="M 302 721 C 306 760, 308 806, 308 845" />
          <path d="M 342 723 C 344 762, 346 808, 344 848" />
          <path d="M 368 724 C 368 764, 368 810, 368 850" strokeWidth={2.8} stroke="#A89279" />
          <path d="M 394 723 C 392 762, 390 808, 392 848" />
          <path d="M 434 721 C 430 760, 428 806, 428 845" />
          <path d="M 472 718 C 468 758, 471 802, 478 838" />
        </g>

        {/* Pleat Light Highlights on Crease Peaks */}
        <g stroke="#FAF6EE" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M 284 720 C 288 760, 290 804, 290 842" />
          <path d="M 324 722 C 326 761, 328 807, 326 846" />
          <path d="M 412 722 C 410 761, 408 807, 410 846" />
          <path d="M 452 720 C 448 760, 446 804, 446 842" />
        </g>

        {/* Delicate Skirt Hem Trim */}
        <path
          d="M 230 836 Q 268 846 305 844 Q 336 849 368 850 Q 400 849 431 844 Q 468 846 506 836"
          stroke="#FAF5EE"
          strokeWidth={2.5}
          fill="none"
        />
      </g>

      {/* ===================== 3. CREAM BUTTON-UP CARDIGAN ===================== */}
      <g id="cardigan-layer">
        {/* Main Cardigan Torso Silhouette */}
        <path
          d="
            M 276 522
            Q 368 536 460 522
            C 478 580, 485 650, 454 712
            Q 368 726 282 712
            C 251 650, 258 580, 276 522
            Z
          "
          fill="url(#sawakoCardiganFabric)"
          stroke="#C8B6A2"
          strokeWidth={2.5}
        />

        {/* Soft Inner Camisole visible at throat V-neck */}
        <path d="M 344 516 Q 368 544 392 516 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.8} />

        {/* Tailored Lapel Collar Fold (Left & Right) matching Sawako better.jpg */}
        <path
          d="M 330 514 C 340 538, 356 552, 368 556 C 356 540, 348 522, 342 514 Z"
          fill="#FAF4EC"
          stroke="#C2B09C"
          strokeWidth={2}
        />
        <path
          d="M 406 514 C 396 538, 380 552, 368 556 C 380 540, 388 522, 394 514 Z"
          fill="#FAF4EC"
          stroke="#C2B09C"
          strokeWidth={2}
        />

        {/* Collar Drop Shadow onto Chest */}
        <path d="M 342 546 Q 368 564 394 546 Q 368 556 342 546 Z" fill="url(#sawakoCollarShadow)" />

        {/* Center Placket Column */}
        <path d="M 364 556 L 364 720 L 372 720 L 372 556 Z" fill="#F4ECE0" stroke="#C8B6A2" strokeWidth={1.2} />
        <line x1="368" y1="556" x2="368" y2="720" stroke="#BAA692" strokeWidth={1.8} />

        {/* Tailored Fit Dart Seams (from Sawako better.jpg) */}
        <path d="M 318 560 C 322 610, 324 660, 320 696" stroke="#D1C0AF" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />
        <path d="M 418 560 C 414 610, 412 660, 416 696" stroke="#D1C0AF" strokeWidth={1.8} strokeDasharray="5,3" fill="none" />

        {/* 3D Realistic Circular Buttons with Thread Crosses */}
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

      {/* ===================== 4. DELICATE CHIBI NECK & EARS ===================== */}
      <g id="neck-layer">
        <path d="M 348 480 L 348 532 Q 368 540 388 532 L 388 480 Z" fill="#FEE5D8" />
        {/* Soft Chin Shadow onto Neck */}
        <path d="M 348 482 Q 368 506 388 482 L 388 498 Q 368 518 348 498 Z" fill="url(#sawakoNeckShadow)" />

        {/* Delicate Clavicle Indication */}
        <path d="M 358 522 Q 368 526 378 522" stroke="#E0B69E" strokeWidth={1.5} strokeLinecap="round" fill="none" />

        {/* Petite Chibi Ears with inner helix detail */}
        <g id="left-ear">
          <ellipse cx="204" cy="358" rx="14" ry="22" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 206 350 Q 200 358 206 366" stroke="#E6B4A0" strokeWidth={2} strokeLinecap="round" fill="none" />
        </g>
        <g id="right-ear">
          <ellipse cx="532" cy="358" rx="14" ry="22" fill="#FEE7DA" stroke="#1c1d24" strokeWidth={2} />
          <path d="M 530 350 Q 536 358 530 366" stroke="#E6B4A0" strokeWidth={2} strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* ===================== 5. ROUND CHIBI FACE CONTOUR ===================== */}
      {/* Shaped to perfectly capture Sawako's innocent, slightly oval-chibi face */}
      <path
        d="
          M 204 326
          C 192 406, 238 482, 368 492
          C 498 482, 544 406, 532 326
          C 532 226, 482 176, 368 176
          C 254 176, 204 226, 204 326
          Z
        "
        fill="url(#sawakoFaceSkin)"
        stroke="#1c1d24"
        strokeWidth={2.8}
      />

      {/* Forehead Shadow cast by the straight bangs */}
      <path
        d="M 210 270 Q 368 285 526 270 L 526 312 Q 368 322 210 312 Z"
        fill="url(#sawakoBangsShadow)"
      />

      {/* ===================== 6. AIRBRUSH CHEEKS BLUSH & HATCHINGS ===================== */}
      {/* Modeled directly from Sawako better.jpg: soft airbrush blush + fine diagonal red pencil strokes */}
      <g id="cheeks-blush-layer">
        {/* Left Blush Soft Airbrush Cloud */}
        <ellipse cx="270" cy="382" rx="42" ry="26" fill="url(#sawakoCheekAirbrush)" />
        {/* Left Anime Diagonal Blush Hatch Lines (6 delicate lines) */}
        <g stroke="#FF4D4D" strokeWidth={2} strokeLinecap="round" opacity="0.82">
          <line x1="250" y1="384" x2="258" y2="372" />
          <line x1="258" y1="387" x2="266" y2="372" />
          <line x1="266" y1="388" x2="274" y2="372" />
          <line x1="274" y1="388" x2="282" y2="372" />
          <line x1="282" y1="386" x2="290" y2="374" />
          <line x1="290" y1="384" x2="297" y2="376" />
        </g>

        {/* Right Blush Soft Airbrush Cloud */}
        <ellipse cx="466" cy="382" rx="42" ry="26" fill="url(#sawakoCheekAirbrush)" />
        {/* Right Anime Diagonal Blush Hatch Lines (6 delicate lines) */}
        <g stroke="#FF4D4D" strokeWidth={2} strokeLinecap="round" opacity="0.82">
          <line x1="446" y1="384" x2="454" y2="376" />
          <line x1="453" y1="386" x2="461" y2="374" />
          <line x1="461" y1="388" x2="469" y2="372" />
          <line x1="469" y1="388" x2="477" y2="372" />
          <line x1="477" y1="387" x2="485" y2="372" />
          <line x1="485" y1="384" x2="493" y2="372" />
        </g>
      </g>

      {/* Tiny Delicate Anime Nose (from Sawako better.jpg) */}
      <g id="anime-nose">
        <line x1="368" y1="385" x2="368" y2="392" stroke="#D18374" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx="368" cy="392" r="1.5" fill="#B9695C" />
      </g>

      {/* ===================== 7. STRAIGHT BANGS & STAR HAIRPIN ===================== */}
      {/* Sawako's signature straight-across fringe bangs with delicate strand gaps and tips */}
      <g id="front-bangs-layer">
        <path
          d="
            M 194 304
            C 188 230, 240 146, 368 146
            C 496 146, 548 230, 542 304
            C 530 298, 522 292, 512 308
            L 504 270
            C 492 298, 482 308, 468 308
            L 460 270
            C 446 298, 436 308, 422 308
            L 414 270
            C 400 298, 390 308, 368 308
            C 346 308, 336 298, 322 270
            L 314 308
            C 300 308, 290 298, 276 270
            L 268 308
            C 254 308, 244 298, 232 270
            L 224 308
            C 214 292, 206 298, 194 304
            Z
          "
          fill="#14151D"
          stroke="#0A0B0E"
          strokeWidth={2.4}
        />

        {/* Fine vertical strand lines between bang chunks */}
        <g stroke="#2C2E3C" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.8">
          <line x1="246" y1="200" x2="252" y2="280" />
          <line x1="294" y1="185" x2="298" y2="285" />
          <line x1="344" y1="180" x2="346" y2="288" />
          <line x1="392" y1="180" x2="390" y2="288" />
          <line x1="442" y1="185" x2="438" y2="285" />
          <line x1="490" y1="200" x2="484" y2="280" />
        </g>

        {/* Tenshi no Wa (Angel Ring Hair Gloss Arch) across upper forehead */}
        <path
          d="M 228 228 Q 368 198 508 228 Q 368 214 228 228 Z"
          fill="url(#sawakoHairSheen)"
        />

        {/* Iconic White 5-Pointed Star Clip with Clip Bar & Bevel Gleam */}
        {/* Pinned on the character's right temple (viewer's upper left) */}
        <g id="star-hairclip" transform="translate(254, 218) rotate(-14) scale(1.4)">
          {/* Clip bar underneath the hair */}
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#6B7280" strokeWidth={3} strokeLinecap="round" />
          {/* Star Soft Shadow */}
          <polygon
            points="0,-17 4.9,-5.2 17.5,-5.2 7.4,2.2 11.2,14.5 0,7 -11.2,14.5 -7.4,2.2 -17.5,-5.2 -4.9,-5.2"
            fill="#000000"
            opacity="0.35"
            transform="translate(1.5, 2)"
          />
          {/* Crisp Pure White Star */}
          <polygon
            points="0,-17 4.9,-5.2 17.5,-5.2 7.4,2.2 11.2,14.5 0,7 -11.2,14.5 -7.4,2.2 -17.5,-5.2 -4.9,-5.2"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Beveled Center Facets for 3D Shine */}
          <polygon points="0,-17 0,0 4.9,-5.2" fill="#F8FAFC" opacity="0.9" />
          <polygon points="17.5,-5.2 0,0 7.4,2.2" fill="#E2E8F0" opacity="0.7" />
          <polygon points="11.2,14.5 0,0 0,7" fill="#CBD5E1" opacity="0.6" />
          <polygon points="-11.2,14.5 0,0 -7.4,2.2" fill="#F1F5F9" opacity="0.9" />
          <polygon points="-17.5,-5.2 0,0 -4.9,-5.2" fill="#FFFFFF" />
          {/* Star Center Gleam */}
          <circle cx="-1" cy="-2" r="3.2" fill="#FFFDE7" />
        </g>
      </g>
    </g>
  );
}
