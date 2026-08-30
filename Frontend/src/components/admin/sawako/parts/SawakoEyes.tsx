import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoEyesProps {
  expression: SawakoExpression;
  pupilX: number;
  pupilY: number;
  isBlinking: boolean;
}

export function SawakoEyes({
  expression,
  pupilX,
  pupilY,
  isBlinking,
}: SawakoEyesProps) {
  if (expression === "dizzy") {
    // Comedic Hypnotic Swirl Eyes (@.@)
    return (
      <g>
        {/* Left Swirl */}
        <circle cx="282" cy="328" r="34" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 282 328 m -22, 0 a 22,22 0 1,0 44,0 a 14,14 0 1,0 -28,0 a 7,7 0 1,0 14,0"
          fill="none"
          stroke="#6366f1"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[282px_328px]"
        />
        {/* Right Swirl */}
        <circle cx="454" cy="328" r="34" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 454 328 m -20, 0 a 20,20 0 1,0 40,0 a 13,13 0 1,0 -26,0 a 6.5,6.5 0 1,0 13,0"
          fill="none"
          stroke="#6366f1"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[454px_328px]"
        />
      </g>
    );
  }

  if (expression === "sleepy") {
    // Sweet happy closed eyes (^ ^)
    return (
      <g>
        <path d="M 248 335 Q 282 360 316 335" stroke="#1c1d24" strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 420 335 Q 454 360 488 335" stroke="#1c1d24" strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Dynamic Eye Rig with Pupil Tracking and Eyelid Blinking
  const eyelidScaleY = isBlinking ? 0.08 : 1;

  return (
    <g>
      {/* ===================== LEFT EYE ===================== */}
      <g
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "282px 328px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        {/* Eye Sclera (Whites) */}
        <ellipse cx="282" cy="328" rx="44" ry="40" fill="#ffffff" stroke="#1c1d24" strokeWidth={3} />

        {/* Dynamic Tracking Iris & Pupil */}
        <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: "transform 0.1s ease-out" }}>
          {/* Deep Charcoal Iris */}
          <ellipse cx="282" cy="330" rx="28" ry="32" fill="#14141a" />
          <circle cx="282" cy="332" r="14" fill="#060608" />
          {/* Primary Crisp White Specular Highlight */}
          <circle cx="274" cy="318" r="9" fill="#ffffff" />
          {/* Secondary Soft Crescent Shine */}
          <circle cx="290" cy="342" r="4.5" fill="#ffffff" fillOpacity={0.85} />
        </g>

        {/* Tare-me Upper Eyelid Arch */}
        <path d="M 238 316 Q 282 290 326 314" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />
        
        {/* Exactly 4 Lower Eyelashes from Sawako better.jpg */}
        <line x1="255" y1="358" x2="252" y2="368" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="272" y1="363" x2="270" y2="374" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="290" y1="363" x2="290" y2="374" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="308" y1="358" x2="312" y2="368" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
      </g>

      {/* ===================== RIGHT EYE ===================== */}
      <g
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "454px 328px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        {/* Eye Sclera (Whites) */}
        <ellipse cx="454" cy="328" rx="44" ry="40" fill="#ffffff" stroke="#1c1d24" strokeWidth={3} />

        {/* Dynamic Tracking Iris & Pupil */}
        <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: "transform 0.1s ease-out" }}>
          {/* Deep Charcoal Iris */}
          <ellipse cx="454" cy="330" rx="28" ry="32" fill="#14141a" />
          <circle cx="454" cy="332" r="14" fill="#060608" />
          {/* Primary Crisp White Specular Highlight */}
          <circle cx="446" cy="318" r="9" fill="#ffffff" />
          {/* Secondary Soft Crescent Shine */}
          <circle cx="462" cy="342" r="4.5" fill="#ffffff" fillOpacity={0.85} />
        </g>

        {/* Tare-me Upper Eyelid Arch */}
        <path d="M 410 314 Q 454 290 498 316" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />

        {/* Exactly 4 Lower Eyelashes from Sawako better.jpg */}
        <line x1="428" y1="358" x2="424" y2="368" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="446" y1="363" x2="446" y2="374" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="464" y1="363" x2="466" y2="374" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
        <line x1="481" y1="358" x2="484" y2="368" stroke="#101115" strokeWidth={2.8} strokeLinecap="round" />
      </g>
    </g>
  );
}
