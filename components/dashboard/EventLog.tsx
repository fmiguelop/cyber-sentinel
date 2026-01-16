"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreatStore } from "@/stores/useThreatStore";
import { severityToColorToken } from "@/lib/threats/random";
import { matchesFilters } from "@/lib/threats/filters";
import { Minus, Square } from "lucide-react";

type LogPanelSize = "min" | "normal" | "max";

// Calculate heights based on grid: 12 rows, panel is in row-span-2
// Available height = 100vh - 2rem (padding) - 11rem (gaps) = 100vh - 13rem
// Each row = (100vh - 13rem) / 12
// For 2 rows = (100vh - 13rem) / 6 ≈ 16.67vh - 2.17rem
const SIZE_HEIGHTS = {
  min: "calc((100vh - 13rem) / 12)", // ~1 row height
  normal: "calc((100vh - 13rem) / 6)", // ~2 row height (matches grid)
  max: "calc((100vh - 13rem) / 2)", // ~6 row height (half screen)
} as const;

const SIZE_ENTRY_LIMITS = {
  min: 3,
  normal: 10,
  max: Infinity,
} as const;

const STORAGE_KEY = "cybersentinel-log-panel-size";

export function EventLog() {
  const logs = useThreatStore((state) => state.logs);
  const filters = useThreatStore((state) => state.filters);
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Detect if we're on mobile (screen width < 768px)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Initialize size state from sessionStorage or default based on screen size
  const [panelSize, setPanelSize] = useState<LogPanelSize>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY) as LogPanelSize | null;
      if (stored && ["min", "normal", "max"].includes(stored)) {
        // On desktop, if stored is "min", convert to "normal"
        if (window.innerWidth >= 768 && stored === "min") {
          return "normal";
        }
        return stored;
      }
      // Default: "normal" on desktop, "min" on mobile
      return window.innerWidth >= 768 ? "normal" : "min";
    }
    return "normal"; // SSR default
  });
  
  // Lock panel to "normal" size on desktop (no resizing allowed)
  useEffect(() => {
    if (!isMobile && panelSize !== "normal") {
      setPanelSize("normal");
    }
  }, [isMobile, panelSize]);
  
  // Persist size to sessionStorage when it changes (but not "min" on desktop)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Don't persist "min" on desktop - convert to "normal" instead
      const sizeToStore = !isMobile && panelSize === "min" ? "normal" : panelSize;
      sessionStorage.setItem(STORAGE_KEY, sizeToStore);
    }
  }, [panelSize, isMobile]);

  // Size control handlers
  const handleMinimize = useCallback(() => {
    setPanelSize("min");
  }, []);

  const handleToggleNormalMax = useCallback(() => {
    // This should only be called on mobile, but add safety check
    if (!isMobile) return;
    
    setPanelSize((current) => {
      // On mobile, cycle through all three states
      if (current === "min") return "normal";
      if (current === "normal") return "max";
      return "normal"; // from max, go to normal
    });
  }, [isMobile]);

  // Keyboard shortcut: 'L' cycles through sizes (only on mobile)
  useEffect(() => {
    if (!isMobile) return; // Disable keyboard shortcut on desktop
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLButtonElement
      ) {
        return;
      }

      if (e.key === "L" || e.key === "l") {
        e.preventDefault();
        setPanelSize((current) => {
          // On mobile, cycle through all three states
          if (current === "min") return "normal";
          if (current === "normal") return "max";
          return "min"; // from max, cycle back to min
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Track critical threats for aria-live announcements
  const previousCriticalIdsRef = useRef<Set<string>>(new Set());
  const criticalAnnouncementsRef = useRef<string[]>([]);
  
  useEffect(() => {
    // Find new critical threats
    const newCriticalThreats = filteredLogs
      .filter(
        (threat) =>
          threat.severity === "critical" &&
          !previousCriticalIdsRef.current.has(threat.id)
      )
      .slice(0, 5); // Limit to 5 most recent to avoid overwhelming screen readers
    
    if (newCriticalThreats.length > 0) {
      newCriticalThreats.forEach((threat) => {
        previousCriticalIdsRef.current.add(threat.id);
        const announcement = `Critical ${threat.type} threat from ${threat.source.name} to ${threat.target.name}`;
        criticalAnnouncementsRef.current.push(announcement);
      });
      
      // Clean up old announcements
      if (criticalAnnouncementsRef.current.length > 10) {
        criticalAnnouncementsRef.current = criticalAnnouncementsRef.current.slice(-5);
      }
    }
  }, [filteredLogs]);

  // Auto-scroll to top when new entries are added (only in max mode)
  useEffect(() => {
    if (panelSize === "max" && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [filteredLogs.length, panelSize]);

  // Determine which entries to show based on panel size
  const displayedLogs =
    panelSize === "max"
      ? filteredLogs
      : filteredLogs.slice(0, SIZE_ENTRY_LIMITS[panelSize]);

  const heightValue = SIZE_HEIGHTS[panelSize];

  return (
    <motion.div
      animate={{
        height: heightValue,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className="overflow-hidden w-full self-end"
    >
      <Card className="h-full border-border bg-card shadow-lg flex flex-col" role="region" aria-label="Live Event Log">
        {/* Header bar with controls */}
        <CardHeader className="pb-2 pt-3 px-4 shrink-0 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Resize handle visual cue */}
              <div className="w-8 h-0.5 bg-muted-foreground/30 rounded-full" />
              <CardTitle className="text-sm font-semibold">Live Event Log</CardTitle>
              <span className="text-xs text-muted-foreground font-mono">
                ({filteredLogs.length} events)
              </span>
            </div>
            {/* Only show resize controls on mobile */}
            {isMobile && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleMinimize}
                  aria-label="Minimize log panel"
                  title="Minimize (L to cycle)"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleToggleNormalMax}
                  aria-label={
                    panelSize === "min"
                      ? "Expand to normal size"
                      : panelSize === "normal"
                      ? "Maximize log panel"
                      : "Restore to normal size"
                  }
                  title={
                    panelSize === "min"
                      ? "Normal (L to cycle)"
                      : panelSize === "normal"
                      ? "Maximize (L to cycle)"
                      : "Normal (L to cycle)"
                  }
                >
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {/* aria-live region for critical threat announcements */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {criticalAnnouncementsRef.current.map((announcement, idx) => (
              <div key={idx}>{announcement}</div>
            ))}
          </div>
          <ScrollArea className="h-full rounded border-t border-border bg-background p-2 font-mono text-xs">
            <div ref={scrollAreaRef}>
              {displayedLogs.length === 0 ? (
                <div className="text-muted-foreground">
                  [SYSTEM] CyberSentinel initialized. Waiting for threat events...
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {displayedLogs.map((log) => {
                    const severityColor = severityToColorToken(log.severity);
                    return (
                      <motion.div
                        key={log.id}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                        className="mb-1"
                      >
                        <div className="flex items-start gap-2 text-foreground">
                          <span className="text-muted-foreground">
                            [{format(new Date(log.timestamp), "HH:mm:ss")}]
                          </span>
                          <span
                            className={`font-semibold ${
                              log.severity === "critical"
                                ? "glow-critical"
                                : log.severity === "medium"
                                ? "glow-medium"
                                : "glow-low"
                            }`}
                            style={{ color: severityColor }}
                          >
                            [{log.severity.toUpperCase()}]
                          </span>
                          <span>{log.type}</span>
                          <span className="text-muted-foreground">from</span>
                          <span>{log.source.name}</span>
                          <span className="text-muted-foreground">to</span>
                          <span>{log.target.name}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({log.metadata.ipAddress})
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
