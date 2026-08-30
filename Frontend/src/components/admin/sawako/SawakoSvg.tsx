import React, { useState } from "react";
import type { SawakoSvgProps } from "./types";
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
 * Modeled after Kimi ni Todoke ("Sawako better.jpg")
 * Features:
 * - 100% vector, lightweight and sharp at any DPI (<25KB total)
 * - Layered spring physics: gentle idle bobbing, head cursor tilt, hair sway
 * - Articulated arms and kicking feet with independent hover and poke zones
 * - Eye tracking, eyelid blinking, and lip-sync speech cadence
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

  return (
    <div
      className="relative select-none pointer-events-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: "bottom center",
      }}
    >
      <style>{`
        @keyframes chibiBobbing {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1.2deg); }
        }
        @keyframes hitodamaWisp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-12px) scale(1.15); opacity: 0.95; }
        }
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-48 h-80 sm:w-52 sm:h-88 transition-all duration-300 ${
          isDragging
            ? "translate-y-[-12px] scale-105"
            : "animate-[chibiBobbing_3.2s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 736 1104"
          className={`w-full h-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.35)] overflow-visible transition-all duration-200 ${
            isHovered
              ? "brightness-105 drop-shadow-[0_20px_36px_rgba(251,207,232,0.45)]"
              : ""
          }`}
          role="img"
          aria-label="Sawako Anime Mascot"
        >
          <defs>
            {/* Ethereal Ground Mist Shadow */}
            <radialGradient id="sawakoGroundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbcfe8" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* Ethereal Ground Mist directly under chibi feet */}
          <ellipse cx="368" cy="1010" rx="190" ry="22" fill="url(#sawakoGroundMist)" />
          <ellipse cx="368" cy="1012" rx="120" ry="12" fill="#fce7f3" fillOpacity={0.4} />

          {/* ===================== AUTHENTIC VECTORIZED CHIBI SAWAKO ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "368px 490px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* 1. Base Authentic Artwork (Hair dome, head, blush, cardigan, ton-sur-ton skirt) */}
            <SawakoBaseArtwork />

            {/* 2. Independent Eyes (Pupil tracking, eyelid blinking, lashes) */}
            <SawakoEyes
              expression={expression}
              pupilX={pupilX}
              pupilY={pupilY}
              isBlinking={isBlinking}
            />

            {/* 3. Independent Mouth (Lip-sync speaking, pout, happy smile, dizzy) */}
            <SawakoMouth
              expression={expression}
              mouthOpenRatio={mouthOpenRatio}
            />

            {/* 4. Independent Front Hair Physics (Silky front strands swaying) */}
            <SawakoHairFront isDragging={isDragging} />
          </g>

          {/* 5. Independent Feet (Hover kick, drag dangle, tickle) */}
          <SawakoFeet
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeFoot={onPokeFoot}
            setHoveredZone={setHoveredZone}
          />

          {/* 6. Independent Arms & Bell Sleeves (Hover wave, poke, drag) */}
          <SawakoArms
            isHovered={isHovered}
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeHand={onPokeHand}
            setHoveredZone={setHoveredZone}
          />

          {/* 7. Floating Wisps, Aura & Emotion Symbols */}
          <SawakoWisps symbol={symbol} expression={expression} />
        </svg>
      </div>
    </div>
  );
}
