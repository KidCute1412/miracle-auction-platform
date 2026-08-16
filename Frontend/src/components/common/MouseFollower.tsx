import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TrailPoint {
  x: number;
  y: number;
  age: number; // 0 to 1
  size: number;
}

interface SparkleParticle {
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
    // Disable on touch devices or reduced motion preference
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isLoopActive = false;

    const trail: TrailPoint[] = [];
    const particles: SparkleParticle[] = [];
    const pulses: ClickPulse[] = [];

    const mouse = {
      x: -100,
      y: -100,
      lastX: -100,
      lastY: -100,
      speed: 0,
      isOffScreen: true,
      lastActiveTime: 0,
    };

    const isDark = theme === "dark";

    // Luxury Vanguard Palette: Champagne Gold & Diamond Shimmer
    const colors = isDark
      ? {
          core: "rgba(255, 235, 170, 0.95)",
          halo: "rgba(226, 184, 59, 0.2)",
          trailGlow: "rgba(226, 184, 59, 0.45)",
          trailLine: "rgba(255, 235, 170, 0.8)",
          sparkles: [
            "rgba(255, 255, 255, 0.95)", // Pure Diamond
            "rgba(245, 218, 140, 0.9)",  // Champagne Gold
            "rgba(226, 184, 59, 0.85)",  // Classic Gold
            "rgba(215, 175, 240, 0.75)", // Celestial Violet Tint
          ],
          pulse: "rgba(226, 184, 59, 0.55)",
        }
      : {
          core: "rgba(197, 145, 45, 0.9)",
          halo: "rgba(197, 145, 45, 0.16)",
          trailGlow: "rgba(197, 145, 45, 0.4)",
          trailLine: "rgba(197, 145, 45, 0.75)",
          sparkles: [
            "rgba(197, 145, 45, 0.95)",  // Warm Gold
            "rgba(160, 110, 30, 0.85)",  // Classic Bronze
            "rgba(230, 180, 70, 0.9)",   // Radiant Gold
            "rgba(120, 90, 200, 0.7)",   // Indigo Tint
          ],
          pulse: "rgba(197, 145, 45, 0.5)",
        };

    // Resize canvas with DPI scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a sparkling star or micro-dust particle
    const createParticle = (x: number, y: number, forceStar = false): SparkleParticle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.4 + 0.15;
      const isStar = forceStar || Math.random() < 0.25;
      const color = colors.sparkles[Math.floor(Math.random() * colors.sparkles.length)];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.15, // Slight floating air drift
        size: isStar ? Math.random() * 2.5 + 2.0 : Math.random() * 1.4 + 0.8,
        alpha: 1,
        decay: isStar ? Math.random() * 0.025 + 0.025 : Math.random() * 0.04 + 0.03,
        color,
        isStar,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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
        const innerX = Math.cos(innerAngle) * (size * 0.22);
        const innerY = Math.sin(innerAngle) * (size * 0.22);

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
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Age and clean trail
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 0.06;
        if (trail[i].age >= 1) {
          trail.splice(i, 1);
        }
      }

      // 1. Draw Fluid Luminous Trail Ribbon
      if (trail.length >= 2) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Draw points starting from current mouse head to older trail points
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const nextPt = trail[i + 1];
          const midX = (pt.x + nextPt.x) / 2;
          const midY = (pt.y + nextPt.y) / 2;

          const progress = 1 - pt.age;
          if (progress <= 0) continue;

          // Outer Glow
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, midX, midY);
          ctx.lineWidth = Math.max(0.5, (1 - i / trail.length) * 4 * progress);
          ctx.strokeStyle = colors.trailGlow;
          ctx.globalAlpha = Math.max(0, progress * 0.4);
          ctx.stroke();

          // Inner Core Line
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.quadraticCurveTo(pt.x, pt.y, midX, midY);
          ctx.lineWidth = Math.max(0.4, (1 - i / trail.length) * 1.6 * progress);
          ctx.strokeStyle = colors.trailLine;
          ctx.globalAlpha = Math.max(0, progress * 0.85);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Draw Soft Glow Halo & Glint at Cursor Position
      if (!mouse.isOffScreen && mouse.x > 0 && mouse.y > 0) {
        const dynamicHaloRadius = Math.min(16, 6 + mouse.speed * 0.3);
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
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 3. Draw Click Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += (pulse.maxRadius - pulse.radius) * 0.15 + 0.6;
        pulse.alpha -= 0.045;

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

      // 4. Draw Shimmering Sparkles & Diamond Stars
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

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;

        if (p.isStar) {
          drawStar(p.x, p.y, p.size * (p.alpha > 0.5 ? 1 : p.alpha * 1.8), p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();

      // Idle sleep check
      const isIdle =
        Date.now() - mouse.lastActiveTime > 300 &&
        trail.length === 0 &&
        particles.length === 0 &&
        pulses.length === 0;

      if (isIdle) {
        isLoopActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      const clientX = e.clientX;
      const clientY = e.clientY;
      const now = Date.now();
      mouse.lastActiveTime = now;

      if (mouse.isOffScreen || mouse.lastX === -100) {
        mouse.isOffScreen = false;
        mouse.lastX = clientX;
        mouse.lastY = clientY;
      }

      const dx = clientX - mouse.lastX;
      const dy = clientY - mouse.lastY;
      const dist = Math.hypot(dx, dy);

      mouse.speed = dist;
      mouse.x = clientX;
      mouse.y = clientY;

      // Add to trail
      if (dist >= 3) {
        trail.unshift({
          x: clientX,
          y: clientY,
          age: 0,
          size: Math.min(4, Math.max(1.5, dist * 0.1)),
        });

        // Limit trail length
        if (trail.length > 16) {
          trail.pop();
        }

        // Spawn particles along the movement line
        if (dist >= 12 && particles.length < 30) {
          const count = Math.min(2, Math.max(1, Math.floor(dist / 20)));
          for (let k = 1; k <= count; k++) {
            const ratio = k / count;
            const px = mouse.lastX + dx * ratio + (Math.random() - 0.5) * 2;
            const py = mouse.lastY + dy * ratio + (Math.random() - 0.5) * 2;
            particles.push(createParticle(px, py));
          }
        }

        mouse.lastX = clientX;
        mouse.lastY = clientY;
      }

      startLoopIfNeeded();
    };

    // Click handler
    const handleMouseDown = (e: MouseEvent) => {
      pulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 3,
        maxRadius: 26,
        alpha: 0.8,
      });

      for (let i = 0; i < 3; i++) {
        particles.push(createParticle(e.clientX, e.clientY, true));
      }

      startLoopIfNeeded();
    };

    const handleMouseLeave = () => {
      mouse.isOffScreen = true;
      mouse.lastX = -100;
      mouse.lastY = -100;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouse.isOffScreen = false;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
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
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default MouseFollower;

