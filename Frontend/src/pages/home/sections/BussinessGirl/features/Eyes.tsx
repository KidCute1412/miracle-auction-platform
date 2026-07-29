import React from "react";

interface EyesProps {
  eyeOffset: { x: number; y: number };
  isBlinking: boolean;
  winkEye: "left" | "right" | null;
}

export const Eyes: React.FC<EyesProps> = ({ eyeOffset, isBlinking, winkEye }) => {
  return (
    <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}>
      {isBlinking || winkEye === "left" ? (
        // Left Eye (Closed - Lush Smiling Arc)
        <g>
          <path 
            d="M 35.8 45.8 Q 41.2 49.2 46.6 45.8" 
            stroke="#1e1028" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round" 
          />
          <path 
            d="M 36.2 45.4 C 35.0 44.6, 34.0 43.6, 33.2 42.6" 
            stroke="#1e1028" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />
        </g>
      ) : (
        // Left Eye (Open - Lush Feminine Eyelash & Midnight Sapphire Eye)
        <g>
          {/* Chibi Sclera - Cute Rounded Almond Contour */}
          <ellipse cx="41.2" cy="45.8" rx="4.8" ry="3.5" fill="#ffffff" />
          
          {/* Upper Lid Soft Shadow */}
          <path 
            d="M 36.4 45.8 C 37.6 43.0, 44.8 43.0, 46.0 45.8 C 44.5 46.8, 37.9 46.8, 36.4 45.8 Z" 
            fill="rgba(15, 23, 42, 0.08)" 
          />

          {/* Delicate Double Eyelid Crease */}
          <path 
            d="M 37.5 42.6 Q 41.2 41.5 44.9 42.6" 
            stroke="#94a3b8" 
            strokeWidth="0.5" 
            fill="none" 
            opacity="0.5" 
            strokeLinecap="round" 
          />

          {/* Midnight Sapphire Blue Iris */}
          <ellipse cx="41.2" cy="45.8" rx="3.0" ry="3.2" fill="url(#disneyBlueIris)" />
          
          {/* Soft Periwinkle Shimmer Glow */}
          <ellipse cx="41.2" cy="46.2" rx="2.4" ry="1.8" fill="url(#disneyGlowRing)" />

          {/* Soft Dark Pupil */}
          <circle cx="41.2" cy="45.8" r="1.3" fill="#0b1329" />

          {/* Glossy Catchlight Dots */}
          <circle cx="42.5" cy="44.4" r="1.15" fill="#ffffff" />
          <circle cx="39.6" cy="47.2" r="0.65" fill="#ffffff" opacity="0.85" />

          {winkEye === "right" && (
            <path 
              d="M 41.2 45 C 40.0 43.2, 38.5 43.2, 38.5 45 C 38.5 46.8, 41.2 49.2, 41.2 49.2 C 41.2 49.2, 43.9 46.8, 43.9 45 C 43.9 43.2, 42.4 43.2, 41.2 45 Z" 
              fill="#f43f5e" 
              className="animate-heart-wink-left"
            />
          )}

          {/* Gorgeous Lush Eyelash Line - Main Arch */}
          <path 
            d="M 35.8 45.8 C 37.2 42.0, 44.8 42.0, 46.6 45.8" 
            stroke="#1e1028" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Outer Lash Wing - Upper Primary Flick */}
          <path 
            d="M 36.2 45.4 C 35.0 44.6, 34.0 43.6, 33.2 42.6" 
            stroke="#1e1028" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Outer Lash Wing - Secondary Accent Lash */}
          <path 
            d="M 36.0 46.0 C 35.0 45.6, 34.2 45.0, 33.5 44.2" 
            stroke="#1e1028" 
            strokeWidth="0.8" 
            fill="none" 
            strokeLinecap="round" 
          />
        </g>
      )}

      {isBlinking || winkEye === "right" ? (
        // Right Eye (Closed - Lush Smiling Arc)
        <g>
          <path 
            d="M 53.6 45.8 Q 58.8 49.2 64.0 45.8" 
            stroke="#1e1028" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round" 
          />
          <path 
            d="M 63.8 45.4 C 65.0 44.6, 66.0 43.6, 66.8 42.6" 
            stroke="#1e1028" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />
        </g>
      ) : (
        // Right Eye (Open - Lush Feminine Eyelash & Midnight Sapphire Eye)
        <g>
          {/* Chibi Sclera - Cute Rounded Almond Contour */}
          <ellipse cx="58.8" cy="45.8" rx="4.8" ry="3.5" fill="#ffffff" />
          
          {/* Upper Lid Soft Shadow */}
          <path 
            d="M 54.0 45.8 C 55.2 43.0, 62.4 43.0, 63.6 45.8 C 62.1 46.8, 55.5 46.8, 54.0 45.8 Z" 
            fill="rgba(15, 23, 42, 0.08)" 
          />

          {/* Delicate Double Eyelid Crease */}
          <path 
            d="M 55.1 42.6 Q 58.8 41.5 62.5 42.6" 
            stroke="#94a3b8" 
            strokeWidth="0.5" 
            fill="none" 
            opacity="0.5" 
            strokeLinecap="round" 
          />

          {/* Midnight Sapphire Blue Iris */}
          <ellipse cx="58.8" cy="45.8" rx="3.0" ry="3.2" fill="url(#disneyBlueIris)" />
          
          {/* Soft Periwinkle Shimmer Glow */}
          <ellipse cx="58.8" cy="46.2" rx="2.4" ry="1.8" fill="url(#disneyGlowRing)" />

          {/* Soft Dark Pupil */}
          <circle cx="58.8" cy="45.8" r="1.3" fill="#0b1329" />

          {/* Glossy Catchlight Dots */}
          <circle cx="60.1" cy="44.4" r="1.15" fill="#ffffff" />
          <circle cx="57.2" cy="47.2" r="0.65" fill="#ffffff" opacity="0.85" />

          {winkEye === "left" && (
            <path 
              d="M 58.8 45 C 57.6 43.2, 56.1 43.2, 56.1 45 C 56.1 46.8, 58.8 49.2, 58.8 49.2 C 58.8 49.2, 61.5 46.8, 61.5 45 C 61.5 43.2, 60.0 43.2, 58.8 45 Z" 
              fill="#f43f5e" 
              className="animate-heart-wink-right"
            />
          )}

          {/* Gorgeous Lush Eyelash Line - Main Arch */}
          <path 
            d="M 53.4 45.8 C 55.2 42.0, 62.8 42.0, 64.2 45.8" 
            stroke="#1e1028" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Outer Lash Wing - Upper Primary Flick */}
          <path 
            d="M 63.8 45.4 C 65.0 44.6, 66.0 43.6, 66.8 42.6" 
            stroke="#1e1028" 
            strokeWidth="1.2" 
            fill="none" 
            strokeLinecap="round" 
          />

          {/* Outer Lash Wing - Secondary Accent Lash */}
          <path 
            d="M 64.0 46.0 C 65.0 45.6, 65.8 45.0, 66.5 44.2" 
            stroke="#1e1028" 
            strokeWidth="0.8" 
            fill="none" 
            strokeLinecap="round" 
          />
        </g>
      )}
    </g>
  );
};
