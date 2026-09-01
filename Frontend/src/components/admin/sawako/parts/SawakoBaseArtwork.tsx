import React from "react";
import type { SawakoExpression, SawakoWalkDirection } from "../types";

interface SawakoBaseArtworkProps {
  expression?: SawakoExpression;
  isHovered?: boolean;
  isShyPeeking?: boolean;
  isSippingTea?: boolean;
  isWalking?: boolean;
  walkDirection?: SawakoWalkDirection;
  onPokeStarClip?: (e: React.MouseEvent | React.TouchEvent) => void;
  onHeadpatStroke?: (e: React.MouseEvent | React.TouchEvent) => void;
  children?: React.ReactNode;
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
  isShyPeeking,
  isSippingTea = false,
  isWalking = false,
  walkDirection = "left",
  onPokeStarClip,
  onHeadpatStroke,
  children,
}: SawakoBaseArtworkProps) {
  const isShy = expression === "shy" || Boolean(isHovered) || isWalking;

  return (
    <g className="sawako-base-artwork">
      <style>{`
        /* Dáng váy đung đưa thướt tha khi tản bộ (Ojousama Skirt Sway) */
        @keyframes skirtSwayLeft {
          0%, 100% { transform: rotate(-2.2deg) skewX(-1.2deg); }
          50% { transform: rotate(1.8deg) skewX(1.0deg); }
        }
        @keyframes skirtSwayRight {
          0%, 100% { transform: rotate(2.2deg) skewX(1.2deg); }
          50% { transform: rotate(-1.8deg) skewX(-1.0deg); }
        }
      `}</style>
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

        {/* Soft Airbrush Cheeks Blush - Dreamy, Clear & Glowing without hard borders */}
        <radialGradient id="sawakoCheekAirbrush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF315F" stopOpacity={isShy ? 0.94 : 0.54} />
          <stop offset="45%" stopColor="#FF5F82" stopOpacity={isShy ? 0.68 : 0.3} />
          <stop offset="75%" stopColor="#FFA4B8" stopOpacity={isShy ? 0.3 : 0.1} />
          <stop offset="100%" stopColor="#FFA4B8" stopOpacity="0" />
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
      {/* ===================== 1. VINTAGE MILK-TEA KNIT VEST & PUFF BLOUSE ===================== */}
      <g id="pure-white-muse-dress">
        {/* Chân váy xòe mềm màu nâu socola dịu dàng: Phân biệt dáng đứng và dáng ngồi/quỳ */}
        {isSippingTea ? (
          /* Dáng ngồi quỳ Seiza Chibi: Váy trùm phủ bồng bềnh chạm sàn, ôm trọn và để lộ hai đầu gối tròn xinh ở chính diện */
          <g id="sawako-sitting-skirt-group">
            {/* Lớp bóng đổ mềm của chân váy lên mặt sàn */}
            <ellipse cx="368" cy="856" rx="140" ry="16" fill="#5B2607" opacity="0.25" />

            {/* Tà váy chính trùm phủ hai đùi, ôm lượn theo hai đầu gối ở chính diện */}
            <path
              d="
                M 295 650
                C 260 695, 238 770, 246 835
                C 250 856, 276 858, 312 840
                C 322 830, 330 826, 340 826
                C 352 826, 360 832, 368 834
                C 376 832, 384 826, 396 826
                C 406 826, 414 830, 424 840
                C 460 858, 486 856, 490 835
                C 498 770, 476 695, 441 650
                Q 368 662 295 650
                Z
              "
              fill="#78350F"
            />

            {/* Đường viền tà váy bên hông (viền đậm tự nhiên) */}
            <path
              d="M 295 650 C 260 695, 238 770, 246 835 C 250 856, 276 858, 312 840"
              stroke="#451A03"
              strokeWidth={2}
              fill="none"
            />
            <path
              d="M 424 840 C 460 858, 486 856, 490 835 C 498 770, 476 695, 441 650"
              stroke="#451A03"
              strokeWidth={2}
              fill="none"
            />
            {/* Viền gấu váy trước tiếp giáp gối mềm mại thanh thoát (không cắt xẻ vào da) */}
            <path
              d="M 312 840 C 322 830, 330 826, 340 826 C 352 826, 360 832, 368 834 C 376 832, 384 826, 396 826 C 406 826, 414 830, 424 840"
              stroke="#5B2607"
              strokeWidth={1.4}
              strokeLinecap="round"
              fill="none"
            />

            {/* Nếp gấp 3D bồng bềnh của chân váy & nếp ôm chạy thẳng vào hai đầu gối */}
            <g stroke="#92400E" strokeWidth={2.2} strokeLinecap="round" fill="none">
              {/* Nếp đùi trái chạy thẳng vào đỉnh đầu gối trái (X = 340) */}
              <path d="M 300 660 C 312 725, 328 780, 340 825" />
              {/* Nếp rủ khe giữa hai đầu gối chụm ở chính diện (X = 368) */}
              <path d="M 368 662 C 368 720, 368 775, 368 833" stroke="#B45309" strokeWidth={2.6} />
              {/* Nếp đùi phải chạy thẳng vào đỉnh đầu gối phải (X = 396) */}
              <path d="M 436 660 C 424 725, 408 780, 396 825" />

              {/* Nếp xếp vải nhẹ hai bên hông đùi chạm sàn */}
              <path d="M 258 765 C 252 805, 258 835, 276 852" stroke="#5B2607" strokeWidth={1.6} />
              <path d="M 478 765 C 484 805, 478 835, 460 852" stroke="#5B2607" strokeWidth={1.6} />
            </g>
          </g>
        ) : (
          /* Dáng đứng truyền thống hình chữ A - Đung đưa thướt tha khi tản bộ */
          <g
            id="sawako-standing-skirt"
            className={
              isWalking
                ? walkDirection === "left"
                  ? "animate-[skirtSwayLeft_1.0s_ease-in-out_infinite]"
                  : "animate-[skirtSwayRight_1.0s_ease-in-out_infinite]"
                : ""
            }
            style={{ transformOrigin: "368px 650px" }}
          >
            <path
              d="
                M 295 650
                L 226 865
                Q 368 890 510 865
                L 441 650
                Q 368 662 295 650
                Z
              "
              fill="#78350F"
              stroke="#451A03"
              strokeWidth={2}
            />
            {/* Nếp xếp rủ chân váy */}
            <g stroke="#92400E" strokeWidth={1.8} strokeLinecap="round" fill="none">
              <path d="M 330 655 C 322 720, 305 800, 290 866" />
              <path d="M 368 656 C 368 725, 368 805, 368 876" stroke="#B45309" strokeWidth={2.2} />
              <path d="M 406 655 C 414 720, 431 800, 446 866" />
            </g>
          </g>
        )}

        {/* Áo sơ mi trắng bên trong */}
        {/* Áo gile len dệt họa tiết quả trám màu trà sữa (Milk-Tea Argyle Vest) */}
        <path
          d="
            M 292 524
            L 334 580
            L 368 550
            L 402 580
            L 444 524
            L 434 650
            Q 368 662 302 650
            Z
          "
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth={1.8}
        />

        {/* Cổ sơ mi trắng bẻ tròn & nơ lụa nhỏ */}
        <path
          d="M 334 522 Q 350 545 368 538 Q 386 545 402 522 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.6}
        />
        <circle cx={368} cy={548} r={2.4} fill="#B45309" />

        {/* Họa tiết quả trám dệt len */}
        <polygon
          points="368,575 382,595 368,615 354,595"
          fill="none"
          stroke="#D97706"
          strokeWidth={1.4}
        />
        <polygon
          points="368,615 382,635 368,655 354,635"
          fill="none"
          stroke="#D97706"
          strokeWidth={1.4}
        />

        {/* Viền sọc len ở gấu áo gile */}
        <path
          d="M 305 644 Q 368 656 431 644"
          stroke="#B45309"
          strokeWidth={1.5}
          fill="none"
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
      {/* Phương Án 3: Cằm Trứng Oval Dịu Nhẹ (Y=479, giảm 50% độ nhọn, thanh tú và nữ tính) */}
      <path
        d="
          M 218 318
          C 214 382, 258 456, 340 478
          C 358 481, 378 481, 396 478
          C 478 456, 522 382, 518 318
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

      {/* ===================== 5. AIRBRUSH CHEEKS BLUSH ===================== */}
      <g id="cheeks-blush-layer">
        {/* Má hồng sương mai tán mịn chuẩn Anime: rõ nét, ngọt ngào nhưng tán dần về 0% không viền cứng */}
        <ellipse
          cx="276"
          cy="376"
          rx={isShyPeeking ? 34 : isShy ? 29 : 26}
          ry={isShyPeeking ? 20 : isShy ? 17 : 15}
          fill="url(#sawakoCheekAirbrush)"
        />
        <ellipse
          cx="460"
          cy="376"
          rx={isShyPeeking ? 34 : isShy ? 29 : 26}
          ry={isShyPeeking ? 20 : isShy ? 17 : 15}
          fill="url(#sawakoCheekAirbrush)"
        />
      </g>

      {/* Tiny Delicate Anime Nose */}
      <g id="anime-nose">
        <line x1="368" y1="385" x2="368" y2="392" stroke="#D18374" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx="368" cy="392" r="1.5" fill="#B9695C" />
      </g>

      {/* ===================== FACIAL FEATURES (EYES, MOUTH) ===================== */}
      {/* Rendered directly on the face skin, perfectly layered UNDER the bangs */}
      {children}

      {/* ===================== 6. UNIFIED COMPLETE SHOUJO HAIR SILHOUETTE ===================== */}
      {/*
        Hợp nhất 100% thành 1 Path duy nhất (Single Unified Silhouette):
        - Vòm đầu (Crown)
        - 2 Lọn tóc trước buông rủ dày dặn (Y=798) phủ trước thân áo đầm
        - Mái chữ nhật dịu dàng không chóp nhọn
        ==> 100% Tự nhiên, ZERO vết cắt, xóa sạch cảm giác tóc giả!
      */}
      <g id="sawako-lengthened-shoujo-bangs" className="pointer-events-none">
        {/* Main Unified Hair Silhouette */}
        <path
          d="
            M 204 316
            C 192 220, 244 136, 368 136
            C 492 136, 544 220, 532 316
            C 532 400, 524 490, 508 575
            C 496 635, 484 705, 496 760
            C 500 775, 506 790, 502 798
            C 498 790, 488 765, 478 715
            C 464 645, 462 565, 476 485
            C 486 425, 490 370, 492 316
            L 414 316
            C 410 316, 408 312, 408 304
            L 408 298
            C 408 295, 396 295, 396 298
            L 396 304
            C 396 312, 394 316, 390 316
            L 346 316
            C 342 316, 340 312, 340 304
            L 340 298
            C 340 295, 328 295, 328 298
            L 328 304
            C 328 312, 326 316, 322 316
            L 244 316
            C 246 370, 250 425, 260 485
            C 274 565, 272 645, 258 715
            C 248 765, 238 790, 234 798
            C 230 790, 236 775, 240 760
            C 252 705, 242 635, 230 575
            C 216 490, 208 400, 204 316
            Z
          "
          fill="url(#sawakoHairBase)"
          stroke="#07080B"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />

        {/* Các đường kẽ chỉ uốn lượn tự nhiên & phân tách lọn tóc */}
        <g stroke="#090A0E" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.85}>
          {/* Rãnh mái trán */}
          <line x1="284" y1="286" x2="284" y2="315" />
          <line x1="368" y1="286" x2="368" y2="315" />
          <line x1="452" y1="286" x2="452" y2="315" />

          {/* Đường gân phản quang lụa dọc thân 2 lọn tóc trước */}
          <path d="M 226 340 C 220 440, 242 550, 246 650 C 248 710, 242 755, 238 785" stroke="#5E6584" strokeWidth={2} opacity={0.7} />
          <path d="M 510 340 C 516 440, 494 550, 490 650 C 488 710, 494 755, 498 785" stroke="#5E6584" strokeWidth={2} opacity={0.7} />

          <path d="M 238 410 C 236 500, 256 590, 252 680" stroke="#8F96B8" strokeWidth={1.3} opacity="0.45" />
          <path d="M 498 410 C 500 500, 480 590, 484 680" stroke="#8F96B8" strokeWidth={1.3} opacity="0.45" />
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

        {/* Headpat sensing stays behind the interactive star hit target. */}
        <path
          d="M 218 200 C 218 130, 368 118, 518 130 C 530 190, 520 280, 500 320 C 440 330, 300 330, 236 320 Z"
          fill="transparent"
          data-testid="sawako-headpat-target"
          className="cursor-pointer pointer-events-auto touch-none"
          onMouseMove={onHeadpatStroke}
          onTouchMove={onHeadpatStroke}
          aria-label="Pet Sawako's hair"
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
      </g>
    </g>
  );
}
