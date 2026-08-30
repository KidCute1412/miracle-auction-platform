import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SawakoSvg from "./sawako/SawakoSvg";
import type {
  SawakoExpression,
  SawakoSymbol,
  SawakoLine,
  MascotPreferences,
} from "./sawako/types";
import {
  POKE_LINES,
  DIZZY_LINES,
  DRAG_LINES,
  DROP_LINES,
  ROUTE_LINES,
  IDLE_LINES,
} from "./sawako/sawako-dialogue";
import { X, Volume2, VolumeX, Minus, Sparkles } from "lucide-react";

const STORAGE_KEY = "sawako_mascot_prefs_v1";

const DEFAULT_PREFS: MascotPreferences = {
  minimized: false,
  muted: false,
  position: null,
};

export default function SawakoMascot() {
  const location = useLocation();

  // Preferences (persisted in localStorage)
  const [prefs, setPrefs] = useState<MascotPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFS;
  });

  // State
  const [expression, setExpression] = useState<SawakoExpression>("normal");
  const [symbol, setSymbol] = useState<SawakoSymbol>("none");
  const [currentLine, setCurrentLine] = useState<string | null>(
    "Chief Auditor Sawako on duty! Don't cause trouble, baka!",
  );
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });
  const rapidClickCountRef = useRef<number>(0);
  const resetRapidClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save preferences
  const updatePrefs = useCallback((updater: (prev: MascotPreferences) => MascotPreferences) => {
    setPrefs((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // LocalStorage fallback
      }
      return next;
    });
  }, []);

  // Display dialogue helper
  const say = useCallback(
    (line: SawakoLine, durationMs = 5000) => {
      if (prefs.muted) return;
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);

      setCurrentLine(line.text);
      setExpression(line.expression);
      setSymbol(line.symbol);
      setBubbleVisible(true);

      bubbleTimerRef.current = setTimeout(() => {
        setBubbleVisible(false);
        setSymbol("none");
        setExpression("normal");
      }, durationMs);
    },
    [prefs.muted],
  );

  // Jelly squash & stretch animation trigger
  const triggerSquashAndStretch = useCallback(() => {
    // Phase 1: Heavy squish down
    setScale({ x: 1.28, y: 0.72 });

    // Phase 2: Recoil vertical stretch
    setTimeout(() => {
      setScale({ x: 0.88, y: 1.15 });
    }, 120);

    // Phase 3: Slight bounce back
    setTimeout(() => {
      setScale({ x: 1.05, y: 0.95 });
    }, 240);

    // Phase 4: Settle
    setTimeout(() => {
      setScale({ x: 1, y: 1 });
    }, 360);
  }, []);

  // Handle poke / click
  const handlePoke = useCallback(() => {
    if (isDragging) return;

    triggerSquashAndStretch();

    // Track rapid clicks for dizziness easter egg
    rapidClickCountRef.current += 1;
    if (resetRapidClickTimerRef.current) {
      clearTimeout(resetRapidClickTimerRef.current);
    }
    resetRapidClickTimerRef.current = setTimeout(() => {
      rapidClickCountRef.current = 0;
    }, 1800);

    if (rapidClickCountRef.current >= 6) {
      // Trigger Dizzy Easter Egg!
      rapidClickCountRef.current = 0;
      const dizzyLine = DIZZY_LINES[Math.floor(Math.random() * DIZZY_LINES.length)];
      say(dizzyLine, 6000);
      return;
    }

    // Pick random poke response
    const line = POKE_LINES[Math.floor(Math.random() * POKE_LINES.length)];
    say(line, 4500);
  }, [isDragging, say, triggerSquashAndStretch]);

  // Route change awareness
  useEffect(() => {
    const routeKey = location.pathname;
    const lines = ROUTE_LINES[routeKey];
    if (lines && lines.length > 0) {
      const selected = lines[Math.floor(Math.random() * lines.length)];
      // Slight delay so route render finishes first
      const timeout = setTimeout(() => {
        say(selected, 5000);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, say]);

  // Mouse tracking for eyes and idle detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Reset idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (!prefs.minimized && !prefs.muted) {
          const idleLine = IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
          say(idleLine, 5000);
        }
      }, 35000);

      // Eye tracking
      if (!containerRef.current || prefs.minimized) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > 0) {
        // Clamp normalized offset
        const maxTrackRadius = 350;
        const factor = Math.min(1, dist / maxTrackRadius);
        setEyeOffset({
          x: (dx / dist) * factor,
          y: (dy / dist) * factor,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (resetRapidClickTimerRef.current) clearTimeout(resetRapidClickTimerRef.current);
    };
  }, [prefs.minimized, prefs.muted, say]);

  // Drag and drop handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    // Don't drag if clicking utility buttons
    if ((e.target as HTMLElement).closest("button")) return;

    setIsDragging(true);
    setScale({ x: 0.9, y: 1.12 }); // Elastic stretch while airborne

    const currentX = prefs.position?.x ?? 0;
    const currentY = prefs.position?.y ?? 0;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };

    const dragLine = DRAG_LINES[Math.floor(Math.random() * DRAG_LINES.length)];
    say(dragLine, 3000);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

      updatePrefs((p) => ({
        ...p,
        position: {
          x: dragStartRef.current.initialX + deltaX,
          y: dragStartRef.current.initialY + deltaY,
        },
      }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setIsDragging(false);

      // Jelly bounce on drop
      triggerSquashAndStretch();

      const dropLine = DROP_LINES[Math.floor(Math.random() * DROP_LINES.length)];
      say(dropLine, 3500);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Minimized Cat-Paw Badge View
  if (prefs.minimized) {
    return (
      <div
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group"
        data-testid="sawako-minimized"
      >
        <button
          onClick={() => {
            updatePrefs((p) => ({ ...p, minimized: false }));
            say({
              text: "Aha! You finally realized you can't manage this auction without me!",
              expression: "smug",
              symbol: "sparkle",
            });
          }}
          className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-zinc-950/90 px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer"
          title="Sawako is napping. Click to wake her up!"
          aria-label="Wake up Sawako the mascot"
        >
          {/* Miniature cute cat paw icon */}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-sm">
            🐾
          </span>
          <span className="hidden sm:inline font-sans tracking-wide">Sawako (Napping)</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        </button>
      </div>
    );
  }

  const posX = prefs.position?.x ?? 0;
  const posY = prefs.position?.y ?? 0;

  return (
    <aside
      ref={containerRef}
      role="complementary"
      aria-label="Sawako Admin Mascot Companion"
      data-testid="sawako-mascot-container"
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end select-none transition-opacity duration-200 ${
        isHovered ? "opacity-100" : "opacity-95"
      }`}
      style={{
        transform: `translate(${posX}px, ${posY}px)`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* ===================== SPEECH BUBBLE ===================== */}
      {bubbleVisible && currentLine && !prefs.muted && (
        <div
          data-testid="sawako-speech-bubble"
          className="relative mb-2 max-w-64 rounded-2xl border border-amber-400/30 bg-zinc-950/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200"
          style={{ transformOrigin: "bottom right" }}
        >
          <div className="flex items-start justify-between gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
              Sawako • Chief Auditor
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBubbleVisible(false);
              }}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5"
              aria-label="Dismiss speech bubble"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-100 select-text">
            {currentLine}
          </p>

          {/* Comic Bubble Pointer Tail */}
          <div className="absolute -bottom-2 right-10 h-3 w-3 rotate-45 border-r border-b border-amber-400/30 bg-zinc-950/95" />
        </div>
      )}

      {/* ===================== CHARACTER SVG & POKE AREA ===================== */}
      <div className="relative group flex flex-col items-center">
        {/* Quick Utility Control Toolbar */}
        <div
          className={`absolute -top-7 right-2 flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-900/90 px-2 py-0.5 backdrop-blur-md shadow-md transition-all duration-200 ${
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          {/* Mute dialogue button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updatePrefs((p) => ({ ...p, muted: !p.muted }));
              if (!prefs.muted) setBubbleVisible(false);
            }}
            className="p-1 text-zinc-400 hover:text-amber-300 transition-colors"
            title={prefs.muted ? "Unmute dialogue" : "Mute dialogue"}
            aria-label={prefs.muted ? "Unmute dialogue" : "Mute dialogue"}
          >
            {prefs.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </button>

          {/* Minimize to cat-paw button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updatePrefs((p) => ({ ...p, minimized: true }));
            }}
            className="p-1 text-zinc-400 hover:text-amber-300 transition-colors"
            title="Minimize to desk tray"
            aria-label="Minimize mascot"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>

        {/* Interactive Character Body */}
        <div
          data-testid="sawako-character-body"
          onClick={handlePoke}
          className="cursor-pointer focus:outline-hidden"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handlePoke();
            }
          }}
          aria-label="Poke Sawako the Mascot"
        >
          <SawakoSvg
            expression={expression}
            symbol={symbol}
            eyeOffset={eyeOffset}
            isHovered={isHovered}
            isDragging={isDragging}
            scaleX={scale.x}
            scaleY={scale.y}
          />
        </div>
      </div>
    </aside>
  );
}
