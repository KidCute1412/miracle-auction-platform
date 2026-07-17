import type { ThemeColors } from "../types.ts";

interface ClothesProps {
  themeColors: ThemeColors;
  onBroochClick: (e: React.MouseEvent) => void;
  isWishlistHovered?: boolean;
}

const defaultThemeColors: ThemeColors = {
  suitColor: "#1e293b",
  lapelColor: "#0f172a",
  lapelStroke: "#334155",
  broochFill: "#a78bfa",
  broochGlow: "rgba(167, 139, 250, 0.7)",
  hairHighlightStart: "#a78bfa",
  hairHighlightEnd: "#f472b6"
};

export const Clothes: React.FC<ClothesProps> = ({ themeColors, onBroochClick, isWishlistHovered }) => {
  const colors = themeColors || defaultThemeColors;
  return (
    <g className="transition-all duration-500">
      {/* Continuous Skin Patch (cleavage & neck) */}
      <path d="M 46 58 L 46 69 L 50 75 L 54 69 L 54 58 Z" fill="url(#skinGrad)" />

      {/* Base Blazer Jacket Body */}
      <path 
        d="M 32 76 C 32 82, 35 106, 35 114 L 65 114 C 65 106, 68 82, 68 76 C 68 72, 64 69, 50 69 C 36 69, 32 72, 32 76 Z" 
        fill={colors.suitColor} 
        stroke={colors.lapelColor} 
        strokeWidth="0.5" 
        className="transition-all duration-500"
      />
      
      {/* White inner blouse insert */}
      <path d="M 38 69 L 50 90 L 62 69 Z" fill="url(#shirtGrad)" />
      
      {/* Placket seam line */}
      <path d="M 50 75 L 50 90" stroke="#cbd5e1" strokeWidth="0.6" />
      
      {/* Clean blouse buttons */}
      <circle cx="50" cy="80" r="0.7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.3" />
      <circle cx="50" cy="86" r="0.7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.3" />
      
      {/* Collarbone detail */}
      <path d="M 47 73 C 48 74, 52 74, 53 73" stroke="#fda4af" strokeWidth="0.6" fill="none" opacity="0.6" />

      {/* White blouse collar fold */}
      <path d="M 46 69 L 43 76 L 49.5 75 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />
      <path d="M 54 69 L 57 76 L 50.5 75 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />

      {/* Blazer Lapels */}
      {/* Left Lapel */}
      <path 
        d="M 38 69 Q 43 78 46 84 L 35 114 Z" 
        fill={colors.suitColor} 
        stroke={colors.lapelStroke} 
        strokeWidth="0.5" 
        className="transition-all duration-500"
      />
      {/* Right Lapel */}
      <path 
        d="M 62 69 Q 57 78 54 84 L 65 114 Z" 
        fill={colors.suitColor} 
        stroke={colors.lapelStroke} 
        strokeWidth="0.5" 
        className="transition-all duration-500"
      />

      {/* Subtle V-neck shadow for depth */}
      <path d="M 48 82 L 50 90 L 52 82" stroke="#cbd5e1" strokeWidth="0.4" fill="none" opacity="0.5" />

      {/* Left sleeve & hand */}
      <path 
        d="M 28 76 C 27 82, 29 90, 31 100 L 44 100 L 44 97 C 34 97, 31 91, 32 76 Z" 
        fill={colors.suitColor} 
        stroke={colors.lapelColor} 
        strokeWidth="0.5" 
        className="transition-all duration-500"
      />
      {/* Left sleeve creases */}
      <path d="M 41 97 L 41 100" stroke={colors.lapelStroke} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.8" />
      
      {/* Left hand */}
      <path 
        d="M 44 97 L 51 97 C 52.5 97, 53 98, 53 98.5 C 53 99.2, 52 100, 44 100 Z" 
        fill="url(#skinGrad)" 
        stroke="#fda4af" 
        strokeWidth="0.3" 
      />

      {/* Right sleeve & hand */}
      <path 
        d="M 72 76 C 73 82, 71 90, 69 100 L 56 100 L 56 97 C 66 97, 69 91, 68 76 Z" 
        fill={colors.suitColor} 
        stroke={colors.lapelColor} 
        strokeWidth="0.5" 
        className="transition-all duration-500"
      />
      {/* Right sleeve creases */}
      <path d="M 59 97 L 59 100" stroke={colors.lapelStroke} strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* Right hand */}
      <path 
        d="M 56 97 L 49 97 C 47.5 97, 47 98, 47 98.5 C 47 99.2, 48 100, 56 100 Z" 
        fill="url(#skinGrad)" 
        stroke="#fda4af" 
        strokeWidth="0.3" 
      />

      {/* High-waisted belt line */}
      <rect x="35" y="114" width="30" height="4" fill="#0f172a" rx="0.5" />
      {/* Belt buckle */}
      <rect x="47.5" y="113.5" width="5" height="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" rx="0.5" />
      
      {/* Skirt */}
      <path d="M 35 118 L 65 118 L 65 120 L 35 120 Z" fill="#020617" />

      {/* Interactive Core Brooch (Ghim cài áo đổi màu) */}
      <g 
        className="brooch-interactive relative" 
        onClick={onBroochClick}
      >
        <polygon 
          points="38.2,76.5 40.2,78.5 38.2,80.5 36.2,78.5" 
          fill={colors.broochFill} 
          stroke="#ffffff" 
          strokeWidth="0.4"
          style={{ transition: "all 0.5s" }}
        />
        {/* Facet details */}
        <polygon points="38.2,76.5 38.2,78.5 36.2,78.5" fill="#ffffff" opacity="0.4" />
        <polygon points="38.2,80.5 38.2,78.5 40.2,78.5" fill="#ffffff" opacity="0.3" />
        <circle cx="38.2" cy="78.5" r="0.5" fill="#ffffff" />
        
        {isWishlistHovered && (
          <path
            d="M 38.2 77.3 C 37.2 76.1, 35.7 76.5, 35.7 77.8 C 35.7 79.2, 38.2 81.2, 38.2 81.2 C 38.2 81.2, 40.7 79.2, 40.7 77.8 C 40.7 76.5, 39.2 76.1, 38.2 77.3 Z"
            fill="#f43f5e"
            className="animate-ping"
            style={{
              transformOrigin: "38.2px 78.5px",
            }}
          />
        )}
      </g>
    </g>
  );
};
