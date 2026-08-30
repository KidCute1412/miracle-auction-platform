import React from "react";

interface SawakoArmsProps {
  isHovered: boolean;
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoArms - Pure White Dress Sleeves with Shy Fluttering Kinematics
 * Features:
 * - Removed spinning rings on hover
 * - Shy fluttering/flailing animation when hovered ("kiểu ngại, tay chân vùng vẫy một chút")
 * - Delicate bare wrists and soft chibi hands with blushing rosy fingertips
 * - Interactive hotspot with `sawako-hands-target`
 */
export function SawakoArms({
  isHovered,
  isDragging,
  hoveredZone,
  onPokeHand,
  setHoveredZone,
}: SawakoArmsProps) {
  // Shy flailing / fluttering kinematics on hover
  let armClass = "transition-transform duration-200 ease-out";
  let armTransform = "translate(0, 0)";

  if (isDragging) {
    armTransform = "translate(0, -14px) scale(1.04)";
  } else if (isHovered || hoveredZone === "hand") {
    // Shy cute hand flailing wiggle
    armClass = "animate-[shyArmsFlutter_0.5s_ease-in-out_infinite]";
  }

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
        transform: armTransform,
        transformOrigin: "368px 530px",
      }}
    >
      <defs>
        {/* Pure White Dress Sleeve Gradient */}
        <linearGradient id="whiteSleeveLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="whiteSleeveRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
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
        <path
          d="
            M 276 524
            C 240 560, 232 620, 268 672
            C 278 678, 296 676, 308 660
            C 288 618, 288 565, 308 532
            Z
          "
          fill="url(#whiteSleeveLeft)"
          stroke="#CBD5E1"
          strokeWidth={2}
        />
        <path d="M 246 605 Q 262 615 278 604" stroke="#CBD5E1" strokeWidth={1.6} strokeLinecap="round" fill="none" />

        <path
          d="M 268 672 Q 288 680 308 660 L 306 654 Q 286 674 268 666 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.4}
        />

        <g id="left-chibi-hand" transform="translate(294, 666)">
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1.2} />
          <path d="M 12 4 C 16 5, 17 9, 14 12 C 12 11, 10 7, 12 4 Z" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1} />
          <ellipse cx="14" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          <path d="M 4 17 Q 6 19 8 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 16 Q 2 18 4 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* ===================== RIGHT ARM & HAND ===================== */}
      <g id="right-arm-render">
        <path
          d="
            M 460 524
            C 496 560, 504 620, 468 672
            C 458 678, 440 676, 428 660
            C 448 618, 448 565, 428 532
            Z
          "
          fill="url(#whiteSleeveRight)"
          stroke="#CBD5E1"
          strokeWidth={2}
        />
        <path d="M 490 605 Q 474 615 458 604" stroke="#CBD5E1" strokeWidth={1.6} strokeLinecap="round" fill="none" />

        <path
          d="M 468 672 Q 448 680 428 660 L 430 654 Q 450 674 468 666 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.4}
        />

        <g id="right-chibi-hand" transform="translate(430, 666)">
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1.2} />
          <path d="M 0 4 C -4 5, -5 9, -2 12 C 0 11, 2 7, 0 4 Z" fill="#FEE3D4" stroke="#CBD5E1" strokeWidth={1} />
          <ellipse cx="-2" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          <path d="M 6 17 Q 8 19 10 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 10 16 Q 12 18 14 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* Invisible broad hotspot over hands */}
      <rect
        x="220"
        y="520"
        width="296"
        height="190"
        fill="transparent"
        className="cursor-pointer"
      />
    </g>
  );
}
