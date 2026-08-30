import React from "react";

interface SawakoArmsProps {
  isHovered: boolean;
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoArms - Soft, Natural Relaxed Chibi Arms with Breathing Room
 * Features:
 * - Elbows curve gently away from the waist, eliminating stiffness and tightness against the torso
 * - Loose cardigan sleeves draping naturally forward
 * - Delicate petite hands cupped softly in front of the skirt with blushing fingertips
 * - Smooth waving and breathing motion on hover / drag
 * - Interactive hotspot with `sawako-hands-target`
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

      {/* ===================== LEFT ARM & RELAXED HAND ===================== */}
      {/* Elbow sweeps outward to create distinct breathing space between arm and torso */}
      <g id="left-arm-render">
        {/* Left Sleeve Fabric: Outward curve at elbow, soft draping cuff */}
        <path
          d="
            M 276 524
            C 240 560, 232 620, 268 672
            C 278 678, 296 676, 308 660
            C 288 618, 288 565, 308 532
            Z
          "
          fill="url(#sleeveGradientLeft)"
          stroke="#C8B6A2"
          strokeWidth={2.2}
        />
        {/* Natural elbow fold crease line */}
        <path d="M 246 605 Q 262 615 278 604" stroke="#BAA58E" strokeWidth={1.8} strokeLinecap="round" fill="none" />

        {/* Soft Sleeve Cuff Rim */}
        <path
          d="M 268 672 Q 288 680 308 660 L 306 654 Q 286 674 268 666 Z"
          fill="#FAF4EB"
          stroke="#C2B09C"
          strokeWidth={1.6}
        />

        {/* Petite Chibi Left Hand resting cupped in front of skirt */}
        <g id="left-chibi-hand" transform="translate(294, 666)">
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.4} />
          {/* Thumb */}
          <path d="M 12 4 C 16 5, 17 9, 14 12 C 12 11, 10 7, 12 4 Z" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.2} />
          <ellipse cx="14" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          {/* Fingers separation */}
          <path d="M 4 17 Q 6 19 8 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 16 Q 2 18 4 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* ===================== RIGHT ARM & RELAXED HAND ===================== */}
      {/* Elbow sweeps outward to create distinct breathing space between arm and torso */}
      <g id="right-arm-render">
        {/* Right Sleeve Fabric: Outward curve at elbow, soft draping cuff */}
        <path
          d="
            M 460 524
            C 496 560, 504 620, 468 672
            C 458 678, 440 676, 428 660
            C 448 618, 448 565, 428 532
            Z
          "
          fill="url(#sleeveGradientRight)"
          stroke="#C8B6A2"
          strokeWidth={2.2}
        />
        {/* Natural elbow fold crease line */}
        <path d="M 490 605 Q 474 615 458 604" stroke="#BAA58E" strokeWidth={1.8} strokeLinecap="round" fill="none" />

        {/* Soft Sleeve Cuff Rim */}
        <path
          d="M 468 672 Q 448 680 428 660 L 430 654 Q 450 674 468 666 Z"
          fill="#FAF4EB"
          stroke="#C2B09C"
          strokeWidth={1.6}
        />

        {/* Petite Chibi Right Hand resting cupped in front of skirt */}
        <g id="right-chibi-hand" transform="translate(430, 666)">
          <ellipse cx="6" cy="8" rx="9" ry="11" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.4} />
          {/* Thumb */}
          <path d="M 0 4 C -4 5, -5 9, -2 12 C 0 11, 2 7, 0 4 Z" fill="#FEE3D4" stroke="#C8B6A2" strokeWidth={1.2} />
          <ellipse cx="-2" cy="8" rx="2.5" ry="2.5" fill="url(#fingerBlush)" />
          {/* Fingers separation */}
          <path d="M 6 17 Q 8 19 10 17" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 10 16 Q 12 18 14 16" stroke="#DDBEA8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="14" rx="4.5" ry="3" fill="url(#fingerBlush)" />
        </g>
      </g>

      {/* Invisible broad hotspot over hands for effortless interaction */}
      <rect
        x="220"
        y="520"
        width="296"
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
