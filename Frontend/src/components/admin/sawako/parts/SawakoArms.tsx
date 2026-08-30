import React from "react";

interface SawakoArmsProps {
  isHovered: boolean;
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoArms - Articulated Anime Chibi Arms with Detailed Cardigan Sleeves & Petite Hands
 * Features:
 * - Realistic cardigan sleeve folds, cuff seams, and fabric shadows
 * - Petite chibi hands with delicate fingers and blushing rosy fingertips
 * - Interactive waving / floating kinematics
 * - Generous click hotspot with `sawako-hands-target`
 */
export function SawakoArms({
  isHovered,
  isDragging,
  hoveredZone,
  onPokeHand,
  setHoveredZone,
}: SawakoArmsProps) {
  // Dynamic arm wave kinematics
  let armTransform = "translate(0, 0)";
  if (isDragging) {
    armTransform = "translate(0, -14px) scale(1.04)";
  } else if (isHovered || hoveredZone === "hand") {
    armTransform = "translate(0, -7px)";
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
      className="cursor-pointer pointer-events-auto group focus:outline-hidden"
      aria-label="Interact with Sawako's hands"
      style={{
        transform: armTransform,
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <defs>
        {/* Sleeve Shading Gradient */}
        <linearGradient id="sleeveGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF5EE" />
          <stop offset="60%" stopColor="#EFE4D6" />
          <stop offset="100%" stopColor="#D9C7B4" />
        </linearGradient>
        <linearGradient id="sleeveGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF5EE" />
          <stop offset="60%" stopColor="#EFE4D6" />
          <stop offset="100%" stopColor="#D9C7B4" />
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
        {/* Left Sleeve Fabric Body with elbow wrinkle */}
        <path
          d="
            M 276 524
            C 246 565, 238 625, 272 670
            C 280 674, 298 672, 308 658
            C 292 615, 296 568, 310 534
            Z
          "
          fill="url(#sleeveGradientLeft)"
          stroke="#C8B6A2"
          strokeWidth={2.2}
        />
        {/* Elbow fabric crease line */}
        <path d="M 252 605 Q 266 612 280 600" stroke="#BAA58E" strokeWidth={1.8} strokeLinecap="round" fill="none" />

        {/* Sleeve Cuff Rim */}
        <path
          d="M 272 670 Q 290 676 308 658 L 306 652 Q 288 670 272 664 Z"
          fill="#FAF4EB"
          stroke="#C2B09C"
          strokeWidth={1.6}
        />

        {/* Petite Chibi Left Hand & Fingers */}
        <g id="left-chibi-hand" transform="translate(290, 664)">
          {/* Palm Base */}
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.4} />
          {/* Thumb */}
          <path d="M 12 4 C 16 5, 17 9, 14 12 C 12 11, 10 7, 12 4 Z" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.2} />
          <ellipse cx="14" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          {/* Fingers definition lines */}
          <path d="M 4 17 Q 6 19 8 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 16 Q 2 18 4 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* Rosy Fingertip Blush */}
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* ===================== RIGHT ARM & HAND ===================== */}
      <g id="right-arm-render">
        {/* Right Sleeve Fabric Body with elbow wrinkle */}
        <path
          d="
            M 460 524
            C 490 565, 498 625, 464 670
            C 456 674, 438 672, 428 658
            C 444 615, 440 568, 426 534
            Z
          "
          fill="url(#sleeveGradientRight)"
          stroke="#C8B6A2"
          strokeWidth={2.2}
        />
        {/* Elbow fabric crease line */}
        <path d="M 484 605 Q 470 612 456 600" stroke="#BAA58E" strokeWidth={1.8} strokeLinecap="round" fill="none" />

        {/* Sleeve Cuff Rim */}
        <path
          d="M 464 670 Q 446 676 428 658 L 430 652 Q 448 670 464 664 Z"
          fill="#FAF4EB"
          stroke="#C2B09C"
          strokeWidth={1.6}
        />

        {/* Petite Chibi Right Hand & Fingers */}
        <g id="right-chibi-hand" transform="translate(434, 664)">
          {/* Palm Base */}
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.4} />
          {/* Thumb */}
          <path d="M 0 4 C -4 5, -5 9, -2 12 C 0 11, 2 7, 0 4 Z" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.2} />
          <ellipse cx="-2" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          {/* Fingers definition lines */}
          <path d="M 6 17 Q 8 19 10 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 10 16 Q 12 18 14 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* Rosy Fingertip Blush */}
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* Invisible broad hotspot over hands for effortless interaction */}
      <rect
        x="230"
        y="520"
        width="276"
        height="190"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Sparkle ring on hover */}
      {hoveredZone === "hand" && (
        <circle
          cx="368"
          cy="640"
          r="66"
          fill="none"
          stroke="#F472B6"
          strokeWidth={3}
          strokeDasharray="6,6"
          className="animate-spin origin-[368px_640px]"
        />
      )}
    </g>
  );
}
