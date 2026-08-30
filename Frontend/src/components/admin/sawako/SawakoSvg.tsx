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
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes hitodamaWisp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.75; }
          50% { transform: translateY(-10px) scale(1.15); opacity: 0.95; }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-44 h-72 sm:w-48 sm:h-80 transition-all duration-300 ${
          isDragging ? "translate-y-[-10px] scale-105" : "animate-[ghostFloat_3.5s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 736 1104"
          className={`w-full h-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] overflow-visible transition-all duration-200 ${
            isHovered ? "brightness-105 drop-shadow-[0_18px_32px_rgba(165,180,252,0.4)]" : ""
          }`}
          role="img"
          aria-label="Sawako Anime Mascot"
        >
          <defs>
            {/* Ethereal Ground Mist Shadow */}
            <radialGradient id="sawakoGroundMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="60%" stopColor="#c7d2fe" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* Ethereal Ground Mist */}
          <ellipse cx="368" cy="1080" rx="200" ry="24" fill="url(#sawakoGroundMist)" />
          <ellipse cx="368" cy="1082" rx="140" ry="14" fill="#e0e7ff" fillOpacity={0.4} />

          {/* ===================== AUTHENTIC VECTORIZED SAWAKO (FROM SAWAKO BETTER.JPG) ===================== */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: "368px 550px",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* 1. Base Authentic Artwork (Hair dome, neck, white gown, star clip) */}
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

          {/* 5. Independent Arms & Bell Sleeves (Hover wave, poke hug, drag) */}
          <SawakoArms
            isHovered={isHovered}
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeHand={onPokeHand}
            setHoveredZone={setHoveredZone}
          />

          {/* 6. Independent Feet (Hover kick, drag dangle, tickle) */}
          <SawakoFeet
            isDragging={isDragging}
            hoveredZone={hoveredZone}
            onPokeFoot={onPokeFoot}
            setHoveredZone={setHoveredZone}
          />

          {/* 7. Floating Wisps, Hitodama & Emotion Symbols */}
          <SawakoWisps symbol={symbol} />
        </svg>
      </div>
    </div>
  );
}
