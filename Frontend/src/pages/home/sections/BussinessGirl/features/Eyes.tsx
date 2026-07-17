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
        // Left Eye (Closed)
        <g>
          <path d="M 36.5 47 C 38 49.5, 44 49.5, 46.5 47" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 37.5 48 Q 35 49 34 48" stroke="#1e293b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M 39 48.7 Q 37 50.5 36 49.5" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <path d="M 41 49 Q 40 51 39.5 50" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <path d="M 43 48.7 Q 42.5 50.5 42 49.5" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        // Left Eye (Open)
        <g>
          <ellipse cx="41.5" cy="46.5" rx="4.5" ry="3.2" fill="#ffffff" stroke="#1e293b" strokeWidth="0.6" />
          <ellipse cx="41.5" cy="46.5" rx="2.5" ry="2.2" fill="url(#irisGrad)" />
          <circle cx="41.5" cy="46.5" r="1.2" fill="#111827" />
          <circle cx="43" cy="45" r="0.9" fill="#ffffff" />
          <circle cx="40" cy="48" r="0.5" fill="#ffffff" />
          <circle cx="42.5" cy="47.5" r="0.4" fill="#ffffff" opacity="0.8" />
          
          {winkEye === "right" && (
            <path 
              d="M 41.5 45 C 40 43, 38.5 43, 38.5 45 C 38.5 47, 41.5 50, 41.5 50 C 41.5 50, 44.5 47, 44.5 45 C 44.5 43, 43 43, 41.5 45 Z" 
              fill="#f43f5e" 
              className="animate-heart-wink-left"
            />
          )}

          {/* Premium Upper Eyelashes */}
          <path d="M 36.5 46.5 C 38 43.5, 44 43.5, 46.5 45.5" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 37 45.5 Q 34.5 44 33.5 45" stroke="#1e293b" strokeWidth="1.0" fill="none" strokeLinecap="round" />
          <path d="M 38 44.5 Q 36 42.5 35 43.5" stroke="#1e293b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M 40 43.8 Q 39 41.5 38.5 42.2" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          <path d="M 42 43.8 Q 42 41.5 41.5 42" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          <path d="M 44.5 44.2 Q 45.5 42.5 45 42.8" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />

          {/* Premium Lower Eyelashes */}
          <path d="M 39 49.5 Q 38.2 50.2 38 50.1" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
          <path d="M 42 49.7 Q 41.6 50.5 41.5 50.4" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
          <path d="M 44.5 49.2 Q 44.7 49.8 44.8 49.7" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
        </g>
      )}

      {isBlinking || winkEye === "right" ? (
        // Right Eye (Closed)
        <g>
          <path d="M 63.5 47 C 62 49.5, 56 49.5, 53.5 47" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 62.5 48 Q 65 49 66 48" stroke="#1e293b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M 61 48.7 Q 63 50.5 64 49.5" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <path d="M 59 49 Q 60 51 60.5 50" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <path d="M 57 48.7 Q 57.5 50.5 58 49.5" stroke="#1e293b" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        // Right Eye (Open)
        <g>
          <ellipse cx="58.5" cy="46.5" rx="4.5" ry="3.2" fill="#ffffff" stroke="#1e293b" strokeWidth="0.6" />
          <ellipse cx="58.5" cy="46.5" rx="2.5" ry="2.2" fill="url(#irisGrad)" />
          <circle cx="58.5" cy="46.5" r="1.2" fill="#111827" />
          <circle cx="59.7" cy="45" r="0.9" fill="#ffffff" />
          <circle cx="57" cy="48" r="0.5" fill="#ffffff" />
          <circle cx="59.5" cy="47.5" r="0.4" fill="#ffffff" opacity="0.8" />

          {winkEye === "left" && (
            <path 
              d="M 58.5 45 C 57 43, 55.5 43, 55.5 45 C 55.5 47, 58.5 50, 58.5 50 C 58.5 50, 61.5 47, 61.5 45 C 61.5 43, 60 43, 58.5 45 Z" 
              fill="#f43f5e" 
              className="animate-heart-wink-right"
            />
          )}

          {/* Premium Upper Eyelashes */}
          <path d="M 63.5 46.5 C 62 43.5, 56 43.5, 53.5 45.5" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 63 45.5 Q 65.5 44 66.5 45" stroke="#1e293b" strokeWidth="1.0" fill="none" strokeLinecap="round" />
          <path d="M 62 44.5 Q 64 42.5 65 43.5" stroke="#1e293b" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M 60 43.8 Q 61 41.5 61.5 42.2" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          <path d="M 58 43.8 Q 58 41.5 58.5 42" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          <path d="M 55.5 44.2 Q 54.5 42.5 55 42.8" stroke="#1e293b" strokeWidth="0.7" fill="none" strokeLinecap="round" />

          {/* Premium Lower Eyelashes */}
          <path d="M 61 49.5 Q 61.8 50.2 62 50.1" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
          <path d="M 58 49.7 Q 58.4 50.5 58.5 50.4" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
          <path d="M 55.5 49.2 Q 55.3 49.8 55.2 49.7" stroke="#1e293b" strokeWidth="0.5" fill="none" opacity="0.8" />
        </g>
      )}
    </g>
  );
};
