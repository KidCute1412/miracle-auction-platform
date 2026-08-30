import React from "react";

interface SawakoFeetProps {
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeFoot?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

export function SawakoFeet({
  isDragging,
  hoveredZone,
  onPokeFoot,
  setHoveredZone,
}: SawakoFeetProps) {
  // Independent feet kicking / dangling kinematics
  let feetTransform = "translate(0, 0)";
  if (isDragging) {
    feetTransform = "translate(0, -6px) rotate(-3deg)";
  } else if (hoveredZone === "foot") {
    feetTransform = "translate(0, -10px) rotate(4deg)";
  }

  return (
    <g
      data-testid="sawako-feet-target"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onPokeFoot?.(e);
      }}
      onMouseEnter={() => setHoveredZone("foot")}
      onMouseLeave={() => setHoveredZone(null)}
      className="cursor-pointer pointer-events-auto group focus:outline-hidden"
      aria-label="Interact with Sawako's feet"
      style={{
        transform: feetTransform,
        transition: "transform 0.2s ease-out",
      }}
    >
      <rect
        x="200"
        y="960"
        width="336"
        height="120"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Feet glow ring on hover */}
      {hoveredZone === "foot" && (
        <ellipse
          cx="368"
          cy="1040"
          rx="130"
          ry="38"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={4}
          strokeDasharray="8,6"
          className="animate-pulse"
        />
      )}
    </g>
  );
}
