import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoEyesProps {
  expression: SawakoExpression;
  pupilX: number;
  pupilY: number;
  isBlinking: boolean;
}

/**
 * SawakoEyes - Expressive Anime Chibi Eyes Rig
 * Matches the big, innocent, sparkling dark eyes from "Sawako better.jpg"
 * Features:
 * - Dynamic tracking pupils following cursor
 * - Gentle eyelid blinking with tare-me arch
 * - Distinct 4 lower eyelashes on each eye
 * - Delicate anime eyebrows
 * - Multiple expressions: normal, pout, happy, dizzy (spin swirl), sleepy, smug
 */
export function SawakoEyes({
  expression,
  pupilX,
  pupilY,
  isBlinking,
}: SawakoEyesProps) {
  // Dizzy Expression: Comedic hypnotic spiral eyes (@.@)
  if (expression === "dizzy") {
    return (
      <g id="eyes-dizzy">
        {/* Delicate curved eyebrows worried */}
        <path d="M 248 275 Q 282 288 316 270" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M 420 270 Q 454 288 488 275" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        {/* Left Swirl */}
        <circle cx="282" cy="336" r="36" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 282 336 m -24, 0 a 24,24 0 1,0 48,0 a 16,16 0 1,0 -32,0 a 8,8 0 1,0 16,0"
          fill="none"
          stroke="#818cf8"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[282px_336px]"
        />

        {/* Right Swirl */}
        <circle cx="454" cy="336" r="36" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 454 336 m -24, 0 a 24,24 0 1,0 48,0 a 16,16 0 1,0 -32,0 a 8,8 0 1,0 16,0"
          fill="none"
          stroke="#818cf8"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[454px_336px]"
        />
      </g>
    );
  }

  // Sleepy Expression: Peaceful curved closed eyes (^ ^)
  if (expression === "sleepy") {
    return (
      <g id="eyes-sleepy">
        <path d="M 248 278 Q 282 272 316 282" stroke="#1c1d24" strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M 420 282 Q 454 272 488 278" stroke="#1c1d24" strokeWidth={3} strokeLinecap="round" fill="none" />

        <path d="M 246 342 Q 282 368 318 342" stroke="#1c1d24" strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 418 342 Q 454 368 490 342" stroke="#1c1d24" strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Happy Expression: Big cheerful anime curved smile eyes (⌒ ⌒)
  if (expression === "happy") {
    return (
      <g id="eyes-happy">
        <path d="M 246 270 Q 282 260 318 274" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M 418 274 Q 454 260 490 270" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        {/* Thick happy eye arches */}
        <path d="M 242 344 Q 282 316 322 344" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 414 344 Q 454 316 494 344" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />

        {/* Cute outer lash flick */}
        <line x1="240" y1="346" x2="232" y2="340" stroke="#101115" strokeWidth={4} strokeLinecap="round" />
        <line x1="496" y1="346" x2="504" y2="340" stroke="#101115" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }

  // Pout Expression: Looking slightly sideways with narrowed eyes (>_<)
  const isPout = expression === "pout";
  const poutPupilOffsetX = isPout ? -6 : pupilX;
  const poutPupilOffsetY = isPout ? -3 : pupilY;

  // Dynamic Blinking Eyelid Scaling
  const eyelidScaleY = isBlinking ? 0.08 : 1;

  return (
    <g id="eyes-standard">
      <defs>
        {/* Iris Gradient: Deep velvety black-indigo with soft lower luminescence */}
        <linearGradient id="sawakoIris" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B0C10" />
          <stop offset="65%" stopColor="#181A24" />
          <stop offset="100%" stopColor="#2E3347" />
        </linearGradient>
      </defs>

      {/* ===================== DELICATE EYEBROWS ===================== */}
      <g id="eyebrows">
        {/* Left Eyebrow */}
        <path
          d={isPout ? "M 248 280 Q 282 288 316 278" : "M 248 276 Q 282 268 316 278"}
          stroke="#181920"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eyebrow */}
        <path
          d={isPout ? "M 420 278 Q 454 288 488 280" : "M 420 278 Q 454 268 488 276"}
          stroke="#181920"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ===================== LEFT EYE ===================== */}
      <g
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "282px 336px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        {/* Eye Sclera (Whites) with soft upper shadow */}
        <ellipse cx="282" cy="336" rx="42" ry="38" fill="#FFFFFF" stroke="#1c1d24" strokeWidth={2.5} />
        {/* Sclera upper ambient shadow from upper lid */}
        <path d="M 244 326 Q 282 342 320 326 A 42 38 0 0 0 244 326" fill="#E8EDF5" opacity="0.6" />

        {/* Dynamic Tracking Iris & Pupil */}
        <g style={{ transform: `translate(${poutPupilOffsetX}px, ${poutPupilOffsetY}px)`, transition: "transform 0.1s ease-out" }}>
          {/* Deep Charcoal Iris */}
          <ellipse cx="282" cy="338" rx="27" ry="31" fill="url(#sawakoIris)" />
          {/* Pitch Black Inner Core Pupil */}
          <circle cx="282" cy="340" r="13" fill="#040406" />

          {/* Lower Crescent Iris Glow (characteristic of Kimi ni Todoke eyes) */}
          <path d="M 264 348 Q 282 364 300 348" stroke="#4F556E" strokeWidth={3} strokeLinecap="round" fill="none" opacity="0.8" />

          {/* Primary Crisp White Specular Highlight */}
          <circle cx="273" cy="324" r="8.5" fill="#FFFFFF" />
          {/* Secondary Star Sparkle Highlight */}
          <circle cx="292" cy="350" r="4" fill="#FFFFFF" fillOpacity={0.9} />
          {/* Micro catchlight */}
          <circle cx="270" cy="346" r="2" fill="#FFFFFF" fillOpacity={0.7} />
        </g>

        {/* Tare-me Soft Upper Eyelid Arch (Sawako's signature gentle drooping lash) */}
        <path d="M 238 325 Q 282 298 326 322" stroke="#101115" strokeWidth={7.5} strokeLinecap="round" fill="none" />
        {/* Eyelid crease line above */}
        <path d="M 246 308 Q 282 296 318 308" stroke="#7A6368" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Exactly 4 Lower Eyelashes from Sawako better.jpg */}
        <line x1="254" y1="365" x2="251" y2="375" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="272" y1="371" x2="270" y2="381" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="290" y1="371" x2="290" y2="381" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="308" y1="365" x2="312" y2="375" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
      </g>

      {/* ===================== RIGHT EYE ===================== */}
      <g
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "454px 336px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        {/* Eye Sclera (Whites) with soft upper shadow */}
        <ellipse cx="454" cy="336" rx="42" ry="38" fill="#FFFFFF" stroke="#1c1d24" strokeWidth={2.5} />
        {/* Sclera upper ambient shadow */}
        <path d="M 416 326 Q 454 342 492 326 A 42 38 0 0 0 416 326" fill="#E8EDF5" opacity="0.6" />

        {/* Dynamic Tracking Iris & Pupil */}
        <g style={{ transform: `translate(${poutPupilOffsetX}px, ${poutPupilOffsetY}px)`, transition: "transform 0.1s ease-out" }}>
          {/* Deep Charcoal Iris */}
          <ellipse cx="454" cy="338" rx="27" ry="31" fill="url(#sawakoIris)" />
          {/* Pitch Black Inner Core Pupil */}
          <circle cx="454" cy="340" r="13" fill="#040406" />

          {/* Lower Crescent Iris Glow */}
          <path d="M 436 348 Q 454 364 472 348" stroke="#4F556E" strokeWidth={3} strokeLinecap="round" fill="none" opacity="0.8" />

          {/* Primary Crisp White Specular Highlight */}
          <circle cx="445" cy="324" r="8.5" fill="#FFFFFF" />
          {/* Secondary Star Sparkle Highlight */}
          <circle cx="464" cy="350" r="4" fill="#FFFFFF" fillOpacity={0.9} />
          {/* Micro catchlight */}
          <circle cx="442" cy="346" r="2" fill="#FFFFFF" fillOpacity={0.7} />
        </g>

        {/* Tare-me Soft Upper Eyelid Arch */}
        <path d="M 410 322 Q 454 298 498 325" stroke="#101115" strokeWidth={7.5} strokeLinecap="round" fill="none" />
        {/* Eyelid crease line above */}
        <path d="M 418 308 Q 454 296 490 308" stroke="#7A6368" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Exactly 4 Lower Eyelashes from Sawako better.jpg */}
        <line x1="428" y1="365" x2="424" y2="375" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="446" y1="371" x2="446" y2="381" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="464" y1="371" x2="466" y2="381" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="482" y1="365" x2="485" y2="375" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
      </g>
    </g>
  );
}
