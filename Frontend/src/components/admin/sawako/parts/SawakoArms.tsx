import React from "react";
import type { SawakoWalkDirection } from "../types";

interface SawakoArmsProps {
  isHovered?: boolean;
  isDragging: boolean;
  hoveredZone?: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent | React.TouchEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
  isProtectingStar?: boolean;
  isWalking?: boolean;
  walkDirection?: SawakoWalkDirection;
  isSippingTea?: boolean;
}

/**
 * SawakoArms - Romantic Muse Puffed Sleeves & Articulated Chibi Hands
 * Features:
 * - Slightly puffed sleeves with a clean, soft cuff
 * - Connected forearms and plain, bun-shaped chibi hands
 * - Fluid kinematics: airborne flailing when dragged, cute bashful chest clutching when startled, gentle natural swinging when walking
 * - Holding warm ceramic matcha teacup when sipping tea (isSippingTea)
 * - Interactive hotspot with `sawako-hands-target`
 */
export function SawakoArms({
  isDragging,
  onPokeHand,
  setHoveredZone,
  isProtectingStar,
  isWalking = false,
  walkDirection = "left",
  isSippingTea = false,
}: SawakoArmsProps) {
  const isSipping = isSippingTea && !isDragging;

  const isWalkingLeft = !isDragging && !isSipping && isWalking && walkDirection === "left";
  const isWalkingRight = !isDragging && !isSipping && isWalking && walkDirection === "right";

  const leftArmWalkClass = isWalkingLeft
    ? "animate-[waddleArmSwingBack_1.0s_ease-in-out_infinite]"
    : isWalkingRight
      ? "animate-[waddleArmSwingForward_1.0s_ease-in-out_infinite]"
      : "transition-transform duration-200 ease-out";

  const rightArmWalkClass = isWalkingLeft
    ? "animate-[waddleArmSwingForward_1.0s_ease-in-out_infinite]"
    : isWalkingRight
      ? "animate-[waddleArmSwingBack_1.0s_ease-in-out_infinite]"
      : "transition-transform duration-200 ease-out";

  const armClass = isDragging
    ? "animate-[airborneArmsFlail_0.45s_ease-in-out_infinite]"
    : isSipping
      ? "animate-[teaCupGentleSip_3.2s_ease-in-out_infinite]"
      : "transition-transform duration-200 ease-out";

  const isWalkingActive = isWalking && !isDragging && !isSipping;

  const leftForearmStyle: React.CSSProperties = isSipping
    ? { transform: "translate(22px, -14px) rotate(26deg)", transformOrigin: "280px 614px", transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)" }
    : isWalkingActive
      ? { transform: "translate(6px, -10px) rotate(12deg)", transformOrigin: "280px 614px", transition: "transform 0.4s ease-out" }
      : { transformOrigin: "280px 614px", transition: "transform 0.5s ease-out" };

  const rightForearmStyle: React.CSSProperties = isSipping
    ? { transform: "translate(-22px, -14px) rotate(-26deg)", transformOrigin: "456px 614px", transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)" }
    : isWalkingActive
      ? { transform: "translate(-6px, -10px) rotate(-12deg)", transformOrigin: "456px 614px", transition: "transform 0.4s ease-out" }
      : { transformOrigin: "456px 614px", transition: "transform 0.5s ease-out" };

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
        /* Vung tay khẽ khàng, e thẹn dịu dàng khẽ ôm nhẹ mép váy khi bước đi */
        @keyframes waddleArmSwingBack {
          0% { transform: rotate(0deg) translate(0px, 0px); }
          25% { transform: rotate(-2.5deg) translate(-1px, -1px); }
          50% { transform: rotate(0deg) translate(0px, 0px); }
          75% { transform: rotate(3deg) translate(1px, -1.5px); }
          100% { transform: rotate(0deg) translate(0px, 0px); }
        }
        @keyframes waddleArmSwingForward {
          0% { transform: rotate(0deg) translate(0px, 0px); }
          25% { transform: rotate(3deg) translate(1px, -1.5px); }
          50% { transform: rotate(0deg) translate(0px, 0px); }
          75% { transform: rotate(-2.5deg) translate(-1px, -1px); }
          100% { transform: rotate(0deg) translate(0px, 0px); }
        }

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
        @keyframes teaSteamRise1 {
          0% {
            opacity: 0;
            transform: translateY(0px) scaleX(0.7);
          }
          35% {
            opacity: 0.85;
            transform: translateY(-8px) scaleX(1);
          }
          75% {
            opacity: 0.45;
            transform: translateY(-20px) scaleX(1.3);
          }
          100% {
            opacity: 0;
            transform: translateY(-34px) scaleX(0.8);
          }
        }
        @keyframes teaSteamRise2 {
          0% {
            opacity: 0;
            transform: translateY(0px) scaleX(0.7);
          }
          40% {
            opacity: 0.75;
            transform: translateY(-10px) scaleX(1.1);
          }
          80% {
            opacity: 0.35;
            transform: translateY(-22px) scaleX(1.4);
          }
          100% {
            opacity: 0;
            transform: translateY(-36px) scaleX(0.9);
          }
        }
        @keyframes teaCupGentleSip {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(0.6deg);
          }
        }
      `}</style>
      <defs>
        {/* Ceramic Teacup Gradient */}
        <linearGradient id="ceramicTeacupSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Hot Matcha Liquid Gradient */}
        <radialGradient id="matchaLiquidGradient" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#65A30D" />
          <stop offset="70%" stopColor="#4D7C0F" />
          <stop offset="100%" stopColor="#365314" />
        </radialGradient>
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
      <g id="left-arm-render" className={leftArmWalkClass} style={{ transformOrigin: "276px 524px" }}>
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
          style={leftForearmStyle}
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
      <g id="right-arm-render" className={rightArmWalkClass} style={{ transformOrigin: "460px 524px" }}>
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
          style={rightForearmStyle}
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

      {/* ===================== WARM CERAMIC MATCHA TEACUP & STEAM ===================== */}
      {isSipping && (
        <g
          id="sawako-matcha-teacup"
          data-testid="sawako-matcha-teacup"
          className="pointer-events-none animate-[teaCupGentleSip_3.2s_ease-in-out_infinite]"
          style={{ transformOrigin: "368px 665px" }}
        >
          {/* Subtle warm glow aura behind teacup */}
          <ellipse cx="368" cy="668" rx="28" ry="16" fill="#86EFAC" opacity="0.22" />

          {/* Saucer / Coaster */}
          <ellipse cx="368" cy="682" rx="22" ry="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth={1.2} />

          {/* Ceramic Chawan Teacup Body */}
          <path
            d="
              M 348 654
              C 346 673, 353 681, 368 681
              C 383 681, 390 673, 388 654
              Z
            "
            fill="url(#ceramicTeacupSkin)"
            stroke="#64748B"
            strokeWidth={1.8}
          />

          {/* Teacup Rim Ellipse */}
          <ellipse cx="368" cy="654" rx="20" ry="6.5" fill="#F8FAFC" stroke="#64748B" strokeWidth={1.4} />

          {/* Hot Green Matcha Tea Liquid Inside */}
          <ellipse cx="368" cy="655" rx="16.5" ry="4.8" fill="url(#matchaLiquidGradient)" />

          {/* Tea Liquid Highlight / Sheen */}
          <ellipse cx="365" cy="654" rx="9" ry="2" fill="#BEF264" opacity="0.8" />

          {/* Cute Pink Sakura Petal Stamp on cup */}
          <circle cx="368" cy="668" r="3.2" fill="#F472B6" opacity="0.9" />
          <circle cx="368" cy="668" r="1.3" fill="#FFFFFF" />

          {/* Rising Curling Wisps of Steam */}
          <g id="tea-steam-wisps">
            {/* Wisp 1 */}
            <path
              d="M 363 646 Q 359 634 364 622 T 361 606"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="animate-[teaSteamRise1_2.4s_ease-out_infinite]"
            />
            {/* Wisp 2 */}
            <path
              d="M 373 646 Q 378 635 372 624 T 376 608"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[teaSteamRise2_2.8s_ease-out_infinite]"
            />
          </g>
        </g>
      )}
    </g>
  );
}
