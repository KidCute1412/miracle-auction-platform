import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number;
  scale?: number;
  glareOpacity?: number;
  disabled?: boolean;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = "",
  maxTiltDeg = 10,
  scale = 1.02,
  glareOpacity = 0.15,
  disabled = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalized values from -1 to 1
        const xPct = (mouseX / width - 0.5) * 2;
        const yPct = (mouseY / height - 0.5) * 2;

        const rotateX = -yPct * maxTiltDeg;
        const rotateY = xPct * maxTiltDeg;

        setStyle({
          transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
          transition: "transform 0.1s ease-out",
        });

        // Specular glare angle based on mouse coordinates
        const angle = Math.atan2(mouseY - height / 2, mouseX - width / 2) * (180 / Math.PI) + 180;
        setGlareStyle({
          opacity: glareOpacity,
          background: `linear-gradient(${angle}deg, rgba(255, 255, 255, 0.25) 0%, rgba(226, 184, 59, 0.15) 30%, transparent 80%)`,
          transition: "opacity 0.2s ease-out",
        });
      });
    },
    [disabled, maxTiltDeg, scale, glareOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    });
    setGlareStyle({
      opacity: 0,
      transition: "opacity 0.4s ease-out",
    });
  }, [disabled]);

  return (
    <div
      ref={cardRef}
      className={cn("relative preserve-3d group/tilt", className)}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Specular Glare Layer */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-30 transition-opacity"
        style={glareStyle}
      />
      {children}
    </div>
  );
};

export default Card3DTilt;
