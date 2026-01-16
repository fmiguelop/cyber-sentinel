"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreatStore } from "@/stores/useThreatStore";
import { severityToColorToken } from "@/lib/threats/random";
import { matchesFilters } from "@/lib/threats/filters";

export function EventLog() {
  const logs = useThreatStore((state) => state.logs);
  const filters = useThreatStore((state) => state.filters);
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
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

  // Auto-scroll to top when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [filteredLogs.length]);

  return (
    <Card className="h-full border-border bg-card shadow-lg" role="region" aria-label="Live Event Log">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Live Event Log</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Terminal-style threat feed ({filteredLogs.length} events)
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        <ScrollArea className="h-full rounded border border-border bg-background p-2 font-mono text-xs">
          <div ref={scrollAreaRef}>
            {filteredLogs.length === 0 ? (
              <div className="text-muted-foreground">
                [SYSTEM] CyberSentinel initialized. Waiting for threat events...
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredLogs.map((log) => {
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
  );
}
