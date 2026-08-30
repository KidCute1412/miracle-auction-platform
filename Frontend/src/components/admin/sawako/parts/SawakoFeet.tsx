import React from "react";

interface SawakoFeetProps {
  isDragging: boolean;
  hoveredZone: "hand" | "foot" | null;
  onPokeFoot?: (e: React.MouseEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoFeet - Articulated Anime Chibi Legs & Glossy Pastel Mary-Jane Shoes
 * Features:
 * - Positioned behind the white skirt so the skirt naturally overlaps the thighs
 * - Detailed anime socks with ribbed cuff folds and ankle ambient shadows
 * - Glossy pastel pink Mary-Jane shoes with toe box shine, mini buckle, and rubber sole
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
    feetTransform = "translate(0, -9px) rotate(-4deg)";
  } else if (hoveredZone === "foot") {
    feetTransform = "translate(0, -11px) rotate(5deg)";
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
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <defs>
        {/* Shoe Gloss Gradient */}
        <linearGradient id="shoeGloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE8F3" />
          <stop offset="40%" stopColor="#FBCFE8" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        {/* Sock Shadow Gradient */}
        <linearGradient id="sockShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Thigh Under-Skirt Shadow */}
        <linearGradient id="thighShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* ===================== CHIBI LEGS & SOCKS ===================== */}
      {/* Starting from Y=760 so thighs extend well behind the skirt hem */}
      <g id="chibi-legs-render">
        {/* Left Leg & Sock */}
        <g id="left-leg">
          {/* Upper Thigh under skirt */}
          <path
            d="M 314 770 L 314 830 L 344 830 L 344 770 Z"
            fill="url(#thighShadow)"
          />
          {/* Sock Body */}
          <path
            d="M 315 830 C 317 870, 318 920, 321 954 L 349 954 C 347 920, 345 870, 343 830 Z"
            fill="url(#sockShadow)"
            stroke="#CBD5E1"
            strokeWidth={1.8}
          />
          {/* Sock Ribbed Cuff Fold at top */}
          <path
            d="M 314 836 Q 329 840 344 836"
            stroke="#94A3B8"
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
          {/* Ankle crease */}
          <path d="M 326 940 Q 335 943 344 940" stroke="#CBD5E1" strokeWidth={1.4} fill="none" />
        </g>

        {/* Right Leg & Sock */}
        <g id="right-leg">
          {/* Upper Thigh under skirt */}
          <path
            d="M 392 770 L 392 830 L 422 830 L 422 770 Z"
            fill="url(#thighShadow)"
          />
          {/* Sock Body */}
          <path
            d="M 393 830 C 391 870, 390 920, 387 954 L 415 954 C 418 920, 420 870, 421 830 Z"
            fill="url(#sockShadow)"
            stroke="#CBD5E1"
            strokeWidth={1.8}
          />
          {/* Sock Ribbed Cuff Fold at top */}
          <path
            d="M 392 836 Q 407 840 422 836"
            stroke="#94A3B8"
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
          {/* Ankle crease */}
          <path d="M 392 940 Q 401 943 410 940" stroke="#CBD5E1" strokeWidth={1.4} fill="none" />
        </g>

        {/* Left Pastel Mary-Jane Chibi Shoe */}
        <g id="left-shoe">
          <ellipse cx="332" cy="964" rx="25" ry="14" fill="url(#shoeGloss)" stroke="#EC4899" strokeWidth={2} />
          <ellipse cx="324" cy="960" rx="9" ry="4.5" fill="#FFFFFF" fillOpacity={0.65} />
          <path d="M 308 968 Q 332 980 356 968" stroke="#64748B" strokeWidth={3.2} fill="none" strokeLinecap="round" />
          <rect x="345" y="966" width="9" height="4.5" rx="1.5" fill="#475569" />
          <path d="M 315 962 Q 332 968 349 962" stroke="#DB2777" strokeWidth={2.4} fill="none" />
          <circle cx="332" cy="964" r="2.8" fill="#FDE047" stroke="#CA8A04" strokeWidth={1} />
          <circle cx="332" cy="964" r="1.2" fill="#FFFFFF" />
        </g>

        {/* Right Pastel Mary-Jane Chibi Shoe */}
        <g id="right-shoe">
          <ellipse cx="404" cy="964" rx="25" ry="14" fill="url(#shoeGloss)" stroke="#EC4899" strokeWidth={2} />
          <ellipse cx="412" cy="960" rx="9" ry="4.5" fill="#FFFFFF" fillOpacity={0.65} />
          <path d="M 380 968 Q 404 980 428 968" stroke="#64748B" strokeWidth={3.2} fill="none" strokeLinecap="round" />
          <rect x="382" y="966" width="9" height="4.5" rx="1.5" fill="#475569" />
          <path d="M 387 962 Q 404 968 421 962" stroke="#DB2777" strokeWidth={2.4} fill="none" />
          <circle cx="404" cy="964" r="2.8" fill="#FDE047" stroke="#CA8A04" strokeWidth={1} />
          <circle cx="404" cy="964" r="1.2" fill="#FFFFFF" />
        </g>
      </g>

      {/* Invisible broad hotspot over feet */}
      <rect
        x="260"
        y="830"
        width="216"
        height="180"
        fill="transparent"
        className="cursor-pointer"
      />

      {/* Feet glow ring on hover */}
      {hoveredZone === "foot" && (
        <ellipse
          cx="368"
          cy="972"
          rx="100"
          ry="34"
          fill="none"
          stroke="#38BDF8"
          strokeWidth={3}
          strokeDasharray="6,6"
          className="animate-pulse"
        />
      )}
    </g>
  );
}
