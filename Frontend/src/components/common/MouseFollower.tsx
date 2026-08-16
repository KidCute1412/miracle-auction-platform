import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TrailPoint {
  x: number;
  y: number;
  age: number; // 0 (new) to 1 (old)
  vx: number;
  vy: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
}

interface ClickPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const MouseFollower: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Disable on mobile / touch devices for maximum battery and performance
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isLoopActive = false;

    // High-DPI scaling factor
    let dpr = window.devicePixelRatio || 1;

    const trail: TrailPoint[] = [];
    const particles: SparkleParticle[] = [];
    const pulses: ClickPulse[] = [];

    const mouse = {
      x: -100,
      y: -100,
      targetX: -100,
      targetY: -100,
      vx: 0,
      vy: 0,
      speed: 0,
      isHovering: false,
      isOffScreen: true,
      lastMoveTime: 0,
    };

    const isDark = theme === "dark";

    // Luxury Vanguard Palette: Champagne Gold, Diamond Light, Celestial Glow
    const darkPalette = {
      core: "rgba(255, 235, 170, 0.9)",
      halo: "rgba(226, 184, 59, 0.22)",
      trailGlow: "rgba(226, 184, 59, 0.4)",
      trailEnd: "rgba(180, 130, 240, 0)",
      sparkles: [
        "rgba(255, 255, 255, 0.95)", // Diamond Sparkle
        "rgba(245, 218, 140, 0.9)",  // Champagne Gold
        "rgba(226, 184, 59, 0.85)",  // Classic Gold
        "rgba(215, 175, 240, 0.75)", // Celestial Violet
      ],
      pulse: "rgba(226, 184, 59, 0.5)",
    };

    const lightPalette = {
      core: "rgba(197, 145, 45, 0.85)",
      halo: "rgba(197, 145, 45, 0.15)",
      trailGlow: "rgba(197, 145, 45, 0.35)",
      trailEnd: "rgba(140, 95, 210, 0)",
      sparkles: [
        "rgba(197, 145, 45, 0.9)",   // Warm Amber Gold
        "rgba(160, 110, 30, 0.85)",  // Classic Bronze
        "rgba(230, 180, 70, 0.9)",   // Radiant Gold
        "rgba(120, 90, 200, 0.7)",   // Indigo Tint
      ],
      pulse: "rgba(197, 145, 45, 0.45)",
    };

    const colors = isDark ? darkPalette : lightPalette;

    // Resize handler with High-DPI support
    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a sparkling star or micro-dust particle
    const createParticle = (x: number, y: number, vxOffset = 0, vyOffset = 0, forceStar = false): SparkleParticle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.8 + 0.3;
      const isStar = forceStar || Math.random() < 0.28; // ~28% chance of diamond sparkle star
      const color = colors.sparkles[Math.floor(Math.random() * colors.sparkles.length)];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed + vxOffset * 0.08,
        vy: Math.sin(angle) * speed + vyOffset * 0.08 - 0.15, // Subtle upward floating drift
        size: isStar ? Math.random() * 2.8 + 2.2 : Math.random() * 1.4 + 0.8,
        alpha: 1,
        maxAlpha: Math.random() * 0.3 + 0.7,
        decay: isStar ? Math.random() * 0.025 + 0.025 : Math.random() * 0.04 + 0.035,
        color,
        isStar,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.12,
      };
    };

    // Draw 4-point diamond sparkle star
    const drawStar = (cx: number, cy: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const outerX = Math.cos(angle) * size;
        const outerY = Math.sin(angle) * size;
        const innerAngle = angle + Math.PI / 4;
        const innerX = Math.cos(innerAngle) * (size * 0.24);
        const innerY = Math.sin(innerAngle) * (size * 0.24);

        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Smooth mouse interpolation (lerp)
      const lerpFactor = 0.35;
      const prevX = mouse.x;
      const prevY = mouse.y;
      mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
      mouse.y += (mouse.targetY - mouse.y) * lerpFactor;

      const dx = mouse.x - prevX;
      const dy = mouse.y - prevY;
      mouse.vx = dx;
      mouse.vy = dy;
      mouse.speed = Math.hypot(dx, dy);

      // Update and append to luminous trail when cursor moves
      if (!mouse.isOffScreen && (mouse.speed > 0.4 || trail.length === 0)) {
        trail.unshift({
          x: mouse.x,
          y: mouse.y,
          age: 0,
          vx: dx,
          vy: dy,
        });
      }

      // Limit trail length for tight performance (max 18 points)
      if (trail.length > 18) {
        trail.pop();
      }

      // Age existing trail points
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 0.07;
        if (trail[i].age >= 1) {
          trail.splice(i, 1);
        }
      }

      // 1. Render Fluid Luminous Ribbon Trail
      if (trail.length >= 3) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Multi-segment quadratic curve trail
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const nextPt = trail[i + 1];
          const midX = (pt.x + nextPt.x) / 2;
          const midY = (pt.y + nextPt.y) / 2;

          const progress = 1 - pt.age; // 1 down to 0
          if (progress <= 0) continue;

          // Outer soft glow layer
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, midX, midY);
          ctx.lineWidth = Math.max(0.5, (1 - i / trail.length) * 4.5 * progress);
          ctx.strokeStyle = colors.trailGlow;
          ctx.globalAlpha = Math.max(0, progress * 0.45);
          ctx.stroke();

          // Inner luminous core line
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, midX, midY);
          ctx.lineWidth = Math.max(0.4, (1 - i / trail.length) * 1.8 * progress);
          ctx.strokeStyle = colors.core;
          ctx.globalAlpha = Math.max(0, progress * 0.85);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Render Soft Glowing Cursor Halo at head
      if (!mouse.isOffScreen && trail.length > 0) {
        const dynamicHaloRadius = Math.min(18, 7 + mouse.speed * 0.4);
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          dynamicHaloRadius
        );
        gradient.addColorStop(0, colors.halo);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, dynamicHaloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pinpoint Core Glint
        ctx.fillStyle = colors.core;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 3. Render Click Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += (pulse.maxRadius - pulse.radius) * 0.15 + 0.5;
        pulse.alpha -= 0.04;

        if (pulse.alpha <= 0 || pulse.radius >= pulse.maxRadius) {
          pulses.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.pulse;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = pulse.alpha;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Shimmering Stardust & Twinkle Stars
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const renderAlpha = Math.max(0, Math.min(1, p.alpha * p.maxAlpha));
        ctx.save();
        ctx.globalAlpha = renderAlpha;
        ctx.fillStyle = p.color;

        if (p.isStar) {
          drawStar(p.x, p.y, p.size * (p.alpha > 0.5 ? 1 : p.alpha * 2), p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Sleep animation loop when idle and empty to save 100% CPU/GPU
      const isIdle =
        Date.now() - mouse.lastMoveTime > 400 &&
        trail.length === 0 &&
        particles.length === 0 &&
        pulses.length === 0;

      if (isIdle) {
        isLoopActive = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopActive) {
        isLoopActive = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      mouse.lastMoveTime = now;

      if (mouse.isOffScreen) {
        mouse.isOffScreen = false;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }

      const prevTargetX = mouse.targetX;
      const prevTargetY = mouse.targetY;

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      const dist = Math.hypot(mouse.targetX - prevTargetX, mouse.targetY - prevTargetY);

      // Spawn soft particles dynamically along movement path
      if (dist >= 14 && particles.length < 35) {
        const spawnCount = Math.min(3, Math.max(1, Math.floor(dist / 22)));
        const vx = (mouse.targetX - prevTargetX) / spawnCount;
        const vy = (mouse.targetY - prevTargetY) / spawnCount;

        for (let k = 1; k <= spawnCount; k++) {
          const ratio = k / spawnCount;
          const ix = prevTargetX + (mouse.targetX - prevTargetX) * ratio;
          const iy = prevTargetY + (mouse.targetY - prevTargetY) * ratio;

          // Scatter slightly around trail
          const spread = 2.5;
          const sx = ix + (Math.random() - 0.5) * spread;
          const sy = iy + (Math.random() - 0.5) * spread;

          particles.push(createParticle(sx, sy, vx, vy));
        }
      }

      startLoopIfNeeded();
    };

    // Subtle micro-burst on click
    const handleMouseDown = (e: MouseEvent) => {
      pulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 28,
        alpha: 0.8,
      });

      // Scatter a few diamond sparkles around click point
      for (let i = 0; i < 4; i++) {
        particles.push(createParticle(e.clientX, e.clientY, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, true));
      }

      startLoopIfNeeded();
    };

    const handleMouseLeave = () => {
      mouse.isOffScreen = true;
    };

    const handleMouseEnter = () => {
      mouse.isOffScreen = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
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

export default MouseFollower;

