import React from "react";

interface SawakoFirefliesProps {
  isHovered: boolean;
  isDragging: boolean;
}

/**
 * SawakoFireflies - Organic Multi-Harmonic Starlight Dust Field
 * 
 * Features:
 * - Truly unpredictable, wandering Brownian-style trajectories via dual coprime harmonics
 * - 8 varied micro-particles: from tiny glowing pinpricks to soft fairy diamonds
 * - Wide, gentle, roaming arcs spanning the entire space around Sawako (hair, sleeves, dress, hem)
 * - Organic breathing opacity and slow graceful tumbling rotations
 * - Interactive dispersion when mouse hovers nearby
 */
export function SawakoFireflies({ isHovered, isDragging }: SawakoFirefliesProps) {
  return (
    <g
      id="sawako-fireflies-layer"
      className="pointer-events-none"
      style={{
        opacity: isDragging ? 0.15 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      <style>{`
        /* ===================== COPRIME MACRO ORBIT KEYFRAMES (WIDE WANDERING) ===================== */
        @keyframes macroOrbit1 {
          0% { transform: translate(0px, 0px); }
          18% { transform: translate(-45px, 35px); }
          38% { transform: translate(-20px, 85px); }
          58% { transform: translate(35px, 60px); }
          82% { transform: translate(25px, -20px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit2 {
          0% { transform: translate(0px, 0px); }
          22% { transform: translate(50px, -40px); }
          45% { transform: translate(30px, 60px); }
          68% { transform: translate(-35px, 30px); }
          88% { transform: translate(-20px, -25px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit3 {
          0% { transform: translate(0px, 0px); }
          20% { transform: translate(-55px, 45px); }
          42% { transform: translate(-30px, -30px); }
          65% { transform: translate(40px, -50px); }
          85% { transform: translate(20px, 25px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit4 {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(55px, -55px); }
          50% { transform: translate(-40px, -40px); }
          72% { transform: translate(20px, 35px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit5 {
          0% { transform: translate(0px, 0px); }
          19% { transform: translate(-45px, -50px); }
          40% { transform: translate(35px, -30px); }
          62% { transform: translate(40px, 35px); }
          84% { transform: translate(-20px, 20px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit6 {
          0% { transform: translate(0px, 0px); }
          28% { transform: translate(40px, -45px); }
          55% { transform: translate(-45px, 25px); }
          80% { transform: translate(15px, 40px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit7 {
          0% { transform: translate(0px, 0px); }
          24% { transform: translate(35px, 45px); }
          48% { transform: translate(-30px, 70px); }
          75% { transform: translate(25px, -25px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes macroOrbit8 {
          0% { transform: translate(0px, 0px); }
          30% { transform: translate(-40px, -35px); }
          60% { transform: translate(35px, 40px); }
          85% { transform: translate(-20px, 25px); }
          100% { transform: translate(0px, 0px); }
        }

        /* ===================== COPRIME MICRO MEANDER KEYFRAMES (BREATHING & ROTATION) ===================== */
        @keyframes microMeander1 {
          0%, 100% { transform: translate(0px, 0px) scale(0.9) rotate(0deg); opacity: 0.7; }
          33% { transform: translate(12px, -15px) scale(1.25) rotate(60deg); opacity: 1; }
          66% { transform: translate(-15px, 12px) scale(0.7) rotate(120deg); opacity: 0.45; }
        }

        @keyframes microMeander2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.1) rotate(0deg); opacity: 0.85; }
          33% { transform: translate(-14px, 14px) scale(0.75) rotate(-55deg); opacity: 0.5; }
          66% { transform: translate(16px, -12px) scale(1.2) rotate(-110deg); opacity: 0.95; }
        }

        @keyframes microMeander3 {
          0%, 100% { transform: translate(0px, 0px) scale(0.85) rotate(0deg); opacity: 0.65; }
          40% { transform: translate(15px, 12px) scale(1.2) rotate(70deg); opacity: 1; }
          75% { transform: translate(-12px, -14px) scale(0.65) rotate(140deg); opacity: 0.4; }
        }

        @keyframes microMeander4 {
          0%, 100% { transform: translate(0px, 0px) scale(1.05) rotate(0deg); opacity: 0.9; }
          35% { transform: translate(-15px, -12px) scale(0.7) rotate(-65deg); opacity: 0.5; }
          70% { transform: translate(14px, 15px) scale(1.15) rotate(-130deg); opacity: 0.95; }
        }

        @keyframes microMeander5 {
          0%, 100% { transform: translate(0px, 0px) scale(0.8) rotate(0deg); opacity: 0.6; }
          45% { transform: translate(14px, -16px) scale(1.2) rotate(80deg); opacity: 0.95; }
          80% { transform: translate(-12px, 12px) scale(0.65) rotate(160deg); opacity: 0.35; }
        }

        @keyframes microMeander6 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); opacity: 0.75; }
          40% { transform: translate(-12px, -15px) scale(0.75) rotate(-75deg); opacity: 0.45; }
          80% { transform: translate(16px, 14px) scale(1.25) rotate(-150deg); opacity: 1; }
        }

        @keyframes microMeander7 {
          0%, 100% { transform: translate(0px, 0px) scale(0.75) rotate(0deg); opacity: 0.55; }
          50% { transform: translate(15px, 15px) scale(1.15) rotate(90deg); opacity: 0.95; }
        }

        @keyframes microMeander8 {
          0%, 100% { transform: translate(0px, 0px) scale(0.7) rotate(0deg); opacity: 0.5; }
          50% { transform: translate(-14px, -12px) scale(1.1) rotate(-85deg); opacity: 0.9; }
        }
      `}</style>

      <defs>
        {/* Soft Aquamarine Halo */}
        <radialGradient id="haloCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#67E8F9" stopOpacity="0.75" />
          <stop offset="65%" stopColor="#06B6D4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>

        {/* Soft Champagne Gold Halo */}
        <radialGradient id="haloGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="65%" stopColor="#EAB308" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
        </radialGradient>

        {/* 4-Pointed Shoujo Anime Diamond Star Symbol (✦) */}
        <path
          id="shoujoDiamondStar"
          d="M 0,-24 Q 0,0 24,0 Q 0,0 0,24 Q 0,0 -24,0 Q 0,0 0,-24 Z"
        />
      </defs>

      {/* 1. Particle at Upper Right Hair / Shoulder (Cyan) */}
      <g
        transform={`translate(${isHovered ? 590 : 555}, ${isHovered ? 335 : 355})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit1_13.7s_ease-in-out_infinite]">
          <g className="animate-[microMeander1_6.1s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="22" fill="url(#haloCyan)" />
            <use href="#shoujoDiamondStar" fill="#E0F2FE" stroke="#38BDF8" strokeWidth={1.2} transform="scale(0.48)" />
            <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 2. Particle at Mid-Left Waist / Sleeve (Gold) */}
      <g
        transform={`translate(${isHovered ? 140 : 175}, ${isHovered ? 545 : 565})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit2_15.1s_ease-in-out_infinite]">
          <g className="animate-[microMeander2_6.7s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="24" fill="url(#haloGold)" />
            <use href="#shoujoDiamondStar" fill="#FEF9C3" stroke="#FACC15" strokeWidth={1.2} transform="scale(0.52)" />
            <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 3. Particle at Mid-Right Hip / Skirt Fold (Gold) */}
      <g
        transform={`translate(${isHovered ? 600 : 565}, ${isHovered ? 615 : 635})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit3_12.9s_ease-in-out_infinite]">
          <g className="animate-[microMeander3_5.9s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="22" fill="url(#haloGold)" />
            <use href="#shoujoDiamondStar" fill="#FEF9C3" stroke="#FBBF24" strokeWidth={1.2} transform="scale(0.48)" />
            <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 4. Particle at Lower-Left Skirt Flare (Cyan) */}
      <g
        transform={`translate(${isHovered ? 160 : 195}, ${isHovered ? 815 : 790})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit4_14.3s_ease-in-out_infinite]">
          <g className="animate-[microMeander4_6.3s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="22" fill="url(#haloCyan)" />
            <use href="#shoujoDiamondStar" fill="#CFFAFE" stroke="#22D3EE" strokeWidth={1.2} transform="scale(0.5)" />
            <circle cx="0" cy="0" r="2.3" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 5. Particle at Lower-Right Skirt Hem (Gold) */}
      <g
        transform={`translate(${isHovered ? 580 : 545}, ${isHovered ? 835 : 815})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit5_13.3s_ease-in-out_infinite]">
          <g className="animate-[microMeander5_5.7s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="22" fill="url(#haloGold)" />
            <use href="#shoujoDiamondStar" fill="#FEF9C3" stroke="#F59E0B" strokeWidth={1.2} transform="scale(0.46)" />
            <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 6. Particle Floating Below Center Hem (White Starlight) */}
      <g
        transform={`translate(368, ${isHovered ? 940 : 915})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit6_16.1s_ease-in-out_infinite]">
          <g className="animate-[microMeander6_7.1s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="20" fill="url(#haloCyan)" />
            <use href="#shoujoDiamondStar" fill="#FFFFFF" stroke="#67E8F9" strokeWidth={1} transform="scale(0.42)" />
            <circle cx="0" cy="0" r="2.0" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 7. Extra Fairy Speck at Upper-Left Hair Lock (Cyan) */}
      <g
        transform={`translate(${isHovered ? 180 : 210}, ${isHovered ? 315 : 335})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit7_11.9s_ease-in-out_infinite]">
          <g className="animate-[microMeander7_5.3s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="18" fill="url(#haloCyan)" />
            <use href="#shoujoDiamondStar" fill="#E0F2FE" stroke="#38BDF8" strokeWidth={1} transform="scale(0.38)" />
            <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* 8. Floating Micro Starlight Fleck Near Chest / Upper Skirt (Gold) */}
      <g
        transform={`translate(${isHovered ? 490 : 475}, ${isHovered ? 435 : 455})`}
        style={{ transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <g className="animate-[macroOrbit8_12.3s_ease-in-out_infinite]">
          <g className="animate-[microMeander8_5.1s_ease-in-out_infinite]">
            <circle cx="0" cy="0" r="16" fill="url(#haloGold)" />
            <use href="#shoujoDiamondStar" fill="#FEF9C3" stroke="#FACC15" strokeWidth={1} transform="scale(0.34)" />
            <circle cx="0" cy="0" r="1.6" fill="#FFFFFF" />
          </g>
        </g>
      </g>
    </g>
  );
}
