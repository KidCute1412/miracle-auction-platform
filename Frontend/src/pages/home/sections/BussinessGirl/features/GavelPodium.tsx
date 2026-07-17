import React from "react";

interface GavelPodiumProps {
  isStriking: boolean;
  isRippling: boolean;
  isCharging: boolean;
  chargeProgress: number;
  onGavelMouseDown: (e: React.MouseEvent) => void;
  onGavelMouseUp: (e: React.MouseEvent) => void;
  onGavelMouseLeave: (e: React.MouseEvent) => void;
}

export const GavelPodium: React.FC<GavelPodiumProps> = ({
  isStriking,
  isRippling,
  isCharging,
  chargeProgress,
  onGavelMouseDown,
  onGavelMouseUp,
  onGavelMouseLeave,
}) => {
  // Gavel state class determination
  let gavelClass = "gavel-idle";
  if (isStriking) {
    gavelClass = "gavel-animate";
  } else if (isCharging) {
    gavelClass = "gavel-charging";
  }

  return (
    <g className="transition-transform duration-300">
      {/* 3D Glass Table Top */}
      <polygon points="5,100 95,100 85,118 15,118" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
      <line x1="5" y1="100" x2="95" y2="100" stroke="url(#goldGrad)" strokeWidth="1.5" />
      <line x1="20" y1="118" x2="20" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <line x1="80" y1="118" x2="80" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />

      {/* Ripple Effects on Impact */}
      {isRippling && (
        <g>
          {chargeProgress >= 90 ? (
            /* Mega Quantum Shockwave Ripple - Multi-color */
            <g>
              <ellipse cx="81.5" cy="115" rx="2" ry="0.6" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" className="animate-ripple-quantum" />
              <ellipse cx="81.5" cy="115" rx="2" ry="0.6" fill="none" stroke="#f43f5e" strokeWidth="1.0" className="animate-ripple-quantum" style={{ animationDelay: "0.15s" }} />
              <ellipse cx="81.5" cy="115" rx="2" ry="0.6" fill="none" stroke="#22d3ee" strokeWidth="0.8" className="animate-ripple-quantum" style={{ animationDelay: "0.3s" }} />
            </g>
          ) : (
            /* Normal Ripple */
            <>
              <ellipse cx="81.5" cy="115" rx="2" ry="0.6" fill="none" stroke="url(#goldGrad)" strokeWidth="0.8" opacity="0.8" className="animate-ripple-1" />
              <ellipse cx="81.5" cy="115" rx="2" ry="0.6" fill="none" stroke="url(#goldGrad)" strokeWidth="0.5" opacity="0.6" className="animate-ripple-2" />
            </>
          )}
        </g>
      )}

      {/* Gavel and sound block trigger */}
      <g 
        transform="translate(73, 102) scale(0.85)"
        onMouseDown={onGavelMouseDown}
        onMouseUp={onGavelMouseUp}
        onMouseLeave={onGavelMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer select-none"
      >
        {/* 3D Elite Wood Podium Base */}
        <path d="M 2 15 C 2 13.5, 18 13.5, 18 15 L 18 18 C 18 19.5, 2 19.5, 2 18 Z" fill="#334155" stroke="#1e293b" strokeWidth="0.4" />
        <ellipse cx="10" cy="15" rx="8" ry="2" fill="url(#goldGrad)" />
        <ellipse cx="10" cy="14" rx="7" ry="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.3" />

        {/* Gavel Hammer */}
        <g className={gavelClass}>
          {/* Hammer Head */}
          <path d="M 3 6 L 6 7 L 6 12 L 3 13 Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="0.3" />
          <path d="M 17 6 L 14 7 L 14 12 L 17 13 Z" fill="url(#goldGrad)" stroke="#78350f" strokeWidth="0.3" />
          <rect x="6" y="6.8" width="8" height="5.4" fill="#451a03" stroke="#1e293b" strokeWidth="0.3" rx="0.5" />
          <rect x="9.5" y="6.8" width="1" height="5.4" fill="url(#goldGrad)" />

          {/* Hammer Handle */}
          <rect x="9.5" y="12.5" width="1" height="10.5" fill="#451a03" stroke="#1e293b" strokeWidth="0.3" rx="0.2" />
          <rect x="9" y="21" width="2" height="2" fill="url(#goldGrad)" rx="0.2" />
        </g>

        {/* Sparkle burst on Normal strike */}
        {isStriking && chargeProgress < 90 && (
          <g className="sparkle-burst">
            <path d="M 3 5 L 3.5 6.5 L 5 7 L 3.5 7.5 L 3 9 L 2.5 7.5 L 1 7 L 2.5 6.5 Z" fill="url(#goldGrad)" />
            <path d="M 17 5 L 17.5 6.5 L 19 7 L 17.5 7.5 L 17 9 L 16.5 7.5 L 15 7 L 16.5 6.5 Z" fill="url(#goldGrad)" />
            <path d="M -2 10.5 L -1.7 11.5 L -0.5 12 L -1.7 12.5 L -2 13.5 L -2.3 12.5 L -3.5 12 L -2.3 11.5 Z" fill="url(#goldGrad)" />
            <path d="M 22 10.5 L 22.3 11.5 L 23.5 12 L 22.3 12.5 L 22 13.5 L 21.7 12.5 L 20.5 12 L 21.7 11.5 Z" fill="url(#goldGrad)" />
          </g>
        )}

        {/* Multi-color Sparkle burst on Quantum strike */}
        {isStriking && chargeProgress >= 90 && (
          <g className="sparkle-burst">
            <path d="M 3 5 L 3.5 6.5 L 5 7 L 3.5 7.5 L 3 9 L 2.5 7.5 L 1 7 L 2.5 6.5 Z" fill="url(#goldGrad)" filter="url(#laserGlow)" />
            <path d="M 17 5 L 17.5 6.5 L 19 7 L 17.5 7.5 L 17 9 L 16.5 7.5 L 15 7 L 16.5 6.5 Z" fill="#f43f5e" filter="url(#laserGlow)" />
            <path d="M -2 10.5 L -1.7 11.5 L -0.5 12 L -1.7 12.5 L -2 13.5 L -2.3 12.5 L -3.5 12 L -2.3 11.5 Z" fill="#22d3ee" filter="url(#laserGlow)" />
            <path d="M 22 10.5 L 22.3 11.5 L 23.5 12 L 22.3 12.5 L 22 13.5 L 21.7 12.5 L 20.5 12 L 21.7 11.5 Z" fill="#a78bfa" filter="url(#laserGlow)" />
          </g>
        )}
      </g>

      {/* Floating Quantum Particles during Charging */}
      {isCharging && (
        <g opacity="0.85">
          {[...Array(5)].map((_, i) => {
            const delay = `${i * 0.15}s`;
            const pathId = `particlePath-${i}`;
            const paths = [
              "M 50,110 Q 65,100 81,108",
              "M 95,95 Q 90,105 81,108",
              "M 65,115 Q 75,120 81,108",
              "M 90,118 Q 85,112 81,108",
              "M 75,98 Q 78,103 81,108"
            ];
            return (
              <g key={i}>
                <path id={pathId} d={paths[i]} fill="none" stroke="none" />
                <circle r="0.8" fill="#22d3ee" filter="url(#laserGlow)">
                  <animateMotion dur="0.7s" repeatCount="indefinite" begin={delay}>
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin={delay} />
                </circle>
              </g>
            );
          })}
        </g>
      )}

      {/* Charging Progress Bar Gauge under Gavel */}
      {isCharging && (
        <g>
          {/* Background track line */}
          <line x1="72" y1="120" x2="90" y2="120" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.2" strokeLinecap="round" />
          {/* Active progress neon line */}
          <line 
            x1="72" 
            y1="120" 
            x2={72 + (18 * chargeProgress) / 100} 
            y2="120" 
            stroke={chargeProgress >= 90 ? "#22d3ee" : "#fda4af"} 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            filter="url(#laserGlow)"
            className="transition-all duration-75"
          />
          {/* Glow indicator at 100% */}
          {chargeProgress >= 95 && (
            <circle cx="90" cy="120" r="1.5" fill="#22d3ee" filter="url(#laserGlow)" />
          )}
        </g>
      )}
    </g>
  );
};
