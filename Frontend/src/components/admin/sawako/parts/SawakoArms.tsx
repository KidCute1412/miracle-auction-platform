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
 * - Slightly puffed sleeves with a clean, soft cuff
 * - Connected forearms and plain, bun-shaped chibi hands
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
            transform: translate(16px, -24px) rotate(8deg);
          }
          22% {
            transform: translate(14px, -21px) rotate(7deg);
          }
          78% {
            transform: translate(14px, -21px) rotate(7deg);
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
            transform: translate(-16px, -24px) rotate(-8deg);
          }
          22% {
            transform: translate(-14px, -21px) rotate(-7deg);
          }
          78% {
            transform: translate(-14px, -21px) rotate(-7deg);
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
          className=""
        >
          <path
            d="
              M 276 524
              C 222 545, 214 604, 254 628
              C 270 636, 292 625, 300 606
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

          {/* Clean cuff; no extra white layer or lace decoration */}
          <path
            d="M 252 626 Q 270 637 298 620"
            stroke="#CBD5E1"
            strokeWidth={2}
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

          {/* Plain bun-shaped left hand */}
          <g id="left-chibi-hand" transform="translate(292, 664)">
            <ellipse cx="7" cy="10" rx="13" ry="12" fill="#FEE3D4" stroke="#D8AA95" strokeWidth={1.4} />
          </g>
        </g>
      </g>

      {/* ===================== RIGHT ARM & HAND ===================== */}
      <g id="right-arm-render">
        {/* Voluminous Dreamy Puffed Muse Sleeve (anchored to dress shoulder) */}
        <g
          id="right-sleeve-group"
          className=""
        >
          <path
            d="
              M 460 524
              C 514 545, 522 604, 482 628
              C 466 636, 444 625, 436 606
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

          {/* Clean cuff; no extra white layer or lace decoration */}
          <path
            d="M 484 626 Q 466 637 438 620"
            stroke="#CBD5E1"
            strokeWidth={2}
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

          {/* Plain bun-shaped right hand */}
          <g id="right-chibi-hand" transform="translate(432, 664)">
            <ellipse cx="5" cy="10" rx="13" ry="12" fill="#FEE3D4" stroke="#D8AA95" strokeWidth={1.4} />
          </g>
        </g>
      </g>
    </g>
  );
}
