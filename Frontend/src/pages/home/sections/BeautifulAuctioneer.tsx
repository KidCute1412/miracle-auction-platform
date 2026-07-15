import { useState, useEffect } from "react";

// A stunning, beautiful interactive female auctioneer
const BeautifulAuctioneer = ({ isSmiling, containerRef }: { isSmiling: boolean; containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isStriking, setIsStriking] = useState(false);

  // Periodic gavel striking (every 8 seconds)
  useEffect(() => {
    const strikeInterval = setInterval(() => {
      setIsStriking(true);
      setTimeout(() => {
        setIsStriking(false);
      }, 1200); // Animation runs for 1200ms
    }, 8000);

    return () => clearInterval(strikeInterval);
  }, []);


  useEffect(() => {
    let timeoutId: number;

    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);

      const nextBlinkDelay = Math.random() * 3000 + 2000; // 2 to 5 seconds
      timeoutId = window.setTimeout(triggerBlink, nextBlinkDelay);
    };

    const initialDelay = Math.random() * 3000 + 2000;
    timeoutId = window.setTimeout(triggerBlink, initialDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
      targetX = clamp(x, -1, 1) * 2.0;
      targetY = clamp(y, -1, 1) * 1.5;
    };

    const updatePosition = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      
      // Buttery smooth lerp
      currentX += dx * 0.12;
      currentY += dy * 0.12;
      
      setEyeOffset({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef]);

  const mouthPath = isSmiling || isHovered
    ? "M 44.5 57.5 Q 50 63.5 55.5 57.5" 
    : "M 47 59 Q 50 60.5 53 59";

  const eyebrowTranslate = isSmiling || isHovered ? "translateY(-1.5px) rotate(-1deg)" : "translateY(0px)";

  return (
    <div 
      className="relative w-full max-w-[420px] aspect-[4/5] mx-auto flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute w-[220px] h-[220px] bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.03]"
      >
        <defs>
          <style>{`
            .gavel-idle {
              transform: rotate(-20deg);
              transform-origin: 10px 23px;
            }
            .gavel-animate {
              animation: gavelStrike 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
              transform-origin: 10px 23px;
            }
            @keyframes gavelStrike {
              0% { transform: translateY(0px) translateX(0px) rotate(-20deg); }
              40% { transform: translateY(-12px) translateX(4px) rotate(45deg); } /* Fly up-right & tilt right */
              70% { transform: translateY(0px) translateX(0px) rotate(0deg); }     /* Strike down slowly & flat */
              80% { transform: translateY(-1px) translateX(0px) rotate(-5deg); }    /* Gentle bounce */
              90%, 100% { transform: translateY(0px) translateX(0px) rotate(-20deg); } /* Settle back to resting */
            }
            @keyframes burst {
              0%, 65% { transform: scale(0.3); opacity: 0; }
              70% { transform: scale(1.1); opacity: 1; }
              85% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(1.4); opacity: 0; }
            }
            .sparkle-burst {
              animation: burst 1.2s ease-out both;
              transform-origin: 10px 12.5px; /* Center of sound pad top */
            }
          `}</style>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312221" />
            <stop offset="100%" stopColor="#45312f" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="-100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            <animate attributeName="x1" from="-100%" to="100%" dur="4s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0%" to="200%" dur="4s" repeatCount="indefinite" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="100%" stopColor="#fecdd3" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="75%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="irisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="breastGradLeft" cx="40%" cy="92%" r="45%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
          <radialGradient id="breastGradRight" cx="60%" cy="92%" r="45%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
         </defs>

        {/* Golden outline glow wrapping only the character shape */}
        <g className="drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
          {/* Back Hair - Straight long hair */}
        <path 
          d="M 32 44 L 26 115 L 74 115 L 68 44 Z" 
          fill="url(#hairGrad)" 
        />
        {/* Sleek straight side panels */}
        <path 
          d="M 32 44 C 32 44, 28 70, 26 115 L 36 115 C 34 80, 32 44, 32 44 Z" 
          fill="url(#hairGrad)" 
        />
        <path 
          d="M 68 44 C 68 44, 72 70, 74 115 L 64 115 C 66 80, 68 44, 68 44 Z" 
          fill="url(#hairGrad)" 
        />

        {/* White shirt & Blazer Suit (Professional corporate V-neck styling) */}
        <g className="transition-transform duration-300">
          {/* Continuous Skin Patch (Slender neck combined with cleavage, width: x=46 to x=54) */}
          <path d="M 46 58 L 46 69 L 50 75 L 54 69 L 54 58 Z" fill="url(#skinGrad)" />
          {/* Slender neck shadow */}
          <path d="M 46 64 C 47.2 67, 52.8 67, 54 64 C 52.8 68, 47.2 68, 46 64 Z" fill="#fda4af" opacity="0.3" />

          {/* Base Blazer Jacket Body (Slender feminine shoulders aligned to sleeve armpits - lengthened to y=114) */}
          <path d="M 34 84 C 34 90, 35 106, 35 114 L 65 114 C 65 106, 66 90, 66 84 C 66 79, 64 69, 50 69 C 36 69, 34 79, 34 84 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
          
          {/* White inner blouse insert */}
          <path d="M 38 69 L 50 96 L 62 69 Z" fill="url(#shirtGrad)" />
          
          {/* Placket seam line */}
          <path d="M 50 75 L 50 96" stroke="#cbd5e1" strokeWidth="0.6" />
          
          {/* Clean blouse buttons */}
          <circle cx="50" cy="80" r="0.7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.3" />
          <circle cx="50" cy="87" r="0.7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.3" />
          
          {/* Collarbone detail */}
          <path d="M 47 73 C 48 74, 52 74, 53 73" stroke="#fda4af" strokeWidth="0.6" fill="none" opacity="0.6" />

          {/* White blouse collar fold */}
          <path d="M 46 69 L 43 76 L 49.5 75 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />
          <path d="M 54 69 L 57 76 L 50.5 75 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />

          {/* Blazer Lapels (lengthened to match y=114) */}
          {/* Left Lapel */}
          <path d="M 38 69 L 48 88 L 35 114 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
          {/* Right Lapel */}
          <path d="M 62 69 L 52 88 L 65 114 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

          {/* Subtle V-neck shadow for depth */}
          <path d="M 48 88 L 50 96 L 52 88" stroke="#cbd5e1" strokeWidth="0.4" fill="none" opacity="0.5" />

          {/* Slender stacked arms (right hand over left hand resting on the table - closed closer to body) */}
          {/* Left sleeve (resting on table, natural elbow and forearm) */}
          <path 
            d="M 30 84 C 29 90, 31 95, 31 100 L 44 100 L 44 97 C 35 97, 33 91, 34 84 Z" 
            fill="#1e293b" 
            stroke="#0f172a" 
            strokeWidth="0.5" 
          />
          {/* Left sleeve creases */}
          <path d="M 41 97 L 41 100" stroke="#334155" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.8" />
          
          {/* Left hand (resting flat on table) */}
          <path 
            d="M 44 97 L 51 97 C 52.5 97, 53 98, 53 98.5 C 53 99.2, 52 100, 44 100 Z" 
            fill="url(#skinGrad)" 
            stroke="#fda4af" 
            strokeWidth="0.3" 
          />

          {/* Right sleeve (crossing on top of left) */}
          <path 
            d="M 70 84 C 71 90, 69 95, 69 100 L 56 100 L 56 97 C 65 97, 67 91, 66 84 Z" 
            fill="#1e293b" 
            stroke="#0f172a" 
            strokeWidth="0.5" 
          />
          {/* Right sleeve creases */}
          <path d="M 59 97 L 59 100" stroke="#334155" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.8" />

          {/* Right hand (stacked on top of left hand) */}
          <path 
            d="M 56 97 L 49 97 C 47.5 97, 47 98, 47 98.5 C 47 99.2, 48 100, 56 100 Z" 
            fill="url(#skinGrad)" 
            stroke="#fda4af" 
            strokeWidth="0.3" 
          />

          {/* High-waisted pencil skirt belt line */}
          <rect x="35" y="114" width="30" height="4" fill="#0f172a" rx="0.5" />
          {/* Belt buckle */}
          <rect x="47.5" y="113.5" width="5" height="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" rx="0.5" />
          
          {/* Skirt fabric */}
          <path d="M 35 118 L 65 118 L 65 120 L 35 120 Z" fill="#020617" />
        </g>


          {/* Neck & Head */}
          <g className="transition-transform duration-100 ease-out">
          {/* Ears */}
          <path d="M 34 44 C 32 44, 31 50, 34 50 Z" fill="url(#skinGrad)" />
          <path d="M 66 44 C 69 44, 69.5 53, 67 53 Z" fill="url(#skinGrad)" />
          
          {/* Face outline (Slender / hollow jawline shape) */}
          <path d="M 34 44 C 34 54, 40 64, 50 64 C 60 64, 66 54, 66 44 C 66 35, 61 31, 50 31 C 39 31, 34 35, 34 44 Z" fill="url(#skinGrad)" />
          
          {/* Blush / Cheeks (Softer, larger radial blush) */}
          <ellipse cx="37" cy="52" rx="5.5" ry="3.5" fill="url(#blushGrad)" opacity={isSmiling || isHovered ? "1.0" : "0.75"} className="transition-opacity duration-300" />
          <ellipse cx="63" cy="52" rx="5.5" ry="3.5" fill="url(#blushGrad)" opacity={isSmiling || isHovered ? "1.0" : "0.75"} className="transition-opacity duration-300" />
          
          {/* Subtle Nose */}
          <path d="M 49.5 48.5 Q 49 51.5 50 52" stroke="#fca5a5" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="51.5" r="0.4" fill="#ffffff" opacity="0.6" />
          
          {/* Lips / Mouth (Dainty single-line style mouth) */}
          <path d={mouthPath} stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" className="transition-all duration-300" />

        </g>

        {/* Front Hair */}
        <g className="transition-transform duration-100 ease-out">
          {/* Hair Crown (top skull hair) - Prevents baldness */}
          <path d="M 32 44 C 32 20, 68 20, 68 44 Z" fill="url(#hairGrad)" />

          {/* Elegant face-framing front locks (draping over shoulders) */}
          <path d="M 32 44 C 30 54, 28 72, 32 90 C 34 92, 36 90, 35 80 C 32 68, 33 54, 32 44 Z" fill="url(#hairGrad)" />
          <path d="M 68 44 C 70 54, 72 72, 68 90 C 66 92, 64 90, 65 80 C 68 68, 67 54, 68 44 Z" fill="url(#hairGrad)" />
          
          {/* Soft sweeping fringe overlay (Curtain / Parted Bangs style - No blunt dorky fringe) */}
          <path d="M 32 44 C 35 35, 41 33, 47 33 C 48 33, 42 38, 34 44 Z" fill="url(#hairGrad)" />
          <path d="M 68 44 C 65 35, 59 33, 53 33 C 52 33, 58 38, 66 44 Z" fill="url(#hairGrad)" />
          
          {/* Highlight */}
          <path d="M 35 34 Q 50 26 65 34 Q 50 30 35 34 Z" fill="url(#hairHighlight)" opacity="0.4" />
        </g>

        {/* Eyes & Eyebrows rendered on top of Front Hair */}
        <g className="transition-transform duration-100 ease-out">
          {/* Eyebrows (Thinner and softer brown) */}
          <path d="M 36 40.5 Q 41 37.5 45 40.5" stroke="#4a3736" strokeWidth="0.8" fill="none" strokeLinecap="round" style={{ transform: eyebrowTranslate, transformOrigin: '40px 40.5px' }} className="transition-transform duration-200" />
          <path d="M 64 40.5 Q 59 37.5 55 40.5" stroke="#4a3736" strokeWidth="0.8" fill="none" strokeLinecap="round" style={{ transform: eyebrowTranslate, transformOrigin: '60px 40.5px' }} className="transition-transform duration-200" />

          {/* Detailed Eyes with premium makeup eyelashes & random blinking */}
          <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}>
            {isBlinking ? (
              // Left Eye (Closed)
              <g>
                <path d="M 36.5 47 C 38 49.5, 44 49.5, 46.5 47" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                {/* Detailed downward eyelashes */}
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

            {isBlinking ? (
              // Right Eye (Closed)
              <g>
                <path d="M 63.5 47 C 62 49.5, 56 49.5, 53.5 47" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                {/* Detailed downward eyelashes */}
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
        </g>
        </g>

        <g className="transition-transform duration-300">
          <polygon points="5,100 95,100 85,118 15,118" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
          <line x1="5" y1="100" x2="95" y2="100" stroke="url(#goldGrad)" strokeWidth="1.5" />
          <line x1="20" y1="118" x2="20" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <line x1="80" y1="118" x2="80" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <g transform="translate(73, 102) scale(0.85)">
            {/* 3D Elite Wood Podium Base */}
            <path d="M 2 15 C 2 13.5, 18 13.5, 18 15 L 18 18 C 18 19.5, 2 19.5, 2 18 Z" fill="#334155" stroke="#1e293b" strokeWidth="0.4" />
            <ellipse cx="10" cy="15" rx="8" ry="2" fill="url(#goldGrad)" />
            <ellipse cx="10" cy="14" rx="7" ry="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.3" />

            {/* The Ceremonial Mahogany/Gold Hammer itself (head and handle) animate striking */}
            <g className={isStriking ? "gavel-animate" : "gavel-idle"}>
              {/* Hammer Head: Mahogany body with Gold rims/accent */}
              <path d="M 3 6 L 6 7 L 6 12 L 3 13 Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="0.3" />
              <path d="M 17 6 L 14 7 L 14 12 L 17 13 Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="0.3" />
              <rect x="6" y="6.8" width="8" height="5.4" fill="#451a03" stroke="#1e293b" strokeWidth="0.3" rx="0.5" />
              <rect x="9.5" y="6.8" width="1" height="5.4" fill="url(#goldGrad)" />

              {/* Hammer Handle: Mahogany shaft with Gold grip cap */}
              <rect x="9.5" y="12.5" width="1" height="10.5" fill="#451a03" stroke="#1e293b" strokeWidth="0.3" rx="0.2" />
              <rect x="9" y="21" width="2" height="2" fill="url(#goldGrad)" rx="0.2" />
            </g>

            {/* Exploding golden stars (4-point sparkles) on impact */}
            {isStriking && (
              <g className="sparkle-burst">
                {/* Sparkle 1 (top-left) */}
                <path d="M 3 5 L 3.5 6.5 L 5 7 L 3.5 7.5 L 3 9 L 2.5 7.5 L 1 7 L 2.5 6.5 Z" fill="url(#goldGrad)" />
                {/* Sparkle 2 (top-right) */}
                <path d="M 17 5 L 17.5 6.5 L 19 7 L 17.5 7.5 L 17 9 L 16.5 7.5 L 15 7 L 16.5 6.5 Z" fill="url(#goldGrad)" />
                {/* Sparkle 3 (left) */}
                <path d="M -2 10.5 L -1.7 11.5 L -0.5 12 L -1.7 12.5 L -2 13.5 L -2.3 12.5 L -3.5 12 L -2.3 11.5 Z" fill="url(#goldGrad)" />
                {/* Sparkle 4 (right) */}
                <path d="M 22 10.5 L 22.3 11.5 L 23.5 12 L 22.3 12.5 L 22 13.5 L 21.7 12.5 L 20.5 12 L 21.7 11.5 Z" fill="url(#goldGrad)" />
              </g>
            )}
          </g>
        </g>
      </svg>

      <div className={`absolute -top-4 right-2 bg-popover/90 border border-accent/50 text-popover-foreground px-4 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] text-xs font-semibold tracking-wider transition-all duration-300 origin-bottom-left ${
        isSmiling || isHovered ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {isSmiling ? "✨ An outstanding piece! Browse our catalog." : "Welcome to Miracle Auction. Shall we begin? 🔨"}
        <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-popover border-r border-b border-accent/50" />
      </div>
    </div>
  );
};

export default BeautifulAuctioneer;
