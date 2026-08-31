import React, { useEffect, useState } from "react";
import type { SawakoSvgProps, SawakoExpression } from "./types";
import { useSawakoPhysics } from "./hooks/useSawakoPhysics";
import { useSawakoLipSync } from "./hooks/useSawakoLipSync";
import { SawakoBaseArtwork } from "./parts/SawakoBaseArtwork";
import { SawakoEyes } from "./parts/SawakoEyes";
import { SawakoMouth } from "./parts/SawakoMouth";
import { SawakoHairFront } from "./parts/SawakoHairFront";
import { SawakoArms } from "./parts/SawakoArms";
import { SawakoFeet } from "./parts/SawakoFeet";
import { SawakoHairBack } from "./parts/SawakoHairBack";
import { SawakoWisps } from "./parts/SawakoWisps";
import { SawakoFireflies } from "./parts/SawakoFireflies";
import { SawakoAmbientMood } from "./parts/SawakoAmbientMood";

/**
 * SawakoSvg - Authentic Full-Body Chibi Mascot Vector Puppet
 * Features:
 * - Scaled down to 80% for ideal desktop/dashboard footprint
 * - Proper SVG Z-index layering: legs rendered behind pure white muse dress
 * - No glow / no brightness flare on hover/touch (clean natural presentation)
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
  isWalking = false,
  walkDirection = "left",
  isSippingTea = false,
  onPokeHand,
  onPokeFoot,
  onPokeStarClip,
  isProtectingStar = false,
  isBeingPatted = false,
  onHeadpatStroke,
  timeOfDay = "day",
  hour,
  onCycleTimeOfDay,
}: SawakoSvgProps) {
  const [hoveredZone, setHoveredZone] = useState<"hand" | "foot" | null>(null);
  const [isShyPeeking, setIsShyPeeking] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setIsShyPeeking(false);
      return;
    }

    const revealTimer = window.setTimeout(() => setIsShyPeeking(true), 2200);
    const resetTimer = window.setTimeout(() => setIsShyPeeking(false), 4400);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(resetTimer);
    };
  }, [isHovered]);


  // Independent physical kinematics & lip-sync hooks
  const { pupilX, pupilY, headRotate, isBlinking } = useSawakoPhysics(
    eyeOffset,
    isHovered,
    isDragging
  );
  const { mouthOpenRatio } = useSawakoLipSync(isSpeaking);

  // Blissful smiling eyes when sipping tea, or happy during headpat
  const baseExpression = isSippingTea && (expression === "normal" || expression === "sleepy")
    ? "happy"
    : expression;

  const activeExpression: SawakoExpression = isBeingPatted
    ? "happy"
    : isDragging && baseExpression !== "dizzy"
      ? "shy"
      : baseExpression;

  // Overall scale scaled down to 80% size for refined mascot presence (Unflipped authentic perspective)
  const finalScaleX = scaleX * 0.82;
  const finalScaleY = scaleY * 0.82;

  // Authentic directional cues:
  // - While walking: body tilt strictly follows walking momentum without mouse jitter
  // - Gaze: eyes still freely track the cursor for a cute, natural glance
  let effectiveHeadRotate = headRotate;
  if (isWalking && !isDragging && !isBeingPatted) {
    effectiveHeadRotate = walkDirection === "left" ? -1.5 : 1.5;
  }
  const effectivePupilX = isWalking && !isDragging
    ? Math.max(-5, Math.min(5, pupilX + (walkDirection === "left" ? -1.2 : 1.2)))
    : pupilX;

  // In sitting pose: upper body lowers by 115px to sit stably on the floor without swaying skirt off knees
  const upperBodyTransform = isSippingTea
    ? "translate(0px, 115px)"
    : isBeingPatted
      ? undefined
      : `rotate(${effectiveHeadRotate}deg)`;

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
        @keyframes startledHop {
          0% { transform: translateY(0px) rotate(0deg); }
          16% { transform: translateY(-10px) rotate(-2deg); }
          24% { transform: translateY(-4px) rotate(0deg); }
          78% { transform: translateY(-3px) rotate(0deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes headpatPurrLean {
          0%, 100% { transform: rotate(3deg) translateY(-1px); }
          50% { transform: rotate(-3deg) translateY(-3px); }
        }
        @keyframes shyPeek {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          35% { transform: rotate(2.5deg) translateY(-2px); }
          70% { transform: rotate(-1.5deg) translateY(-1px); }
        }
        @keyframes butterflyWander {
          0% { transform: translate(224px, -18px) rotate(-8deg); }
          9% { transform: translate(288px, -126px) rotate(14deg); }
          19% { transform: translate(176px, -286px) rotate(-21deg); }
          31% { transform: translate(-12px, -338px) rotate(9deg); }
          42% { transform: translate(-248px, -244px) rotate(26deg); }
          53% { transform: translate(-306px, -38px) rotate(-16deg); }
          64% { transform: translate(-218px, 168px) rotate(7deg); }
          75% { transform: translate(-42px, 314px) rotate(-24deg); }
          86% { transform: translate(252px, 238px) rotate(17deg); }
          94% { transform: translate(312px, 76px) rotate(-11deg); }
          100% { transform: translate(224px, -18px) rotate(-8deg); }
        }
        @keyframes butterflyWingBeat {
          0%, 100% { transform: scaleX(1); }
          44% { transform: scaleX(0.42); }
          72% { transform: scaleX(0.78); }
        }
        /* Dáng đi Chibi Tekuteku: Thân người nhún nảy 2 nhịp kết hợp lắc lư trái-phải theo bước chân */
        @keyframes waddleBodyBobLeft {
          0% { transform: translateY(0px) rotate(-3.5deg); }
          25% { transform: translateY(-5px) rotate(-1.5deg); }
          50% { transform: translateY(0px) rotate(0.5deg); }
          75% { transform: translateY(-5px) rotate(-1.5deg); }
          100% { transform: translateY(0px) rotate(-3.5deg); }
        }
        @keyframes waddleBodyBobRight {
          0% { transform: translateY(0px) rotate(3.5deg); }
          25% { transform: translateY(-5px) rotate(1.5deg); }
          50% { transform: translateY(0px) rotate(-0.5deg); }
          75% { transform: translateY(-5px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(3.5deg); }
        }
        @keyframes waddleHairSwayLeft {
          0%, 100% { transform: rotate(1.5deg); }
          25% { transform: rotate(-2deg); }
          50% { transform: rotate(-1.5deg); }
          75% { transform: rotate(2deg); }
        }
        @keyframes waddleHairSwayRight {
          0%, 100% { transform: rotate(-1.5deg); }
          25% { transform: rotate(2deg); }
          50% { transform: rotate(1.5deg); }
          75% { transform: rotate(-2deg); }
        }
      `}</style>

      {/* Levitation Floating Container */}
      <div
        className={`relative w-40 h-68 sm:w-44 sm:h-76 transition-all duration-300 ${
          isProtectingStar
            ? "animate-[startledHop_1.8s_ease-in-out]"
            : isDragging
              ? "translate-y-[-6px]"
              : isSippingTea
                ? "animate-[chibiBobbing_4.8s_ease-in-out_infinite]"
                : isWalking
                  ? walkDirection === "left"
                    ? "animate-[waddleBodyBobLeft_0.8s_ease-in-out_infinite]"
                    : "animate-[waddleBodyBobRight_0.8s_ease-in-out_infinite]"
                  : "animate-[chibiBobbing_3.2s_ease-in-out_infinite]"
        }`}
      >
        <svg
          viewBox="0 0 736 1104"
          className="w-full h-full overflow-visible transition-all duration-200"
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
          <ellipse cx="368" cy="1010" rx={isSippingTea ? 220 : 180} ry={isSippingTea ? 26 : 20} fill="url(#sawakoGroundMist)" />
          <ellipse cx="368" cy="1012" rx={isSippingTea ? 130 : 110} ry={11} fill="#fce7f3" fillOpacity={0.35} />

          {/* Small pastel butterfly following an irregular, organic path */}
          <g
            id="sawako-wandering-butterfly"
            className="pointer-events-none"
            transform="translate(368 600)"
            style={{ opacity: isDragging ? 0.22 : 0.82, transition: "opacity 0.3s ease" }}
          >
            <g className="animate-[butterflyWander_11.5s_ease-in-out_infinite]">
              <g className="animate-[butterflyWingBeat_0.78s_ease-in-out_infinite]" style={{ transformOrigin: "0px 0px" }}>
              <path d="M -3 0 C -28 -30 -58 -20 -47 5 C -39 22 -17 18 -3 5 Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="3" />
              <path d="M 3 0 C 28 -30 58 -20 47 5 C 39 22 17 18 3 5 Z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="3" />
              </g>
              <ellipse cx="0" cy="4" rx="5" ry="16" fill="#FDE68A" stroke="#D99A2B" strokeWidth="2" />
              <path d="M -2 -10 Q -12 -25 -19 -18 M 2 -10 Q 12 -25 19 -18" fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-18" cy="-18" r="2" fill="#FFF7C2" />
              <circle cx="18" cy="-18" r="2" fill="#FFF7C2" />
            </g>
          </g>

          {/* ===================== LAYER 0: SLEEK BACK HAIR (BEHIND LEGS & ENTIRE BODY) ===================== */}
          <g
            style={{
              transform: upperBodyTransform,
              transformOrigin: "368px 486px",
              transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <g
              className={
                isBeingPatted
                  ? "animate-[headpatPurrLean_1.2s_ease-in-out_infinite]"
                  : isShyPeeking
                    ? "animate-[shyPeek_1.8s_ease-in-out]"
                    : isWalking && !isDragging
                      ? walkDirection === "left"
                        ? "animate-[waddleHairSwayLeft_0.8s_ease-in-out_infinite]"
                        : "animate-[waddleHairSwayRight_0.8s_ease-in-out_infinite]"
                      : ""
              }
              style={{ transformOrigin: "368px 486px" }}
            >
              <SawakoHairBack />
            </g>
          </g>

          {/* ===================== LAYER 1: ARTICULATED LEGS & BLACK BOOTS (ON TOP OF BACK HAIR) ===================== */}
          <SawakoFeet
            isDragging={isDragging}
            isWalking={isWalking}
            walkDirection={walkDirection}
            isSippingTea={isSippingTea}
            hoveredZone={hoveredZone}
            onPokeFoot={onPokeFoot}
            setHoveredZone={setHoveredZone}
          />

          {/* ===================== LAYER 2: HEAD & UPPER BODY WITH ROTATION ===================== */}
          <g
            style={{
              transform: upperBodyTransform,
              transformOrigin: "368px 486px",
              transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <g
              className={
                isBeingPatted
                  ? "animate-[headpatPurrLean_1.2s_ease-in-out_infinite]"
                  : isShyPeeking
                    ? "animate-[shyPeek_1.8s_ease-in-out]"
                    : ""
              }
              style={{ transformOrigin: "368px 486px" }}
            >
              {/* 1. Base Artwork with nested arms, eyes, and mouth (all under the cascading unified hair) */}
              <SawakoBaseArtwork
                expression={activeExpression}
                isHovered={isHovered}
                isShyPeeking={isShyPeeking}
                isSippingTea={isSippingTea}
                onPokeStarClip={onPokeStarClip}
                onHeadpatStroke={onHeadpatStroke}
              >
                {/* 2. Relaxed Puffed Sleeves & Hands (rendered on dress, UNDER the cascading front hair locks) */}
                <SawakoArms
                  isHovered={isHovered}
                  isDragging={isDragging}
                  hoveredZone={hoveredZone}
                  onPokeHand={onPokeHand}
                  setHoveredZone={setHoveredZone}
                  isProtectingStar={isProtectingStar}
                  isWalking={isWalking}
                  walkDirection={walkDirection}
                  isSippingTea={isSippingTea}
                />

                {/* 3. Independent Eyes (Tracking pupils, eyelid blinking, 4 lower lashes, shy gaze when dragging) */}
                <SawakoEyes
                  expression={activeExpression}
                  pupilX={effectivePupilX}
                  pupilY={pupilY}
                  isBlinking={isBlinking}
                />

                {/* 4. Independent Mouth (Innocent parted anime mouth without robotic flapping) */}
                <SawakoMouth
                  expression={activeExpression}
                  mouthOpenRatio={mouthOpenRatio}
                />
              </SawakoBaseArtwork>

              <SawakoHairFront isDragging={isDragging} />
            </g>
          </g>

          {/* ===================== LAYER 4: ETHEREAL LUMINOUS FIREFLIES ===================== */}
          <SawakoFireflies isHovered={isHovered} isDragging={isDragging} />

          {/* ===================== LAYER 5: DYNAMIC REAL-TIME AMBIENT MOOD (MOON / DUSK / SUN) ===================== */}
          <SawakoAmbientMood
            timeOfDay={timeOfDay}
            hour={hour}
            isDragging={isDragging}
            onCycleTimeOfDay={onCycleTimeOfDay}
          />

          {/* ===================== LAYER 6: FLOATING WISPS & EMOTION SYMBOLS ===================== */}
          <SawakoWisps symbol={symbol} expression={activeExpression} isBeingPatted={isBeingPatted} />
        </svg>
      </div>
    </div>
  );
}
