import React from "react";

interface SawakoFeetProps {
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeFoot?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoFeet - Articulated Chibi Legs & Pastel Mary-Jane Shoes
 * Features:
 * - Cute chibi legs with white socks and pastel pink doll shoes
 * - Independent dangling and kicking kinematics when dragged or hovered
 * - Interactive hotspot with `sawako-feet-target`
 */
export function SawakoFeet({
  isDragging,
  hoveredZone,
  onPokeFoot,
  setHoveredZone,
}: SawakoFeetProps) {
  // Independent feet kicking / dangling kinematics
  let feetTransform = "translate(0, 0)";
  if (isDragging) {
    feetTransform = "translate(0, -8px) rotate(-4deg)";
  } else if (hoveredZone === "foot") {
    feetTransform = "translate(0, -10px) rotate(5deg)";
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
        transformOrigin: "368px 840px",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* ===================== CHIBI LEGS & SOCKS ===================== */}
      <g id="chibi-legs-render">
        {/* Left Leg */}
        <path
          d="M 314 824 C 316 870, 318 920, 322 952 L 348 952 C 346 920, 344 870, 342 824 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={2}
        />
        {/* Right Leg */}
        <path
          d="M 394 824 C 392 870, 390 920, 388 952 L 414 952 C 418 920, 420 870, 422 824 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={2}
        />

        {/* Left Pastel Mary-Jane Chibi Shoe */}
        <g id="left-shoe">
          <ellipse cx="332" cy="964" rx="24" ry="14" fill="#FBCFE8" stroke="#F472B6" strokeWidth={2.5} />
          {/* Shoe sole */}
          <path d="M 310 968 Q 332 978 354 968" stroke="#94A3B8" strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* Strap & mini button */}
          <path d="M 316 962 Q 332 968 348 962" stroke="#F472B6" strokeWidth={2.5} fill="none" />
          <circle cx="332" cy="964" r="2" fill="#FFFFFF" />
        </g>

        {/* Right Pastel Mary-Jane Chibi Shoe */}
        <g id="right-shoe">
          <ellipse cx="404" cy="964" rx="24" ry="14" fill="#FBCFE8" stroke="#F472B6" strokeWidth={2.5} />
          {/* Shoe sole */}
          <path d="M 382 968 Q 404 978 426 968" stroke="#94A3B8" strokeWidth={3} fill="none" strokeLinecap="round" />
          {/* Strap & mini button */}
          <path d="M 388 962 Q 404 968 420 962" stroke="#F472B6" strokeWidth={2.5} fill="none" />
          <circle cx="404" cy="964" r="2" fill="#FFFFFF" />
        </g>
      </g>

      {/* Invisible broad hotspot over feet */}
      <rect
        x="260"
        y="860"
        width="216"
        height="150"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Feet glow ring on hover */}
      {hoveredZone === "foot" && (
        <ellipse
          cx="368"
          cy="970"
          rx="96"
          ry="32"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={3}
          strokeDasharray="6,6"
          className="animate-pulse"
        />
      )}
    </g>
  );
}
