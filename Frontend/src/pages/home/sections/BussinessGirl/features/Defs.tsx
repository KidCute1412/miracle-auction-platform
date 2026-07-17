import React from "react";
import type { ThemeColors } from "../types";

interface DefsProps {
  isDark: boolean;
  themeColors: ThemeColors;
}

const defaultThemeColors: ThemeColors = {
  suitColor: "#1e293b",
  lapelColor: "#0f172a",
  lapelStroke: "#334155",
  broochFill: "#a78bfa",
  broochGlow: "rgba(167, 139, 250, 0.7)",
  hairHighlightStart: "#a78bfa",
  hairHighlightEnd: "#f472b6"
};

export const Defs: React.FC<DefsProps> = ({ isDark, themeColors }) => {
  const colors = themeColors || defaultThemeColors;
  return (
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
        .gavel-charging {
          animation: gavelTremble 0.08s infinite;
          transform-origin: 10px 23px;
        }
        @keyframes gavelTremble {
          0%, 100% { transform: rotate(-24deg) translateY(-0.3px); }
          50% { transform: rotate(-21deg) translateY(0.3px); }
        }
        @keyframes gavelStrike {
          0% { transform: translateY(0px) translateX(0px) rotate(-20deg); }
          40% { transform: translateY(-12px) translateX(4px) rotate(45deg); }
          70% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          80% { transform: translateY(-1px) translateX(0px) rotate(-5deg); }
          90%, 100% { transform: translateY(0px) translateX(0px) rotate(-20deg); }
        }
        @keyframes burst {
          0%, 65% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          85% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .sparkle-burst {
          animation: burst 1.2s ease-out both;
          transform-origin: 10px 12.5px;
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .animate-ripple-1 {
          animation: ripple 0.8s ease-out both;
          transform-origin: 81.5px 115px;
        }
        .animate-ripple-2 {
          animation: ripple 0.8s ease-out both;
          animation-delay: 0.25s;
          transform-origin: 81.5px 115px;
        }
        
        /* Quantum Shockwave Ripple */
        @keyframes quantumRippleAnim {
          0% { transform: scale(0.6); opacity: 0.95; filter: blur(0px); }
          100% { transform: scale(6.5); opacity: 0; filter: blur(2px); }
        }
        .animate-ripple-quantum {
          animation: quantumRippleAnim 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) both;
          transform-origin: 81.5px 115px;
        }

        @keyframes floatHeart {
          0% { transform: translateY(2px) scale(0.8); opacity: 0; }
          50% { opacity: 0.85; }
          100% { transform: translateY(-7px) scale(1.1); opacity: 0; }
        }
        .animate-heart-float {
          animation: floatHeart 1.2s ease-out infinite;
          transform-origin: 50px 30px;
        }
        @keyframes heartWinkFlyLeft {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          8% { opacity: 0.95; }
          100% { transform: translate(-15px, -30px) scale(4.8); opacity: 0; }
        }
        @keyframes heartWinkFlyRight {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          8% { opacity: 0.95; }
          100% { transform: translate(15px, -30px) scale(4.8); opacity: 0; }
        }
        .animate-heart-wink-left {
          animation: heartWinkFlyLeft 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform-origin: 41.5px 46.5px;
        }
        .animate-heart-wink-right {
          animation: heartWinkFlyRight 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform-origin: 58.5px 46.5px;
        }
        @keyframes holoBootContainer {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(35px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .holo-container {
          animation: holoBootContainer 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scanlineSweep {
          0% { transform: translateY(-15px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(135px); opacity: 0; }
        }
        .holo-scanline-bar {
          animation: scanlineSweep 3.2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        @keyframes raySweep {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(140px);
            opacity: 0;
          }
        }
        .light-ray-sweep {
          animation: raySweep 3.2s cubic-bezier(0.25, 1, 0.5, 1) 0.8s forwards;
        }
        @keyframes revealHeight {
          0% {
            height: 0;
          }
          100% {
            height: 150px;
          }
        }
        .reveal-rect-animation {
          animation: revealHeight 3.2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        
        /* Brooch Pulsing animation */
        @keyframes broochPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px ${colors.broochFill}); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 5px ${colors.broochFill}); }
        }
        .brooch-interactive {
          cursor: pointer;
          transform-origin: 38px 78px;
          animation: broochPulse 2.5s ease-in-out infinite;
          transition: all 0.3s;
        }
        .brooch-interactive:hover {
          filter: brightness(1.2) drop-shadow(0 0 8px ${colors.broochFill});
          transform: scale(1.15);
        }

        /* Screen Shake Animation */
        @keyframes screenShakeAnim {
          0%, 100% { transform: translate(0, 0) scale(1.03); }
          15% { transform: translate(-3px, 1.5px) rotate(-0.5deg) scale(1.03); }
          30% { transform: translate(3px, -1.5px) rotate(0.5deg) scale(1.03); }
          45% { transform: translate(-2px, -1px) rotate(-0.2deg) scale(1.03); }
          60% { transform: translate(2px, 1px) rotate(0.2deg) scale(1.03); }
          75% { transform: translate(-1px, 0.5px) scale(1.03); }
          90% { transform: translate(1px, -0.5px) scale(1.03); }
        }
        .animate-svg-shake {
          animation: screenShakeAnim 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
        <stop offset="70%" stopColor={colors.hairHighlightStart} stopOpacity="0.2" />
        <stop offset="100%" stopColor={colors.hairHighlightEnd} stopOpacity="0.2" />
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
      <radialGradient id="blushStrongGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sparkleStarGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1.0" />
        <stop offset="45%" stopColor="#fef08a" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
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
      <linearGradient id="scanTrail" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </linearGradient>
      <pattern id="scanGrid" width="100" height="2" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="100" y2="0" stroke="#06b6d4" strokeWidth="0.25" opacity="0.3" />
      </pattern>
      <filter id="laserGlow">
        <feGaussianBlur stdDeviation="1.2" result="coloredBlur1" />
        <feGaussianBlur stdDeviation="0.4" result="coloredBlur2" />
        <feMerge>
          <feMergeNode in="coloredBlur1" />
          <feMergeNode in="coloredBlur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="holoRefraction" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06 0.15" numOctaves="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <linearGradient id="lightRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
      </linearGradient>
      <clipPath id="characterClip">
        <path d="M 34 44 C 34 53, 38 57, 50 57 C 62 57, 66 53, 66 44 Z" />
        <path d="M 62 47 C 69 43, 75 49, 74 56 C 73 62, 66 63, 61 57 Z" />
        <path d="M 32 76 C 32 82, 35 106, 35 114 L 65 114 C 65 106, 68 82, 68 76 C 68 72, 64 69, 50 69 C 36 69, 32 72, 32 76 Z" />
        <path d="M 34 44 C 34 54, 40 64, 50 64 C 60 64, 66 54, 66 44 C 66 35, 61 31, 50 31 C 39 31, 34 35, 34 44 Z" />
        <path d="M 28 76 C 27 82, 29 90, 31 100 L 44 100 L 44 97 C 34 97, 31 91, 32 76 Z" />
        <path d="M 44 97 L 51 97 C 52.5 97, 53 98, 53 98.5 C 53 99.2, 52 100, 44 100 Z" />
        <path d="M 72 76 C 73 82, 71 90, 69 100 L 56 100 L 56 97 C 66 97, 69 91, 68 76 Z" />
        <path d="M 56 97 L 49 97 C 47.5 97, 47 98, 47 98.5 C 47 99.2, 48 100, 56 100 Z" />
      </clipPath>
      <mask id="revealMask">
        <rect x="-10" y="-20" width="120" height="150" fill="#000000" />
        <rect x="-10" y="-20" width="120" height="10" fill="#ffffff" className="reveal-rect-animation" />
      </mask>
      <mask id="wireframeMask">
        <rect x="-10" y="-20" width="120" height="150" fill="#ffffff" />
        <rect x="-10" y="-20" width="120" height="10" fill="#000000" className="reveal-rect-animation" />
      </mask>
    </defs>
  );
};
