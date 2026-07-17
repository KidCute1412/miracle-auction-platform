import React, { useState, useEffect, useRef } from "react";
import { Defs } from "./features/Defs";
import { HeadAndHair } from "./features/HeadAndHair";
import { Clothes } from "./features/Clothes";
import { Eyes } from "./features/Eyes";
import { GavelPodium } from "./features/GavelPodium";
import { OUTFIT_THEMES } from "./types.ts";
import type { OutfitTheme, ThemeColors } from "./types.ts";

import { useDarkMode } from "./hooks/useDarkMode";
import { useBlinking } from "./hooks/useBlinking";
import { useIdleGlance } from "./hooks/useIdleGlance";
import { useEyeTracking } from "./hooks/useEyeTracking";
import { useDialogues, dialogues } from "./hooks/useDialogues";
import { useGavelCharge } from "./hooks/useGavelCharge";

const defaultThemeColors: ThemeColors = {
  suitColor: "#1e293b",
  lapelColor: "#0f172a",
  lapelStroke: "#334155",
  broochFill: "#a78bfa",
  broochGlow: "rgba(167, 139, 250, 0.7)",
  hairHighlightStart: "#a78bfa",
  hairHighlightEnd: "#f472b6"
};

interface FloatingParticle {
  id: number;
  type: "heart" | "sparkle";
  x: number;
  y: number;
  scale: number;
}

const BussinessGirl = ({ isSmiling, containerRef }: { isSmiling: boolean; containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const isDark = useDarkMode();
  const isBlinking = useBlinking();

  const [isHovered, setIsHovered] = useState(false);
  const [isCheeksHovered, setIsCheeksHovered] = useState(false);
  const [winkEye, setWinkEye] = useState<"left" | "right" | null>(null);
  const [outfitTheme, setOutfitTheme] = useState<OutfitTheme>("obsidian");
  const [isAppearing, setIsAppearing] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);

  const {
    bubbleText: currentBubbleText,
    setBubbleText,
    isAutoShowing: isCurrentAutoShowing
  } = useDialogues(isSmiling, isHovered, isCheeksHovered, winkEye, isCharging);

  const {
    chargeProgress,
    isScreenShaking,
    isStriking,
    isRippling,
    handleGavelMouseDown,
    handleGavelMouseUp,
    handleGavelMouseLeave
  } = useGavelCharge(isSmiling, dialogues, setBubbleText, isCharging, setIsCharging);

  // Hologram materialize auto-timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppearing(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const winkTimeoutRef = useRef<any>(null);

  // Listen to custom Navbar hover events
  useEffect(() => {
    const handleNavbarHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      const { action } = customEvent.detail;

      if (action === "signup") {
        setBubbleText("Ready to join our elite club? Sign up now! =))");
        setIsHovered(true);
      } else if (action === "signin") {
        setBubbleText("Welcome back! Ready to secure your next masterpiece? ^^");
        setIsHovered(true);
      } else if (action === "profile") {
        setBubbleText("Always at your service! Let's review your active bids. :D");
        setIsHovered(true);
      } else if (action === "heart") {
        setBubbleText("Adding to your favorites? Excellent choice! =))");
        setIsHovered(true);
        setIsWishlistHovered(true);

        if (winkTimeoutRef.current) {
          clearTimeout(winkTimeoutRef.current);
        }
        winkTimeoutRef.current = setTimeout(() => {
          setIsWishlistHovered(false);
        }, 3000);
      } else if (action === "plus") {
        setBubbleText("Ready to showcase a masterpiece listing? Can't wait! xD");
        setIsHovered(true);
        setWinkEye("right");

        // Spawn sparkle particles
        const newParticles: FloatingParticle[] = Array.from({ length: 8 }).map((_, idx) => ({
          id: Date.now() + idx,
          type: "sparkle",
          x: 20 + Math.random() * 60,
          y: 40 + Math.random() * 40,
          scale: 0.6 + Math.random() * 0.7
        }));
        setParticles(prev => [...prev, ...newParticles]);

        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1500);
      } else if (action === "leave") {
        setIsHovered(false);
        setIsWishlistHovered(false);
        setWinkEye(null);
        setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
      }
    };

    window.addEventListener("miracle:navbar-hover", handleNavbarHover);
    return () => {
      window.removeEventListener("miracle:navbar-hover", handleNavbarHover);
      if (winkTimeoutRef.current) {
        clearTimeout(winkTimeoutRef.current);
      }
    };
  }, [isSmiling, setBubbleText]);

  const { idleMouth, idleEyeOffset, isGlancingRef } = useIdleGlance(isHovered, isCheeksHovered, winkEye);
  const eyeOffset = useEyeTracking(containerRef, idleEyeOffset, isGlancingRef);

  const themeColors = OUTFIT_THEMES?.[outfitTheme] || defaultThemeColors;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!winkEye && !isCheeksHovered && !isCharging) {
      const rand = Math.floor(Math.random() * 5);
      setBubbleText(dialogues[rand]);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsCheeksHovered(false);
    setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
  };

  const handleCharacterClick = () => {
    if (winkEye || isCharging) return;
    const randomEye = Math.random() < 0.5 ? "left" : "right";
    setWinkEye(randomEye);
    setBubbleText(dialogues[5]);
    setTimeout(() => {
      setWinkEye(null);
      setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
    }, 1800);
  };

  const handleCheekHover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCheeksHovered(true);
    setBubbleText(dialogues[6]);
  };

  const handleCheekLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCheeksHovered(false);
    setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
  };

  const handleBroochClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOutfitTheme((prev) => {
      if (prev === "obsidian") return "champagne";
      if (prev === "champagne") return "sapphire";
      return "obsidian";
    });
    setBubbleText("Outfit styled! Fits the prestige of the floor ✨");
  };

  const mouthPath = idleMouth
    ? idleMouth
    : (isSmiling || isHovered
      ? "M 44.5 57.5 Q 50 63.5 55.5 57.5"
      : "M 47 59 Q 50 60.5 53 59");

  const eyebrowTranslate = isSmiling || isHovered ? "translateY(-1.5px) rotate(-1deg)" : "translateY(0px)";

  return (
    <div
      className={`relative w-full max-w-[420px] aspect-[4/5] mx-auto flex items-center justify-center select-none cursor-pointer ${isAppearing ? "holo-container" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCharacterClick}
    >
      <svg
        viewBox="0 0 100 120"
        className={`w-full h-full transition-transform duration-500 ${
          isScreenShaking ? "animate-svg-shake" : ""
        } ${isDark ? "drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]"}`}
      >
        <Defs isDark={isDark} themeColors={themeColors} />

        <g className={isAppearing ? "holo-character-boot" : ""} mask={isAppearing ? "url(#revealMask)" : undefined}>
          <g style={{
            filter: isDark
              ? "drop-shadow(0 0 1px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 2px rgba(253, 224, 71, 0.9)) drop-shadow(0 0 4px rgba(245, 158, 11, 0.85))"
              : "drop-shadow(0 0 1px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 2px rgba(244, 114, 182, 0.9)) drop-shadow(0 0 4px rgba(236, 72, 153, 0.85))"
          }}>
            <Clothes
              themeColors={themeColors}
              onBroochClick={handleBroochClick}
              isWishlistHovered={isWishlistHovered}
            />
            <HeadAndHair
              isSmiling={isSmiling}
              isHovered={isHovered}
              isCheeksHovered={isCheeksHovered}
              isWishlistHovered={isWishlistHovered}
              handleCheekHover={handleCheekHover}
              handleCheekLeave={handleCheekLeave}
              mouthPath={mouthPath}
              eyebrowTranslate={eyebrowTranslate}
            />
            <Eyes
              eyeOffset={eyeOffset}
              isBlinking={isBlinking}
              winkEye={winkEye}
            />
          </g>

          {isAppearing && (
            <rect
              x="0"
              y="-15"
              width="100"
              height="35"
              fill="url(#lightRayGrad)"
              clipPath="url(#characterClip)"
              filter="url(#holoRefraction)"
              className="light-ray-sweep pointer-events-none"
            />
          )}
        </g>

        {isAppearing && (
          <g fill="none" stroke="#22d3ee" strokeWidth="0.8" filter="url(#laserGlow)" mask="url(#wireframeMask)" opacity="0.85" className="pointer-events-none">
            <path d="M 34 44 C 34 53, 38 57, 50 57 C 62 57, 66 53, 66 44 Z" />
            <path d="M 62 47 C 69 43, 75 49, 74 56 C 73 62, 66 63, 61 57 Z" />
            <path d="M 32 76 C 32 82, 35 106, 35 114 L 65 114 C 65 106, 68 82, 68 76 C 68 72, 64 69, 50 69 C 36 69, 32 72, 32 76 Z" />
            <path d="M 34 44 C 34 54, 40 64, 50 64 C 60 64, 66 54, 66 44 C 66 35, 61 31, 50 31 C 39 31, 34 35, 34 44 Z" />
            <path d="M 28 76 C 27 82, 29 90, 31 100 L 44 100 L 44 97 C 34 97, 31 91, 32 76 Z" />
            <path d="M 44 97 L 51 97 C 52.5 97, 53 98, 53 98.5 C 53 99.2, 52 100, 44 100 Z" />
            <path d="M 72 76 C 73 82, 71 90, 69 100 L 56 100 L 56 97 C 66 97, 69 91, 68 76 Z" />
            <path d="M 56 97 L 49 97 C 47.5 97, 47 98, 47 98.5 C 47 99.2, 48 100, 56 100 Z" />
          </g>
        )}

        <GavelPodium
          isStriking={isStriking}
          isRippling={isRippling}
          isCharging={isCharging}
          chargeProgress={chargeProgress}
          onGavelMouseDown={handleGavelMouseDown}
          onGavelMouseUp={handleGavelMouseUp}
          onGavelMouseLeave={handleGavelMouseLeave}
        />

        {isAppearing && (
          <g className="holo-scanline-bar pointer-events-none">
            <rect x="0" y="-10" width="100" height="10" fill="url(#scanTrail)" />
            <line x1="0" y1="0" x2="100" y2="0" stroke="#22d3ee" strokeWidth="0.8" filter="url(#laserGlow)" />
            <circle cx="15" cy="0" r="1.2" fill="#22d3ee" filter="url(#laserGlow)" opacity="0.8" />
            <circle cx="85" cy="0" r="1.2" fill="#22d3ee" filter="url(#laserGlow)" opacity="0.8" />
          </g>
        )}
      </svg>

      <div className={`absolute top-2 right-2 bg-popover/90 border border-accent/50 text-popover-foreground px-4 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] text-xs font-semibold tracking-wider transition-all duration-300 origin-bottom-left ${
        isSmiling || isHovered || !!winkEye || isCheeksHovered || isCurrentAutoShowing || isCharging ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-2 pointer-events-none"
      }`}>
        {currentBubbleText}
        <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-popover border-r border-b border-accent/50" />
      </div>

      {/* Floating Particles for Navbar Interaction */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute animate-float-particle"
            style={{
              left: `${p.x}%`,
              bottom: `${p.y}%`,
              transform: `scale(${p.scale})`,
            }}
          >
            {p.type === "heart" ? (
              <span className="text-red-500 text-xl drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">❤️</span>
            ) : (
              <span className="text-yellow-400 text-xl drop-shadow-[0_0_8px_rgba(234,179,8,0.7)]">✨</span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUpParticle {
          0% {
            transform: translateY(0) scale(0.3) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(-130px) scale(1.4) rotate(15deg);
            opacity: 0;
          }
        }
        .animate-float-particle {
          animation: floatUpParticle 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default BussinessGirl;
