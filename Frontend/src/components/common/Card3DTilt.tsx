import React, { useRef, useCallback, useState, useEffect } from "react";
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
  maxTiltDeg = 6, // Subtle, refined tilt angle
  scale = 1.015, // Subtle scale
  glareOpacity = 0.08, // Muted, elegant glare
  disabled = false,
}) => {
  const [isTouchOrMobile, setIsTouchOrMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsTouchOrMobile(isTouch || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const isDisabled = disabled || isTouchOrMobile;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled || !cardRef.current) return;

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

        // Normalized offset from center (-1 to 1)
        const xPct = (mouseX / width - 0.5) * 2;
        const yPct = (mouseY / height - 0.5) * 2;

        const rotateX = -yPct * maxTiltDeg;
        const rotateY = xPct * maxTiltDeg;

        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
        cardRef.current.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";
        cardRef.current.style.willChange = "transform";

        if (glareRef.current) {
          const angle = Math.atan2(mouseY - height / 2, mouseX - width / 2) * (180 / Math.PI) + 180;
          glareRef.current.style.opacity = `${glareOpacity}`;
          glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(226, 184, 59, 0.12) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 80%)`;
          glareRef.current.style.transition = "opacity 0.3s ease-out";
        }
      });
    },
    [isDisabled, maxTiltDeg, scale, glareOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    if (isDisabled) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      cardRef.current.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
      glareRef.current.style.transition = "opacity 0.4s ease-out";
    }
  }, [isDisabled]);

  if (isDisabled) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div
      ref={cardRef}
      className={cn("relative preserve-3d group/tilt", className)}
      style={{
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Specular Glare Layer */}
      <div
        ref={glareRef}
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-30 transition-opacity"
        style={{ opacity: 0 }}
      />
      {children}
    </div>
  );
};

export default Card3DTilt;
