import React, { useState } from "react";
import type { SawakoSvgProps, SawakoExpression } from "./types";
import { useSawakoPhysics } from "./hooks/useSawakoPhysics";
import { useSawakoLipSync } from "./hooks/useSawakoLipSync";
import { SawakoBaseArtwork } from "./parts/SawakoBaseArtwork";
import { SawakoEyes } from "./parts/SawakoEyes";
import { SawakoMouth } from "./parts/SawakoMouth";
import { SawakoHairFront } from "./parts/SawakoHairFront";
import { SawakoArms } from "./parts/SawakoArms";
import { SawakoFeet } from "./parts/SawakoFeet";
import { SawakoWisps } from "./parts/SawakoWisps";

/**
 * SawakoSvg - Authentic Full-Body Chibi Mascot Vector Puppet
 * Features:
 * - Scaled down to 80% for ideal desktop/dashboard footprint
 * - Proper SVG Z-index layering: legs rendered behind pure white dress
 * - Dynamic airborne flailing / dangling kinematics when dragged
 * - Shy expression on drag (no dizzy spinning eyes)
 * - Soft idle bobbing, shy flailing limbs on hover, and serene anime expression
 */
export default function SawakoSvg({
  expression,
  symbol,
  eyeOffset,
  isHovered,
  isDragging,
  isSpeaking = false,
  scaleX = 1,
  scaleY = 1,
  onPokeHand,
  onPokeFoot,
}: SawakoSvgProps) {
  const [hoveredZone, setHoveredZone] = useState<"hand" | "foot" | null>(null);

  // Independent physical kinematics & lip-sync hooks
  const { pupilX, pupilY, headRotate, isBlinking } = useSawakoPhysics(
    eyeOffset,
    isHovered,
    isDragging
  );
  const { mouthOpenRatio } = useSawakoLipSync(isSpeaking);

  // Gaurantee shy expression during drag instead of dizzy spinning eyes
  const activeExpression: SawakoExpression =
    isDragging && expression !== "dizzy" ? "shy" : expression;

  // Overall scale scaled down to 80% size for refined mascot presence
  const finalScaleX = scaleX * 0.82;
  const finalScaleY = scaleY * 0.82;

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${finalScaleX}, ${finalScaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <style>{`
        @keyframes chibiBobbing {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes hitodamaWisp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-12px) scale(1.15); opacity: 0.95; }
        }
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes shyArmsFlutter {
          0%, 100% { transform: translateY(-7px) rotate(-3deg); }
          50% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes shyFeetFlutter {
          0%, 100% { transform: translateY(-8px) rotate(4deg); }
          50% { transform: translateY(-11px) rotate(-4deg); }
        }
        @keyframes airborneArmsFlail {
          0% { transform: translate(0, -6px) rotate(-5deg); }
          50% { transform: translate(0, -12px) rotate(5deg); }
          100% { transform: translate(0, -6px) rotate(-5deg); }
        }
        @keyframes airborneFeetDangle {
          0% { transform: translate(0, -6px) rotate(6deg); }
          25% { transform: translate(2px, -10px) rotate(0deg); }
          50% { transform: translate(0, -6px) rotate(-6deg); }
          75% { transform: translate(-2px, -10px) rotate(0deg); }
          100% { transform: translate(0, -6px) rotate(6deg); }
        }
        @keyframes airborneHairFlutter {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-40 h-68 sm:w-44 sm:h-76 transition-all duration-300 ${
          isDragging
            ? "translate-y-[-10px] scale-105"
            : "animate-[chibiBobbing_3.2s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 736 1104"
          className={`w-full h-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.32)] overflow-visible transition-all duration-200 ${
            isHovered
              ? "brightness-105 drop-shadow-[0_18px_32px_rgba(251,207,232,0.45)]"
              : ""
          }`}
          role="img"
          aria-label="Sawako Anime Mascot"
        >
          <defs>
            {/* Ethereal Ground Mist Shadow */}
            <radialGradient id="sawakoGroundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbcfe8" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* Ethereal Ground Mist directly under chibi feet */}
          <ellipse cx="368" cy="1010" rx="180" ry="20" fill="url(#sawakoGroundMist)" />
          <ellipse cx="368" cy="1012" rx="110" ry="11" fill="#fce7f3" fillOpacity={0.35} />

          {/* ===================== LAYER 1: ARTICULATED LEGS & SHOES (BEHIND WHITE DRESS) ===================== */}
          <SawakoFeet
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeFoot={onPokeFoot}
            setHoveredZone={setHoveredZone}
          />

          {/* ===================== LAYER 2: HEAD & UPPER BODY WITH ROTATION ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "368px 486px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* 1. Base Artwork: Back hair, neck, oval face, pure white one-piece dress (overlapping legs) */}
            <SawakoBaseArtwork expression={activeExpression} />

            {/* 2. Independent Eyes (Tracking pupils, eyelid blinking, 4 lower lashes, shy gaze when dragging) */}
            <SawakoEyes
              expression={activeExpression}
              pupilX={pupilX}
              pupilY={pupilY}
              isBlinking={isBlinking}
            />

            {/* 3. Independent Mouth (Innocent parted anime mouth without robotic flapping) */}
            <SawakoMouth
              expression={activeExpression}
              mouthOpenRatio={mouthOpenRatio}
            />

            {/* 4. Independent Front Hair (Sleek front silky locks swaying) */}
            <SawakoHairFront isDragging={isDragging} />
          </g>

          {/* ===================== LAYER 3: RELAXED NATURAL WHITE SLEEVES & HANDS ===================== */}
          <SawakoArms
            isHovered={isHovered}
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeHand={onPokeHand}
            setHoveredZone={setHoveredZone}
          />

          {/* ===================== LAYER 4: FLOATING WISPS & EMOTION SYMBOLS ===================== */}
          <SawakoWisps symbol={symbol} expression={activeExpression} />
        </svg>
      </div>
    </div>
  );
}
