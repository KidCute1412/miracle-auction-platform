import React from "react";

interface SawakoArmsProps {
  isHovered?: boolean;
  isDragging: boolean;
  hoveredZone?: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
  isProtectingStar?: boolean;
}

/**
 * SawakoArms - Romantic Muse Puffed Sleeves & Articulated Chibi Hands
 * Features:
 * - Dreamy puffed lantern sleeves with delicate lace frill cuffs matching the muse dress
 * - Bare slender forearms and soft blushing chibi fingertips
 * - Fluid kinematics: airborne flailing when dragged, cute bashful chest clutching when startled
 * - Interactive hotspot with `sawako-hands-target`
 */
export function SawakoArms({
  isDragging,
  onPokeHand,
  setHoveredZone,
  isProtectingStar,
}: SawakoArmsProps) {
  const armClass = isDragging
    ? "animate-[airborneArmsFlail_0.45s_ease-in-out_infinite]"
    : "transition-transform duration-200 ease-out";

  return (
    <g
      data-testid="sawako-hands-target"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onPokeHand?.(e);
      }}
      onMouseEnter={() => setHoveredZone("hand")}
      onMouseLeave={() => setHoveredZone(null)}
      className={`cursor-pointer pointer-events-auto group focus:outline-hidden ${armClass}`}
      aria-label="Interact with Sawako's hands"
      style={{
        transformOrigin: "368px 524px",
      }}
    >
      <style>{`
        @keyframes clutchChestLeft {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          14% {
            transform: translate(26px, -40px) rotate(14deg);
          }
          22% {
            transform: translate(22px, -34px) rotate(11deg);
          }
          78% {
            transform: translate(22px, -34px) rotate(11deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
        @keyframes clutchChestRight {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          14% {
            transform: translate(-26px, -40px) rotate(-14deg);
          }
          22% {
            transform: translate(-22px, -34px) rotate(-11deg);
          }
          78% {
            transform: translate(-22px, -34px) rotate(-11deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
        @keyframes shrugSleeveLeft {
          0% {
            transform: translateY(0);
          }
          14% {
            transform: translateY(-5px);
          }
          22% {
            transform: translateY(-3px);
          }
          78% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes shrugSleeveRight {
          0% {
            transform: translateY(0);
          }
          14% {
            transform: translateY(-5px);
          }
          22% {
            transform: translateY(-3px);
          }
          78% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
      <defs>
        {/* Puffed Muse Sleeve Gradient */}
        <linearGradient id="musePuffSleeveLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="musePuffSleeveRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Bare Forearm Skin Gradient */}
        <linearGradient id="forearmSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4ED" />
          <stop offset="100%" stopColor="#FEE6D6" />
        </linearGradient>

        {/* Fingertip Blush Glow */}
        <radialGradient id="fingerBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFA6A6" stopOpacity="0.75" />
          <stop offset="70%" stopColor="#FFA6A6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFA6A6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ===================== LEFT ARM & HAND ===================== */}
      <g id="left-arm-render">
        {/* Voluminous Dreamy Puffed Muse Sleeve (anchored to dress shoulder) */}
        <g
          id="left-sleeve-group"
          className={isProtectingStar ? "animate-[shrugSleeveLeft_1.8s_ease-in-out]" : ""}
        >
          <path
            d="
              M 276 524
              C 230 545, 224 600, 258 622
              C 272 628, 290 620, 296 606
              C 284 570, 288 544, 308 532
              Z
            "
            fill="url(#musePuffSleeveLeft)"
            stroke="#CBD5E1"
            strokeWidth={2}
          />

          {/* Sleeve Fabric Folds */}
          <path d="M 242 568 Q 262 584 278 574" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <path d="M 252 590 Q 270 602 284 594" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" fill="none" />

          {/* Ruffled Lace Cuff at Puffed Sleeve Hem */}
          <path
            d="M 256 620 Q 266 628 276 622 Q 286 628 296 616"
            stroke="#E2E8F0"
            strokeWidth={2.4}
            fill="none"
          />
        </g>

        {/* Articulated Forearm & Hand: natural clutching toward chest */}
        <g
          id="left-forearm-hand-group"
          className={isProtectingStar ? "animate-[clutchChestLeft_1.8s_cubic-bezier(0.34,1.2,0.64,1)]" : ""}
          style={{ transformOrigin: "280px 614px" }}
        >
          {/* Bare Forearm extending down from puffed sleeve */}
          <path
            d="
              M 264 614
              C 256 635, 276 665, 296 668
              L 306 658
              C 292 642, 280 622, 284 610
              Z
            "
            fill="url(#forearmSkin)"
            stroke="#CBD5E1"
            strokeWidth={1.2}
          />

          {/* Petite Chibi Left Hand */}
          <g id="left-chibi-hand" transform="translate(292, 664)">
            <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1.2} />
            {/* Thumb */}
            <path d="M 12 4 C 16 5, 17 9, 14 12 C 12 11, 10 7, 12 4 Z" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1} />
            <ellipse cx="14" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
            {/* Fingers */}
            <path d="M 4 17 Q 6 19 8 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <path d="M 0 16 Q 2 18 4 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
          </g>
        </g>
      </g>

      {/* ===================== RIGHT ARM & HAND ===================== */}
      <g id="right-arm-render">
        {/* Voluminous Dreamy Puffed Muse Sleeve (anchored to dress shoulder) */}
        <g
          id="right-sleeve-group"
          className={isProtectingStar ? "animate-[shrugSleeveRight_1.8s_ease-in-out]" : ""}
        >
          <path
            d="
              M 460 524
              C 506 545, 512 600, 478 622
              C 464 628, 446 620, 440 606
              C 452 570, 448 544, 428 532
              Z
            "
            fill="url(#musePuffSleeveRight)"
            stroke="#CBD5E1"
            strokeWidth={2}
          />

          {/* Sleeve Fabric Folds */}
          <path d="M 494 568 Q 474 584 458 574" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <path d="M 484 590 Q 466 602 452 594" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" fill="none" />

          {/* Ruffled Lace Cuff at Puffed Sleeve Hem */}
          <path
            d="M 480 620 Q 470 628 460 622 Q 450 628 440 616"
            stroke="#E2E8F0"
            strokeWidth={2.4}
            fill="none"
          />
        </g>

        {/* Articulated Forearm & Hand: natural clutching toward chest */}
        <g
          id="right-forearm-hand-group"
          className={isProtectingStar ? "animate-[clutchChestRight_1.8s_cubic-bezier(0.34,1.2,0.64,1)]" : ""}
          style={{ transformOrigin: "456px 614px" }}
        >
          {/* Bare Forearm extending down from puffed sleeve */}
          <path
            d="
              M 472 614
              C 480 635, 460 665, 440 668
              L 430 658
              C 444 642, 456 622, 452 610
              Z
            "
            fill="url(#forearmSkin)"
            stroke="#CBD5E1"
            strokeWidth={1.2}
          />

          {/* Petite Chibi Right Hand */}
          <g id="right-chibi-hand" transform="translate(432, 664)">
            <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1.2} />
            {/* Thumb */}
            <path d="M 0 4 C -4 5, -5 9, -2 12 C 0 11, 2 7, 0 4 Z" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1} />
            <ellipse cx="-2" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
            {/* Fingers */}
            <path d="M 4 17 Q 6 19 8 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <path d="M 8 16 Q 10 18 12 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
          </g>
        </g>
      </g>
    </g>
  );
}
