import React from "react";

interface SawakoArmsProps {
  isHovered: boolean;
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeHand?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

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
    armTransform = "translate(0, -18px) scale(1.04)";
  } else if (isHovered || hoveredZone === "hand") {
    armTransform = "translate(0, -8px)";
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
      {/* Invisible broad hotspot over hands and chest */}
      <rect
        x="240"
        y="680"
        width="256"
        height="300"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Sparkle ring on hover */}
      {hoveredZone === "hand" && (
        <circle
          cx="368"
          cy="840"
          r="72"
          fill="none"
          stroke="#f472b6"
          strokeWidth={4}
          strokeDasharray="8,6"
          className="animate-spin origin-[368px_840px]"
        />
      )}
    </g>
  );
}
