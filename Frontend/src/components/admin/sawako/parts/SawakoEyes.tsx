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

  // Shy Expression: Iconic Anime `><` Tightly Shut Bashful Eyes (Brought closer together)
  if (expression === "shy") {
    return (
      <g id="eyes-shy-anime">
        {/* Bashful Eyebrows tilted in shy embarrassment (shifted closer to center) */}
        <path d="M 266 274 Q 298 288 332 278" stroke="#16171E" strokeWidth={4.2} strokeLinecap="round" fill="none" />
        <path d="M 404 278 Q 438 288 470 274" stroke="#16171E" strokeWidth={4.2} strokeLinecap="round" fill="none" />

        {/* Left Eye: `>` shape (shifted inward towards center) */}
        <g id="left-eye-shy">
          <path
            d="M 280 318 L 326 338 L 280 358"
            stroke="#0E0F14"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="280" y1="318" x2="270" y2="310" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <line x1="280" y1="358" x2="270" y2="366" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <circle cx="331" cy="338" r="3.2" fill="#FFFFFF" />
        </g>

        {/* Right Eye: `<` shape (shifted inward towards center) */}
        <g id="right-eye-shy">
          <path
            d="M 456 318 L 410 338 L 456 358"
            stroke="#0E0F14"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="456" y1="318" x2="466" y2="310" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <line x1="456" y1="358" x2="466" y2="366" stroke="#0E0F14" strokeWidth={4} strokeLinecap="round" />
          <circle cx="405" cy="338" r="3.2" fill="#FFFFFF" />
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
        {/* Nhãn cầu Sapphire Obsidian đa tầng quý phái */}
        <radialGradient id="ariIrisL" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#1B172E" />
          <stop offset="65%" stopColor="#0E0B1A" />
          <stop offset="100%" stopColor="#030208" />
        </radialGradient>
        <radialGradient id="ariIrisR" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#1B172E" />
          <stop offset="65%" stopColor="#0E0B1A" />
          <stop offset="100%" stopColor="#030208" />
        </radialGradient>
      </defs>

      {/* ===================== DELICATE EYEBROWS ===================== */}
      <g id="eyebrows">
        {/* Left Eyebrow */}
        <path
          d={
            isPout
              ? "M 246 280 Q 282 290 318 280"
              : "M 246 272 Q 282 260 318 274"
          }
          stroke="#221B26"
          strokeWidth={3.6}
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eyebrow */}
        <path
          d={
            isPout
              ? "M 418 280 Q 454 290 490 280"
              : "M 418 274 Q 454 260 490 272"
          }
          stroke="#221B26"
          strokeWidth={3.6}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ===================== LEFT EYE (PURE ARISTOCRAT) ===================== */}
      <g
        id="left-eye-group"
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "282px 336px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        {/* Tròng trắng mở to tròn hơn (ry=42) không viền stroke đen */}
        <ellipse cx="282" cy="336" rx="44" ry="42" fill="#FFFFFF" stroke="none" />

        {/* Bóng mí phủ sương mờ dịu */}
        <path
          d="M 238 324 Q 282 344 326 324 A 44 42 0 0 0 238 324"
          fill="#E2E5F0"
          opacity={0.85}
        />

        {/* Đồng tử chuyển động linh hoạt theo chuột */}
        <g
          style={{
            transform: `translate(${activePupilX}px, ${activePupilY}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <ellipse cx="282" cy="337" rx="28.5" ry="32.5" fill="url(#ariIrisL)" />
          <circle cx="282" cy="338" r="13" fill="#010104" />

          {/* Dải phản quang ngọc lam tráng gương đáy mắt */}
          <path
            d="M 264 351 Q 282 366 300 351"
            stroke="#93C5FD"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />

          {/* Quầng hào quang sương mờ + Đốm ngọc trai ngấn lệ */}
          <circle cx="273" cy="323" r="12.5" fill="#FFFFFF" opacity={0.18} />
          <circle cx="273" cy="323" r="9.2" fill="#FFFFFF" />
          <circle cx="293" cy="350" r="4.4" fill="#FFFFFF" fillOpacity={0.95} />
          <circle cx="268" cy="345" r="2.5" fill="#FFFFFF" fillOpacity={0.85} />
          {/* Giọt sương mai tiểu thư đọng đáy mắt */}
          <circle cx="284" cy="357" r="1.6" fill="#E0F2FE" opacity={0.9} />
        </g>

        {/* Nếp mí đôi thanh nhã hồng tro hạt dẻ quý tộc */}
        <path
          d="M 244 302 Q 282 290 320 302"
          stroke="#8A5A65"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />

        {/* Mi trên cong vút mở to (vòm mí nâng cao 4px) */}
        <path
          d="M 234 322 Q 282 292 328 320"
          stroke="#120D15"
          strokeWidth={7.5}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 326 320 Q 333 317 338 310"
          stroke="#120D15"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 240 310 Q 236 306 232 302"
          stroke="#120D15"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />

        {/* Đường viền mí dưới hạt dẻ + 4 sợi mi cong tơi xốp như tơ lụa */}
        <path
          d="M 248 366 Q 282 378 312 366"
          stroke="#8A5A65"
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <g stroke="#231720" strokeWidth={1.8} strokeLinecap="round" fill="none">
          <path d="M 254 366 Q 251 373 248 379" />
          <path d="M 272 374 Q 271 380 269 385" />
          <path d="M 290 374 Q 290 380 290 385" />
          <path d="M 308 366 Q 312 373 315 379" />
        </g>
      </g>

      {/* ===================== RIGHT EYE (PURE ARISTOCRAT) ===================== */}
      <g
        id="right-eye-group"
        style={{
          transform: `scaleY(${eyelidScaleY})`,
          transformOrigin: "454px 336px",
          transition: "transform 0.08s ease-in-out",
        }}
      >
        <ellipse cx="454" cy="336" rx="44" ry="42" fill="#FFFFFF" stroke="none" />

        <path
          d="M 410 324 Q 454 344 498 324 A 44 42 0 0 0 410 324"
          fill="#E2E5F0"
          opacity={0.85}
        />

        <g
          style={{
            transform: `translate(${activePupilX}px, ${activePupilY}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <ellipse cx="454" cy="337" rx="28.5" ry="32.5" fill="url(#ariIrisR)" />
          <circle cx="454" cy="338" r="13" fill="#010104" />

          <path
            d="M 436 351 Q 454 366 472 351"
            stroke="#93C5FD"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />

          <circle cx="445" cy="323" r="12.5" fill="#FFFFFF" opacity={0.18} />
          <circle cx="445" cy="323" r="9.2" fill="#FFFFFF" />
          <circle cx="465" cy="350" r="4.4" fill="#FFFFFF" fillOpacity={0.95} />
          <circle cx="440" cy="345" r="2.5" fill="#FFFFFF" fillOpacity={0.85} />
          <circle cx="456" cy="357" r="1.6" fill="#E0F2FE" opacity={0.9} />
        </g>

        <path
          d="M 416 302 Q 454 290 492 302"
          stroke="#8A5A65"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />

        <path
          d="M 408 320 Q 454 292 502 322"
          stroke="#120D15"
          strokeWidth={7.5}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 410 320 Q 403 317 398 310"
          stroke="#120D15"
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 496 310 Q 500 306 504 302"
          stroke="#120D15"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M 424 366 Q 454 378 488 366"
          stroke="#8A5A65"
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <g stroke="#231720" strokeWidth={1.8} strokeLinecap="round" fill="none">
          <path d="M 428 366 Q 424 373 421 379" />
          <path d="M 446 374 Q 446 380 446 385" />
          <path d="M 464 374 Q 465 380 467 385" />
          <path d="M 482 366 Q 485 373 488 379" />
        </g>
      </g>
    </g>
  );
}
