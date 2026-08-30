import React from "react";
import type { SawakoExpression } from "../types";

interface SawakoEyesProps {
  expression: SawakoExpression;
  pupilX: number;
  pupilY: number;
  isBlinking: boolean;
}

/**
 * SawakoEyes - High-Fidelity Anime Chibi Eyes Rig
 * Features:
 * - Shy expression: Iconic anime `><` tightly-shut bashful eyes with cute lash flicks
 * - Dizzy expression: Hypnotic spinning swirl eyes (for 6-click easter egg)
 * - Sleepy expression: Peaceful curved closed eyes (^ ^)
 * - Happy expression: Big cheerful curved smile eyes (⌒ ⌒)
 * - Normal/Pout: Liquid obsidian irises with 3 specular gleams and 4 lower lashes
 */
export function SawakoEyes({
  expression,
  pupilX,
  pupilY,
  isBlinking,
}: SawakoEyesProps) {
  // Dizzy Expression: Comedic hypnotic spiral eyes (@.@) - only for rapid-click easter egg
  if (expression === "dizzy") {
    return (
      <g id="eyes-dizzy">
        <path d="M 246 276 Q 282 290 318 272" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M 418 272 Q 454 290 490 276" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        <circle cx="282" cy="336" r="38" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 282 336 m -25, 0 a 25,25 0 1,0 50,0 a 16,16 0 1,0 -32,0 a 8,8 0 1,0 16,0"
          fill="none"
          stroke="#818cf8"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[282px_336px]"
        />

        <circle cx="454" cy="336" r="38" fill="#ffffff" stroke="#1f2026" strokeWidth={4} />
        <path
          d="M 454 336 m -25, 0 a 25,25 0 1,0 50,0 a 16,16 0 1,0 -32,0 a 8,8 0 1,0 16,0"
          fill="none"
          stroke="#818cf8"
          strokeWidth={4}
          strokeLinecap="round"
          className="animate-spin origin-[454px_336px]"
        />
      </g>
    );
  }

  // Shy Expression: Iconic Anime `><` Tightly Shut Bashful Eyes
  if (expression === "shy") {
    return (
      <g id="eyes-shy-anime">
        {/* Bashful Eyebrows tilted in shy embarrassment */}
        <path d="M 248 274 Q 282 288 318 278" stroke="#16171E" strokeWidth={4.2} strokeLinecap="round" fill="none" />
        <path d="M 418 278 Q 454 288 488 274" stroke="#16171E" strokeWidth={4.2} strokeLinecap="round" fill="none" />

        {/* Left Eye: `>` shape */}
        <g id="left-eye-shy">
          <path
            d="M 256 318 L 302 338 L 256 358"
            stroke="#0E0F14"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Upper & lower lash flicks */}
          <line x1="256" y1="318" x2="246" y2="310" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <line x1="256" y1="358" x2="246" y2="366" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          {/* Sparkle droplet at eye apex */}
          <circle cx="308" cy="338" r="3.2" fill="#FFFFFF" />
        </g>

        {/* Right Eye: `<` shape */}
        <g id="right-eye-shy">
          <path
            d="M 480 318 L 434 338 L 480 358"
            stroke="#0E0F14"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Upper & lower lash flicks */}
          <line x1="480" y1="318" x2="490" y2="310" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <line x1="480" y1="358" x2="490" y2="366" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          {/* Sparkle droplet at eye apex */}
          <circle cx="428" cy="338" r="3.2" fill="#FFFFFF" />
        </g>
      </g>
    );
  }

  // Sleepy Expression: Peaceful curved closed eyes (^ ^)
  if (expression === "sleepy") {
    return (
      <g id="eyes-sleepy">
        <path d="M 248 280 Q 282 274 316 284" stroke="#1c1d24" strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M 420 284 Q 454 274 488 280" stroke="#1c1d24" strokeWidth={3} strokeLinecap="round" fill="none" />

        <path d="M 244 342 Q 282 370 320 342" stroke="#101115" strokeWidth={7.5} strokeLinecap="round" fill="none" />
        <path d="M 416 342 Q 454 370 492 342" stroke="#101115" strokeWidth={7.5} strokeLinecap="round" fill="none" />
        <line x1="242" y1="344" x2="234" y2="340" stroke="#101115" strokeWidth={3.5} strokeLinecap="round" />
        <line x1="494" y1="344" x2="502" y2="340" stroke="#101115" strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
  }

  // Happy Expression: Big cheerful anime curved smile eyes (⌒ ⌒)
  if (expression === "happy") {
    return (
      <g id="eyes-happy">
        <path d="M 246 270 Q 282 258 318 274" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M 418 274 Q 454 258 490 270" stroke="#1c1d24" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        <path d="M 240 344 Q 282 314 324 344" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 412 344 Q 454 314 496 344" stroke="#101115" strokeWidth={8} strokeLinecap="round" fill="none" />

        <line x1="238" y1="346" x2="230" y2="340" stroke="#101115" strokeWidth={4} strokeLinecap="round" />
        <line x1="498" y1="346" x2="506" y2="340" stroke="#101115" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }

  const isPout = expression === "pout";
  const activePupilX = isPout ? -6 : pupilX;
  const activePupilY = isPout ? -3 : pupilY;

  // Dynamic Blinking Eyelid Scaling
  const eyelidScaleY = isBlinking ? 0.08 : 1;

  return (
    <g id="eyes-standard">
      <defs>
        {/* Iris Gradient */}
        <linearGradient id="sawakoRichIris" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#08090D" />
          <stop offset="50%" stopColor="#141620" />
          <stop offset="85%" stopColor="#252A3C" />
          <stop offset="100%" stopColor="#3B425C" />
        </linearGradient>

        {/* Upper Sclera Shadow Gradient */}
        <linearGradient id="scleraShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#CAD5E2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===================== DELICATE EYEBROWS ===================== */}
      <g id="eyebrows">
        {/* Left Eyebrow */}
        <path
          d={
            isPout
              ? "M 246 280 Q 282 290 318 280"
              : "M 246 274 Q 282 264 318 276"
          }
          stroke="#16171E"
          strokeWidth={3.8}
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eyebrow */}
        <path
          d={
            isPout
              ? "M 418 280 Q 454 290 490 280"
              : "M 418 276 Q 454 264 490 274"
          }
          stroke="#16171E"
          strokeWidth={3.8}
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
        <ellipse cx="282" cy="336" rx="44" ry="40" fill="#FFFFFF" stroke="#1c1d24" strokeWidth={2.4} />

        <path
          d="M 240 326 Q 282 344 324 326 A 44 40 0 0 0 240 326"
          fill="url(#scleraShadow)"
        />

        <g
          style={{
            transform: `translate(${activePupilX}px, ${activePupilY}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <ellipse cx="282" cy="338" rx="28" ry="32" fill="url(#sawakoRichIris)" />
          <circle cx="282" cy="340" r="14" fill="#030305" />

          <path
            d="M 262 350 Q 282 366 302 350"
            stroke="#535B7E"
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />

          <circle cx="273" cy="324" r="9" fill="#FFFFFF" />
          <circle cx="293" cy="350" r="4.2" fill="#FFFFFF" fillOpacity={0.92} />
          <circle cx="269" cy="346" r="2.2" fill="#FFFFFF" fillOpacity={0.75} />
        </g>

        <path d="M 244 306 Q 282 294 320 306" stroke="#7A6068" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />

        <path d="M 236 324 Q 282 296 328 322" stroke="#0E0F14" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 326 322 Q 332 320 336 314" stroke="#0E0F14" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        <g stroke="#0E0F14" strokeWidth={2.8} strokeLinecap="round">
          <line x1="254" y1="366" x2="250" y2="377" />
          <line x1="272" y1="372" x2="270" y2="383" />
          <line x1="290" y1="372" x2="290" y2="383" />
          <line x1="308" y1="366" x2="313" y2="377" />
        </g>
      </g>

      {/* ===================== RIGHT EYE ===================== */}
      <g
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "454px 336px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        <ellipse cx="454" cy="336" rx="44" ry="40" fill="#FFFFFF" stroke="#1c1d24" strokeWidth={2.4} />

        <path
          d="M 412 326 Q 454 344 496 326 A 44 40 0 0 0 412 326"
          fill="url(#scleraShadow)"
        />

        <g
          style={{
            transform: `translate(${activePupilX}px, ${activePupilY}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <ellipse cx="454" cy="338" rx="28" ry="32" fill="url(#sawakoRichIris)" />
          <circle cx="454" cy="340" r="14" fill="#030305" />

          <path
            d="M 434 350 Q 454 366 474 350"
            stroke="#535B7E"
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />

          <circle cx="445" cy="324" r="9" fill="#FFFFFF" />
          <circle cx="465" cy="350" r="4.2" fill="#FFFFFF" fillOpacity={0.92} />
          <circle cx="441" cy="346" r="2.2" fill="#FFFFFF" fillOpacity={0.75} />
        </g>

        <path d="M 416 306 Q 454 294 492 306" stroke="#7A6068" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity="0.65" />

        <path d="M 408 322 Q 454 296 500 324" stroke="#0E0F14" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 410 322 Q 404 320 400 314" stroke="#0E0F14" strokeWidth={3.5} strokeLinecap="round" fill="none" />

        <g stroke="#0E0F14" strokeWidth={2.8} strokeLinecap="round">
          <line x1="428" y1="366" x2="423" y2="377" />
          <line x1="446" y1="372" x2="446" y2="383" />
          <line x1="464" y1="372" x2="466" y2="383" />
          <line x1="482" y1="366" x2="486" y2="377" />
        </g>
      </g>
    </g>
  );
}
