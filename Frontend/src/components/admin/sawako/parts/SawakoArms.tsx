import React from "react";

interface SawakoArmsProps {
  isHovered: boolean;
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoArms - Articulated Chibi Cardigan Sleeves & Petite Hands
 * Features:
 * - Cardigan bell sleeves with seam cuffs and delicate chibi fingers
 * - Dynamic waving and floating animations on hover/drag
 * - Interactive hotspot with `sawako-hands-target`
 */
export function SawakoArms({
  isHovered,
  isDragging,
  hoveredZone,
  onPokeHand,
  setHoveredZone,
}: SawakoArmsProps) {
  // Independent arm wave kinematics
  let armTransform = "translate(0, 0)";
  if (isDragging) {
    armTransform = "translate(0, -14px) scale(1.03)";
  } else if (isHovered || hoveredZone === "hand") {
    armTransform = "translate(0, -6px)";
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
        transition: "transform 0.2s ease-out",
      }}
    >
      {/* ===================== LEFT ARM & SLEEVE ===================== */}
      <g id="left-arm">
        {/* Cardigan Sleeve */}
        <path
          d="
            M 276 525
            C 250 560, 246 620, 276 665
            L 306 655
            C 290 615, 292 570, 308 535
            Z
          "
          fill="#FAF5EE"
          stroke="#D5C5B2"
          strokeWidth={2.5}
        />
        {/* Sleeve cuff crease */}
        <path d="M 276 665 Q 291 668 306 655" stroke="#CBBBA8" strokeWidth={2} fill="none" />

        {/* Petite Chibi Hand peaking out of sleeve */}
        <ellipse cx="295" cy="672" rx="10" ry="12" fill="#FEE3D4" stroke="#D5C5B2" strokeWidth={1.5} />
        {/* Thumb hint */}
        <circle cx="304" cy="670" r="3.5" fill="#FEE3D4" />
      </g>

      {/* ===================== RIGHT ARM & SLEEVE ===================== */}
      <g id="right-arm">
        {/* Cardigan Sleeve */}
        <path
          d="
            M 460 525
            C 486 560, 490 620, 460 665
            L 430 655
            C 446 615, 444 570, 428 535
            Z
          "
          fill="#FAF5EE"
          stroke="#D5C5B2"
          strokeWidth={2.5}
        />
        {/* Sleeve cuff crease */}
        <path d="M 460 665 Q 445 668 430 655" stroke="#CBBBA8" strokeWidth={2} fill="none" />

        {/* Petite Chibi Hand peaking out of sleeve */}
        <ellipse cx="441" cy="672" rx="10" ry="12" fill="#FEE3D4" stroke="#D5C5B2" strokeWidth={1.5} />
        {/* Thumb hint */}
        <circle cx="432" cy="670" r="3.5" fill="#FEE3D4" />
      </g>

      {/* Invisible broad hotspot over hands and chest for effortless clicking */}
      <rect
        x="235"
        y="530"
        width="266"
        height="180"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Sparkle ring on hover */}
      {hoveredZone === "hand" && (
        <circle
          cx="368"
          cy="640"
          r="64"
          fill="none"
          stroke="#f472b6"
          strokeWidth={3}
          strokeDasharray="6,6"
          className="animate-spin origin-[368px_640px]"
        />
      )}
    </g>
  );
}
