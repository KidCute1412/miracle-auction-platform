import React from "react";

interface HeadAndHairProps {
  isSmiling: boolean;
  isHovered: boolean;
  isCheeksHovered: boolean;
  isWishlistHovered?: boolean;
  handleCheekHover: (e: React.MouseEvent) => void;
  handleCheekLeave: (e: React.MouseEvent) => void;
  mouthPath: string;
  eyebrowTranslate: string;
}

export const HeadAndHair: React.FC<HeadAndHairProps> = ({
  isSmiling,
  isHovered,
  isCheeksHovered,
  isWishlistHovered,
  handleCheekHover,
  handleCheekLeave,
  mouthPath,
  eyebrowTranslate,
}) => {
  return (
    <>
      {/* Gathered back hair (scalp back) */}
      <path 
        d="M 34 44 C 34 53, 38 57, 50 57 C 62 57, 66 53, 66 44 Z" 
        fill="url(#hairGrad)" 
      />

      {/* Minimalist Chinese Hairpin (Trâm cài tóc Trung Hoa) - Rendered behind the bun */}
      <g>
        {/* Main gold stick - thin and simple */}
        <line 
          x1="76" y1="45" 
          x2="56" y2="59" 
          stroke="#e2b83b" 
          strokeWidth="0.5" 
          strokeLinecap="round" 
        />
        {/* Sleek gold head ring ornament */}
        <circle cx="76.5" cy="44.5" r="1.0" fill="none" stroke="#e2b83b" strokeWidth="0.4" />
        {/* Tiny white pearl gem */}
        <circle cx="76.5" cy="44.5" r="0.4" fill="#ffffff" />
        {/* Gold cap tip */}
        <path d="M 75.8 43.5 L 77.2 43.5 L 76.5 44.5 Z" fill="#e2b83b" />
        {/* Thin tassel line */}
        <line x1="76.5" y1="45.5" x2="76.5" y2="50" stroke="#e2b83b" strokeWidth="0.2" />
        {/* Elegant tiny ruby gemstone droplet */}
        <path 
          d="M 76.5 50 Q 75.9 51.2 76.5 52 Q 77.1 51.2 76.5 50 Z" 
          fill="#f43f5e" 
        />
      </g>

      {/* Side Bun */}
      <g>
        <path 
          d="M 62 47 C 69 43, 75 49, 74 56 C 73 62, 66 63, 61 57 Z" 
          fill="url(#hairGrad)" 
          stroke="#261a19" 
          strokeWidth="0.5" 
        />
        <path 
          d="M 64 50 C 68 48, 70 51, 70 54" 
          fill="none" 
          stroke="#45312f" 
          strokeWidth="0.6" 
        />
        <path 
          d="M 63 53 C 67 52, 68 55, 66 57" 
          fill="none" 
          stroke="#45312f" 
          strokeWidth="0.6" 
        />
        <path 
          d="M 72 53 Q 75 52 73 50" 
          fill="none" 
          stroke="url(#hairGrad)" 
          strokeWidth="0.8" 
          strokeLinecap="round" 
        />
        <path 
          d="M 71 55 Q 74 55 73 53" 
          fill="none" 
          stroke="url(#hairGrad)" 
          strokeWidth="0.6" 
          strokeLinecap="round" 
        />
      </g>

      {/* Neck, ears, face, mouth, cheeks */}
      <g className="transition-transform duration-100 ease-out">
        {/* Ears */}
        <path d="M 34 44 C 31 44, 30.5 53, 33 53 Z" fill="url(#skinGrad)" />
        <path d="M 66 44 C 69 44, 69.5 53, 67 53 Z" fill="url(#skinGrad)" />
        
        {/* Face outline */}
        <path d="M 34 44 C 34 54, 40 64, 50 64 C 60 64, 66 54, 66 44 C 66 35, 61 31, 50 31 C 39 31, 34 35, 34 44 Z" fill="url(#skinGrad)" />
        
        {/* Blush / Cheeks */}
        <g 
          onMouseEnter={handleCheekHover}
          onMouseLeave={handleCheekLeave}
          className="cursor-pointer"
        >
          <ellipse cx="37" cy="52" rx="5.5" ry="3.5" fill={(isCheeksHovered || isWishlistHovered) ? "url(#blushStrongGrad)" : "url(#blushGrad)"} opacity={(isCheeksHovered || isWishlistHovered) ? 1.0 : (isSmiling || isHovered ? 0.8 : 0.55)} className="transition-all duration-300" />
          <ellipse cx="63" cy="52" rx="5.5" ry="3.5" fill={(isCheeksHovered || isWishlistHovered) ? "url(#blushStrongGrad)" : "url(#blushGrad)"} opacity={(isCheeksHovered || isWishlistHovered) ? 1.0 : (isSmiling || isHovered ? 0.8 : 0.55)} className="transition-all duration-300" />
        </g>

        {/* Floating hearts tickle effect */}
        {isCheeksHovered && (
          <g className="animate-heart-float">
            <path d="M 28 32 C 26 30, 24 30, 24 32 C 24 34, 28 37, 28 37 C 28 37, 32 34, 32 32 C 32 30, 30 30, 28 32 Z" fill="#f43f5e" />
            <path d="M 72 32 C 70 30, 68 30, 68 32 C 68 34, 72 37, 72 37 C 72 37, 76 34, 76 32 C 76 30, 74 30, 72 32 Z" fill="#f43f5e" />
          </g>
        )}
        
        {/* Subtle Nose */}
        <path d="M 49.5 48.5 Q 49 51.5 50 52" stroke="#fca5a5" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="51.5" r="0.4" fill="#ffffff" opacity="0.6" />
        
        {/* Lips / Mouth */}
        <path d={mouthPath} stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" className="transition-all duration-300" />
      </g>

      {/* Front Hair */}
      <g className="transition-transform duration-100 ease-out">
        {/* Hair Crown */}
        <path d="M 32 44 C 32 20, 68 20, 68 44 C 58 37, 42 37, 32 44 Z" fill="url(#hairGrad)" />

        {/* Elegant face-framing front locks */}
        <path 
          d="M 33 43 C 30 48, 30 54, 32.5 58 C 32.8 59, 32.2 59.2, 31.8 58.5 C 29.5 54, 29.2 48, 33 43 Z" 
          fill="url(#hairGrad)" 
        />
        <path 
          d="M 67 43 C 70 48, 70 54, 67.5 58 C 67.2 59, 67.8 59.2, 68.2 58.5 C 70.5 54, 70.8 48, 67 43 Z" 
          fill="url(#hairGrad)" 
        />
        
        {/* Front bangs */}
        <g>
          <path 
            d="M 32 44 C 34 38, 38 34, 46 34 C 47 34, 46.5 36, 45 38 C 44 40, 44 44, 43 45 C 42 46, 41 42, 40 40 C 39.5 40, 39 43, 38 44 C 37 45, 34 42, 32 44 Z" 
            fill="url(#hairGrad)" 
          />
          <path 
            d="M 68 44 C 66 38, 62 34, 48 34 C 47 34, 47.5 36, 49 38 C 50 40, 50 44, 51 45 C 52 46, 53 42, 54 40 C 54.5 40, 55 43, 56 44 C 57 45, 60 42, 62 43 C 64 43, 66 42, 68 44 Z" 
            fill="url(#hairGrad)" 
          />
          <path 
            d="M 47 34 Q 48 40 47 43 Q 46 40 47 34 Z" 
            fill="url(#hairGrad)" 
          />
          <path d="M 42 37 Q 43 41 42 44" fill="none" stroke="#45312f" strokeWidth="0.4" opacity="0.6" strokeLinecap="round" />
          <path d="M 52 37 Q 51 41 52 44" fill="none" stroke="#45312f" strokeWidth="0.4" opacity="0.6" strokeLinecap="round" />
        </g>
        
        {/* Highlight */}
        <path d="M 35 34 Q 50 26 65 34 Q 50 30 35 34 Z" fill="url(#hairHighlight)" opacity="0.4" />
      </g>

      {/* Eyebrows */}
      <g className="transition-transform duration-100 ease-out">
        <path d="M 36 40.5 Q 41 37.5 45 40.5" stroke="#4a3736" strokeWidth="0.8" fill="none" strokeLinecap="round" style={{ transform: eyebrowTranslate, transformOrigin: '40px 40.5px' }} className="transition-transform duration-200" />
        <path d="M 64 40.5 Q 59 37.5 55 40.5" stroke="#4a3736" strokeWidth="0.8" fill="none" strokeLinecap="round" style={{ transform: eyebrowTranslate, transformOrigin: '60px 40.5px' }} className="transition-transform duration-200" />
      </g>
    </>
  );
};
