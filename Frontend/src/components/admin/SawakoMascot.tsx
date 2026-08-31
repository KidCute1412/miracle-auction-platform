import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SawakoSvg from "./sawako/SawakoSvg";
import type {
  SawakoExpression,
  SawakoSymbol,
  SawakoLine,
  SawakoTimeOfDay,
  MascotPreferences,
} from "./sawako/types";
import {
  POKE_LINES,
  HAND_POKE_LINES,
  FOOT_POKE_LINES,
  DIZZY_LINES,
  DRAG_LINES,
  DROP_LINES,
  STAR_CLIP_LINES,
  HEADPAT_LINES,
  ROUTE_LINES,
  IDLE_LINES,
} from "./sawako/sawako-dialogue";
import { sawakoSound } from "./sawako/sawako-sound";
import { useSawakoRoaming } from "./sawako/hooks/useSawakoRoaming";
import { HOURLY_THEMES, getHourlyTheme } from "./sawako/sawako-hourly-theme";
import { X, Volume2, VolumeX, Minus } from "lucide-react";

const STORAGE_KEY = "sawako_mascot_prefs_v1";

function getRealTimeOfDay(): SawakoTimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "sunset";
  return "night";
}

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
    "Sawako on duty! Don't tease me, baka~",
  );
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProtectingStar, setIsProtectingStar] = useState(false);
  const [isBeingPatted, setIsBeingPatted] = useState(false);
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());
  const [timeOfDay, setTimeOfDay] = useState<SawakoTimeOfDay>(getRealTimeOfDay);
  const [isSitting, setIsSitting] = useState(false);
  const scale = { x: 1, y: 1 };

  // Gentle autonomous roaming hook
  const {
    roamingOffsetX,
    isWalking,
    walkDirection,
    walkDurationSec,
    resetRoaming,
  } = useSawakoRoaming({
    basePosX: prefs.position?.x ?? 0,
    isDragging,
    minimized: prefs.minimized,
  });

  // Autonomous posture controller:
  // - Never sits while walking or being dragged
  // - When coming to a stop or after being dropped, stands for 4-6 seconds first ("đứng một lúc")
  // - Only sits down on a low-frequency random roll (~30% chance)
  const sittingDecisionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sittingDecisionTimerRef.current) {
      clearTimeout(sittingDecisionTimerRef.current);
      sittingDecisionTimerRef.current = null;
    }

    // While walking, dragging, or minimized: stand up immediately!
    if (isWalking || isDragging || prefs.minimized) {
      setIsSitting(false);
      return;
    }

    // Rule 1: Stand for 4 - 6 seconds first before deciding to sit down ("đứng một lúc rồi mới ngồi")
    const standDelay = 4000 + Math.random() * 2000;

    sittingDecisionTimerRef.current = setTimeout(() => {
      // Rule 2: Low-frequency random roll (30% chance to sit down and sip tea, 70% stay standing)
      const shouldSit = Math.random() < 0.3;
      if (shouldSit) {
        setIsSitting(true);
      }
    }, standDelay);

    return () => {
      if (sittingDecisionTimerRef.current) {
        clearTimeout(sittingDecisionTimerRef.current);
      }
    };
  }, [isWalking, isDragging, prefs.minimized]);

  const manualTimeResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ambient mood with real clock every 1 minute (60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      // Only sync if there is no active manual override inspection
      if (!manualTimeResetTimerRef.current) {
        const h = new Date().getHours();
        setCurrentHour(h);
        setTimeOfDay(getRealTimeOfDay());
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      if (manualTimeResetTimerRef.current) {
        clearTimeout(manualTimeResetTimerRef.current);
      }
    };
  }, []);

  // 5-second time limit for initial greeting speech bubble
  useEffect(() => {
    const initialGreetingTimer = setTimeout(() => {
      setBubbleVisible(false);
      setExpression("normal");
    }, 5000);
    return () => clearTimeout(initialGreetingTimer);
  }, []);

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
  const idleLookAroundTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const protectStarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headpatStrokeDistRef = useRef<number>(0);
  const lastHeadpatMouseXRef = useRef<number | null>(null);
  const headpatResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headpatActiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    (line: SawakoLine, durationMs = 4500) => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);

      sawakoSound.setMuted(prefs.muted);
      if (!prefs.muted) {
        sawakoSound.playChime();
      }

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

  // Handle poke / click
  const handlePoke = useCallback(() => {
    if (isDragging) return;

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
      sawakoSound.setMuted(prefs.muted);
      sawakoSound.playDizzy();
      const dizzyLine = DIZZY_LINES[Math.floor(Math.random() * DIZZY_LINES.length)];
      say(dizzyLine, 5000);
      return;
    }

    // Play cute poke squeak sound
    sawakoSound.setMuted(prefs.muted);
    sawakoSound.playPoke();

    // Pick random poke response
    const line = POKE_LINES[Math.floor(Math.random() * POKE_LINES.length)];
    say(line, 4000);
  }, [isDragging, prefs.muted, say]);

  // Interactive Hand Poke handler
  const handlePokeHand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sawakoSound.setMuted(prefs.muted);
      sawakoSound.playChime();
      const line = HAND_POKE_LINES[Math.floor(Math.random() * HAND_POKE_LINES.length)];
      say(line, 4000);
    },
    [prefs.muted, say],
  );

  // Interactive Foot Poke handler
  const handlePokeFoot = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sawakoSound.setMuted(prefs.muted);
      sawakoSound.playPoke();
      const line = FOOT_POKE_LINES[Math.floor(Math.random() * FOOT_POKE_LINES.length)];
      say(line, 4000);
    },
    [prefs.muted, say],
  );

  // Interactive Star Clip Poke handler with startled gesture & hands protecting hair
  const handlePokeStarClip = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sawakoSound.setMuted(prefs.muted);
      sawakoSound.playChime();

      // Visibly trigger hands raising to protect hair & startled hop
      setIsProtectingStar(true);
      if (protectStarTimerRef.current) clearTimeout(protectStarTimerRef.current);
      protectStarTimerRef.current = setTimeout(() => {
        setIsProtectingStar(false);
      }, 1800);

      const line = STAR_CLIP_LINES[Math.floor(Math.random() * STAR_CLIP_LINES.length)];
      say(line, 4500);
    },
    [prefs.muted, say],
  );

  // Interactive Headpat (Xoa đầu) handler with continuous stroke accumulator
  const handleHeadpatStroke = useCallback(
    (e: React.MouseEvent) => {
      const currentX = e.clientX;
      if (lastHeadpatMouseXRef.current !== null) {
        const deltaX = Math.abs(currentX - lastHeadpatMouseXRef.current);
        if (deltaX > 2 && deltaX < 50) {
          headpatStrokeDistRef.current += deltaX;
        }
      }
      lastHeadpatMouseXRef.current = currentX;

      // Reset accumulated stroke distance if paused for > 450ms
      if (headpatResetTimerRef.current) clearTimeout(headpatResetTimerRef.current);
      headpatResetTimerRef.current = setTimeout(() => {
        headpatStrokeDistRef.current = 0;
        lastHeadpatMouseXRef.current = null;
      }, 450);

      // Trigger blissful headpat when user accumulates > 80px stroke
      if (headpatStrokeDistRef.current > 80) {
        headpatStrokeDistRef.current = 0;
        if (!isBeingPatted) {
          setIsBeingPatted(true);
          sawakoSound.setMuted(prefs.muted);
          sawakoSound.playChime();
        }

        // Keep headpatting active while mouse moves, then speak sweet line when finished
        if (headpatActiveTimerRef.current) clearTimeout(headpatActiveTimerRef.current);
        headpatActiveTimerRef.current = setTimeout(() => {
          setIsBeingPatted(false);
          const line = HEADPAT_LINES[Math.floor(Math.random() * HEADPAT_LINES.length)];
          say(line, 4500);
        }, 1400);
      }
    },
    [isBeingPatted, prefs.muted, say],
  );

  // Click on weather mood to cycle through 24 hourly celestial moods (auto-resets to real-time after 1 minute)
  const handleCycleTimeOfDay = useCallback(() => {
    setCurrentHour((prevHour) => {
      const nextHour = (prevHour + 1) % 24;
      const theme = HOURLY_THEMES[nextHour] ?? getHourlyTheme(nextHour);
      setTimeOfDay(theme.category);
      say(theme.dialogue, 4500);
      sawakoSound.setMuted(prefs.muted);
      sawakoSound.playChime();

      // Schedule automatic reset to real-time clock after 1 minute (60000ms)
      if (manualTimeResetTimerRef.current) {
        clearTimeout(manualTimeResetTimerRef.current);
      }
      manualTimeResetTimerRef.current = setTimeout(() => {
        const realHour = new Date().getHours();
        setCurrentHour(realHour);
        setTimeOfDay(getRealTimeOfDay());
        manualTimeResetTimerRef.current = null;
      }, 60000);

      return nextHour;
    });
  }, [prefs.muted, say]);

  // Smart Route change awareness with prefix matching for 100% Admin pages
  useEffect(() => {
    const currentPath = location.pathname;

    let matchedLines: SawakoLine[] | undefined;

    // Check specific / trash routes first
    if (currentPath.includes("/trash")) {
      matchedLines = ROUTE_LINES["/admin/trash"];
    } else if (currentPath === "/admin" || currentPath === "/admin/dashboard") {
      matchedLines = ROUTE_LINES["/admin/dashboard"];
    } else if (currentPath.startsWith("/admin/product")) {
      matchedLines = ROUTE_LINES["/admin/product"];
    } else if (currentPath.startsWith("/admin/category")) {
      matchedLines = ROUTE_LINES["/admin/category"];
    } else if (currentPath.startsWith("/admin/user")) {
      matchedLines = ROUTE_LINES["/admin/user"];
    } else if (currentPath.startsWith("/admin/seller")) {
      matchedLines = ROUTE_LINES["/admin/seller"];
    } else if (currentPath.startsWith("/admin/visitor-analytics")) {
      matchedLines = ROUTE_LINES["/admin/visitor-analytics"];
    } else if (currentPath.startsWith("/admin/profile")) {
      matchedLines = ROUTE_LINES["/admin/profile"];
    }

    if (matchedLines && matchedLines.length > 0) {
      const selected = matchedLines[Math.floor(Math.random() * matchedLines.length)];
      // Slight delay so route render finishes first
      const timeout = setTimeout(() => {
        say(selected, 5000);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, say]);


  // Mouse tracking for eyes and infinite randomized idle loop (5s -> 15s)
  useEffect(() => {
    const clearLookAround = () => {
      idleLookAroundTimersRef.current.forEach((t) => clearTimeout(t));
      idleLookAroundTimersRef.current = [];
    };

    const scheduleNextIdle = () => {
      // Clear previous main timer before setting a new random cycle
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Random delay between 5s (5000ms) and 15s (15000ms)
      const randomDelay = 5000 + Math.random() * 10000;

      idleTimerRef.current = setTimeout(() => {
        if (prefs.minimized) {
          scheduleNextIdle();
          return;
        }

        // Randomly alternate between Look-Around (50%) and Idle Dialogue (50%)
        const behaviorRoll = Math.random();

        if (behaviorRoll < 0.5) {
          // Behavior A: Curious Look-Around
          setEyeOffset({ x: 0, y: 0 }); // Center gaze
          idleLookAroundTimersRef.current.push(
            setTimeout(() => {
              setEyeOffset({ x: -0.55, y: -0.1 }); // Glance left
            }, 800),
            setTimeout(() => {
              setEyeOffset({ x: 0.55, y: -0.1 }); // Glance right
            }, 2200),
            setTimeout(() => {
              setEyeOffset({ x: 0, y: 0 }); // Return to peaceful center
              scheduleNextIdle(); // Recurse: schedule next random idle cycle
            }, 3600),
          );
        } else {
          // Behavior B: Cute Idle Dialogue & Anime Daydreaming
          const idleLine = IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
          say(idleLine, 4500);
          idleLookAroundTimersRef.current.push(
            setTimeout(() => {
              scheduleNextIdle(); // Recurse: schedule next random idle cycle
            }, 5000),
          );
        }
      }, randomDelay);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Clear ongoing idle look-around and reset idle timer immediately upon movement
      clearLookAround();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Eye tracking following cursor
      if (containerRef.current && !prefs.minimized) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
          const maxTrackRadius = 350;
          const factor = Math.min(1, dist / maxTrackRadius);
          setEyeOffset({
            x: (dx / dist) * factor,
            y: (dy / dist) * factor,
          });
        }
      }

      // Schedule next idle cycle starting 5s-15s after this mouse movement ceases
      scheduleNextIdle();
    };

    // Schedule initial idle cycle on mount
    scheduleNextIdle();

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearLookAround();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (resetRapidClickTimerRef.current) clearTimeout(resetRapidClickTimerRef.current);
    };
  }, [prefs.minimized, prefs.muted, say]);

  // Drag and click separation handlers with 6px displacement threshold
  const isDraggingRef = useRef(false);
  const dragHandledRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    // Don't drag if clicking utility buttons
    if ((e.target as HTMLElement).closest("button")) return;

    isDraggingRef.current = false;
    dragHandledRef.current = false;

    const startX = e.clientX;
    const startY = e.clientY;
    const currentPosX = (prefs.position?.x ?? 0) + roamingOffsetX;
    const currentPosY = prefs.position?.y ?? 0;

    if (roamingOffsetX !== 0) {
      resetRoaming();
      updatePrefs((p) => ({
        ...p,
        position: { x: currentPosX, y: currentPosY },
      }));
    }

    dragStartRef.current = {
      mouseX: startX,
      mouseY: startY,
      initialX: currentPosX,
      initialY: currentPosY,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const dist = Math.hypot(deltaX, deltaY);

      // Only enter drag state if cursor has genuinely moved beyond 6px threshold
      if (!isDraggingRef.current && dist > 6) {
        isDraggingRef.current = true;
        dragHandledRef.current = true;
        setIsDragging(true);

        const dragLine = DRAG_LINES[Math.floor(Math.random() * DRAG_LINES.length)];
        say(dragLine, 3000);
      }

      if (isDraggingRef.current) {
        updatePrefs((p) => ({
          ...p,
          position: {
            x: currentPosX + deltaX,
            y: currentPosY + deltaY,
          },
        }));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);

        sawakoSound.setMuted(prefs.muted);

        const dropLine = DROP_LINES[Math.floor(Math.random() * DROP_LINES.length)];
        say(dropLine, 3500);
      }
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
            sawakoSound.setMuted(prefs.muted);
            sawakoSound.playChime();
            say(
              {
                text: "A-Admin-san, you came back~!",
                expression: "happy",
                symbol: "sparkle",
              },
              5000,
            );
          }}
          className="group relative flex items-center gap-2.5 rounded-full border border-pink-400/35 bg-zinc-950/85 px-4 py-2 text-xs font-medium text-pink-200 shadow-xl shadow-pink-950/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-pink-400/70 hover:bg-zinc-900/90 hover:text-pink-100 hover:shadow-pink-500/20 cursor-pointer"
          title="Sawako is napping. Click to wake her up!"
          aria-label="Wake up Sawako the mascot"
        >
          {/* Soft breathing rose beacon */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-60 animate-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-400"></span>
          </span>

          {/* Minimalist cute shoujo anime typography */}
          <span className="tracking-wide font-sans">
            Sawako (Napping)
          </span>

          {/* Tiny subtle aesthetic sleeping cue */}
          <span className="text-[10px] text-pink-300/60 group-hover:text-pink-300 transition-colors font-mono">
            zzz
          </span>
        </button>
      </div>
    );
  }

  // Pure single-source-of-truth posture from autonomous controller
  const isSippingTea = isSitting;

  const posX = (prefs.position?.x ?? 0) + roamingOffsetX;
  const posY = prefs.position?.y ?? 0;

  const containerTransition = isDragging
    ? "none"
    : isWalking
      ? `transform ${walkDurationSec}s cubic-bezier(0.37, 0, 0.63, 1), opacity 200ms`
      : "transform 300ms ease-out, opacity 200ms";

  return (
    <aside
      ref={containerRef}
      role="complementary"
      aria-label="Sawako Admin Mascot Companion"
      data-testid="sawako-mascot-container"
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end select-none ${
        isHovered ? "opacity-100" : "opacity-95"
      }`}
      style={{
        transform: `translate(${posX}px, ${posY}px)`,
        cursor: isDragging ? "grabbing" : "grab",
        transition: containerTransition,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* ===================== CUTE SPEECH BUBBLE ===================== */}
      {bubbleVisible && currentLine && (
        <div
          data-testid="sawako-speech-bubble"
          className="relative -mb-10 sm:-mb-12 z-20 mr-3 sm:mr-5 max-w-52 rounded-2xl border border-pink-400/35 bg-zinc-950/75 px-3 py-2 shadow-xl shadow-pink-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
          style={{ transformOrigin: "bottom right" }}
        >
          <div className="flex items-start justify-between gap-1.5">
            <span className="text-[10px] font-bold tracking-wider text-amber-300 font-mono">
              Sawako ⭐
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBubbleVisible(false);
              }}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 cursor-pointer"
              aria-label="Dismiss speech bubble"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <p className="mt-0.5 text-xs font-medium leading-relaxed text-zinc-100 select-text">
            {currentLine}
          </p>

          {/* Comic Bubble Pointer Tail */}
          <div className="absolute -bottom-1.5 right-8 h-2.5 w-2.5 rotate-45 border-r border-b border-pink-400/35 bg-zinc-950/75 backdrop-blur-md" />
        </div>
      )}

      {/* ===================== CHARACTER SVG & POKE AREA ===================== */}
      <div className="relative group flex flex-col items-center">
        {/* Quick Utility Control Toolbar docked snugly beside Sawako */}
        <div
          className={`absolute top-12 -left-1 sm:-left-2 z-30 flex flex-col items-center gap-1 rounded-full border border-pink-400/30 bg-zinc-950/75 p-1 backdrop-blur-md shadow-lg transition-all duration-200 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1 pointer-events-none"
          }`}
        >
          {/* Mute audio button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextMuted = !prefs.muted;
              sawakoSound.setMuted(nextMuted);
              updatePrefs((p) => ({ ...p, muted: nextMuted }));
            }}
            className="p-1 text-zinc-400 hover:text-pink-300 transition-colors cursor-pointer rounded-full"
            title={prefs.muted ? "Unmute sound" : "Mute sound"}
            aria-label={prefs.muted ? "Unmute sound" : "Mute sound"}
          >
            {prefs.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Minimize to cat-paw button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updatePrefs((p) => ({ ...p, minimized: true }));
            }}
            className="p-1 text-zinc-400 hover:text-pink-300 transition-colors cursor-pointer rounded-full"
            title="Minimize to desk tray"
            aria-label="Minimize mascot"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Interactive Character Body */}
        <div
          data-testid="sawako-character-body"
          onClick={() => {
            if (dragHandledRef.current) {
              dragHandledRef.current = false;
              return;
            }
            handlePoke();
          }}
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
            isSpeaking={bubbleVisible && Boolean(currentLine)}
            scaleX={scale.x}
            scaleY={scale.y}
            isWalking={isSippingTea ? false : isWalking}
            walkDirection={walkDirection}
            isSippingTea={isSippingTea}
            onPokeHand={handlePokeHand}
            onPokeFoot={handlePokeFoot}
            onPokeStarClip={handlePokeStarClip}
            isProtectingStar={isProtectingStar}
            isBeingPatted={isBeingPatted}
            onHeadpatStroke={handleHeadpatStroke}
            timeOfDay={timeOfDay}
            hour={currentHour}
            onCycleTimeOfDay={handleCycleTimeOfDay}
          />
        </div>
      </div>
    </aside>
  );
}
