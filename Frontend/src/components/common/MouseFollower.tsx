import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
}

export const MouseFollower: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  
  // Track mouse coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const stateRef = useRef({
    isHovered: false,
    isTextInput: false,
    isOffScreen: true,
    opacity: 0,
  });

  useEffect(() => {
    // Disable on mobile/touch devices
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Inject global style to hide the default browser cursor completely on desktop
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    let animationFrameId: number;
    const particles: Particle[] = [];
    const ripples: ClickRipple[] = [];

    const isDark = theme === "dark";
    const shadowColor = isDark ? "rgba(230, 194, 91, 0.6)" : "rgba(180, 130, 30, 0.45)";

    const darkColors = [
      "rgba(230, 194, 91, 1)",   // Champagne Gold Accent
      "rgba(255, 239, 186, 1)",  // Light glow gold
      "rgba(212, 175, 55, 1)",    // Premium Gold
      "rgba(255, 255, 255, 0.9)"  // Sparkling white
    ];

    const lightColors = [
      "rgba(197, 150, 60, 1)",   // Rich Gold/Amber
      "rgba(139, 90, 43, 1)",    // Deep Bronze
      "rgba(218, 165, 32, 1)",   // Goldenrod
      "rgba(180, 130, 30, 0.95)" // Darker Gold for visibility
    ];

    const goldColors = isDark ? darkColors : lightColors;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      const state = stateRef.current;

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      if (state.isOffScreen) {
        state.isOffScreen = false;
      }

      // Spawn dust trail
      const dist = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
      if (dist > 8) {
        // Spawn 1-2 trail particles
        const particleCount = dist > 25 ? 2 : 1;
        for (let i = 0; i < particleCount; i++) {
          particles.push(createParticle(e.clientX, e.clientY, false));
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };

    // Helper to create particles
    const createParticle = (x: number, y: number, isBurst = false): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst 
        ? Math.random() * 3 + 1.5 
        : Math.random() * 0.8 + 0.2;
      const isStar = Math.random() > 0.6;
      
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed + (isBurst ? 0 : (Math.random() - 0.5) * 0.5),
        vy: Math.sin(angle) * speed + (isBurst ? -1 : (Math.random() - 0.5) * 0.5),
        size: isStar ? Math.random() * 4 + 3 : Math.random() * 2 + 1,
        alpha: 1,
        decay: isBurst ? Math.random() * 0.02 + 0.015 : Math.random() * 0.025 + 0.015,
        color,
        isStar,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        gravity: isBurst ? 0.05 : 0.01,
      };
    };

    // Handle clicks for burst effect & shockwave ripple
    const handleMouseDown = (e: MouseEvent) => {
      const state = stateRef.current;
      if (state.isOffScreen) return;

      // Add a shockwave ripple
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: state.isHovered ? 40 : 28,
        alpha: 0.8,
        decay: 0.04,
      });

      // Add golden star burst particles
      const burstCount = 12 + Math.floor(Math.random() * 8);
      for (let i = 0; i < burstCount; i++) {
        particles.push(createParticle(e.clientX, e.clientY, true));
      }
    };

    // Handle element hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card"
      );
      
      if (interactive) {
        stateRef.current.isHovered = true;
        // Check if it's a text input or textarea
        stateRef.current.isTextInput = !!interactive.closest("input, textarea");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card"
      );

      if (interactive) {
        stateRef.current.isHovered = false;
        stateRef.current.isTextInput = false;
      }
    };

    const handleMouseLeave = () => {
      stateRef.current.isOffScreen = true;
    };

    const handleMouseEnter = () => {
      stateRef.current.isOffScreen = false;
    };

    // Attach listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Draw star helper
    const drawStarShape = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      
      c.shadowBlur = isDark ? 4 : 2;
      c.shadowColor = shadowColor;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Draw a tiny decorative star/diamond next to the cursor when hovering
    const drawMiniStar = (c: CanvasRenderingContext2D, cx: number, cy: number, color: string) => {
      c.save();
      c.fillStyle = color;
      
      // Shadow for star
      if (!isDark) {
        c.shadowBlur = 2;
        c.shadowColor = "rgba(0, 0, 0, 0.15)";
      }

      c.beginPath();
      c.moveTo(cx, cy - 5);
      c.lineTo(cx + 3.5, cy);
      c.lineTo(cx, cy + 5);
      c.lineTo(cx - 3.5, cy);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Draw custom luxury cursor chevron (improved light mode and angle rotation)
    const drawCustomCursor = (c: CanvasRenderingContext2D, x: number, y: number, scale = 1.0, isHovered = false) => {
      c.save();
      
      // Translate to cursor tip and apply rotation if hovering (pivots chevron slightly)
      c.translate(x, y);
      if (isHovered) {
        c.rotate(-15 * Math.PI / 180);
      }
      
      // Set premium drop shadow
      if (isDark) {
        c.shadowBlur = isHovered ? 12 : 8;
        c.shadowColor = shadowColor;
      } else {
        // High-end dark drop shadow for Light Mode (Titanium Alabaster White background contrast)
        c.shadowBlur = isHovered ? 6 : 4;
        c.shadowColor = "rgba(0, 0, 0, 0.18)";
        c.shadowOffsetX = 1.2;
        c.shadowOffsetY = 2.0;
      }
      
      // Draw Chevron Arrow Path
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(22 * scale, 7 * scale);
      c.lineTo(8 * scale, 8 * scale);
      c.lineTo(7 * scale, 22 * scale);
      c.closePath();

      // Configure beautiful premium theme colors
      if (isDark) {
        // Dark Mode: Solid golden fill, white border outline
        c.fillStyle = isHovered ? "rgba(255, 235, 160, 1)" : "rgba(230, 194, 91, 1)";
        c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.95)";
      } else {
        // Light Mode: Premium Ivory/Alabaster white fill, golden border outline (Stunning & contrasty)
        c.fillStyle = isHovered ? "rgba(255, 255, 255, 1)" : "rgba(253, 248, 235, 0.98)";
        c.fill();
        c.strokeStyle = isHovered ? "rgba(180, 130, 30, 1)" : "rgba(197, 150, 60, 0.95)";
      }

      c.lineWidth = 1.35 * scale;
      c.stroke();
      c.restore();

      // Draw a tiny sparkling diamond next to the pointer when hovering
      if (isHovered) {
        const starX = x + 16 * scale;
        const starY = y + 16 * scale;
        drawMiniStar(c, starX, starY, isDark ? "rgba(230, 194, 91, 0.95)" : "rgba(180, 130, 30, 0.95)");
      }
    };

    // Draw custom luxury I-Beam for text input elements
    const drawIBeamCursor = (c: CanvasRenderingContext2D, x: number, y: number) => {
      c.save();
      
      if (isDark) {
        c.strokeStyle = "rgba(255, 235, 160, 1)";
        c.shadowBlur = 6;
        c.shadowColor = shadowColor;
      } else {
        c.strokeStyle = "rgba(139, 90, 43, 1)"; // Warm dark bronze for high light-mode contrast
        c.shadowBlur = 3;
        c.shadowColor = "rgba(0, 0, 0, 0.15)";
        c.shadowOffsetX = 0.5;
        c.shadowOffsetY = 1.0;
      }

      c.lineWidth = 1.8;
      c.beginPath();
      // Top horizontal cap
      c.moveTo(x - 4, y - 8);
      c.lineTo(x + 4, y - 8);
      // Center vertical bar
      c.moveTo(x, y - 8);
      c.lineTo(x, y + 8);
      // Bottom horizontal cap
      c.moveTo(x - 4, y + 8);
      c.lineTo(x + 4, y + 8);
      
      c.stroke();
      c.restore();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const state = stateRef.current;

      // Handle visibility fade
      if (state.isOffScreen) {
        state.opacity = Math.max(0, state.opacity - 0.08);
      } else {
        state.opacity = Math.min(1, state.opacity + 0.08);
      }

      // 1. Draw click shockwave ripples
      ripples.forEach((ripple, idx) => {
        ripple.radius += (ripple.maxRadius - ripple.radius) * 0.12;
        ripple.alpha -= ripple.decay;

        if (ripple.alpha <= 0) {
          ripples.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark 
          ? `rgba(230, 194, 91, ${ripple.alpha})` 
          : `rgba(180, 130, 30, ${ripple.alpha})`;
        ctx.lineWidth = 1.8;
        
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = shadowColor;
        ctx.stroke();
        ctx.restore();
      });

      // 2. Draw particle trail
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy + p.gravity;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        if (p.isStar) {
          drawStarShape(ctx, p.x, p.y, 4, p.size, p.size / 2.5, p.color, p.alpha * state.opacity, p.rotation);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha * state.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 3. Draw custom cursor at exact mouse position
      if (state.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = state.opacity;
        
        if (state.isTextInput) {
          // If hovering over an input/textarea, render the custom gold I-Beam
          drawIBeamCursor(ctx, mouse.targetX, mouse.targetY);
        } else if (state.isHovered) {
          // If hovering over buttons/links, draw pivoted larger chevron with a sparkling mini star
          drawCustomCursor(ctx, mouse.targetX, mouse.targetY, 1.35, true);
        } else {
          // Normal cursor mode
          drawCustomCursor(ctx, mouse.targetX, mouse.targetY, 1.0, false);
        }
        
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up on component unmount
    return () => {
      document.head.removeChild(styleElement);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        mixBlendMode: theme === "dark" ? "screen" : "normal",
        zIndex: 2147483647,
      }}
    />
  );
};
