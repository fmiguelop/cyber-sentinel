"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreatStore } from "@/stores/useThreatStore";
import { severityToColorToken } from "@/lib/threats/random";
import type { ThreatEvent, FilterState, TimeRange } from "@/lib/types/threats";

// Helper to check if a threat matches filters (same logic as store)
function matchesFilters(threat: ThreatEvent, filters: FilterState): boolean {
  if (!filters.severity[threat.severity]) return false;
  if (!filters.attackType[threat.type]) return false;
  
  if (filters.timeRange !== "all") {
    const now = Date.now();
    const threatAge = now - threat.timestamp;
    const timeRangeMs: Record<TimeRange, number> = {
      "1min": 60 * 1000,
      "5min": 5 * 60 * 1000,
      "1hr": 60 * 60 * 1000,
      all: Infinity,
    };
    if (threatAge > timeRangeMs[filters.timeRange]) return false;
  }
  
  return true;
}

export function EventLog() {
  const logs = useThreatStore((state) => state.logs);
  const filters = useThreatStore((state) => state.filters);
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Live Event Log</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Terminal-style threat feed ({filteredLogs.length} events)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 rounded border border-border bg-background p-2 font-mono text-xs">
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mb-1"
                    >
                      <div className="flex items-start gap-2 text-foreground">
                        <span className="text-muted-foreground">
                          [{format(new Date(log.timestamp), "HH:mm:ss")}]
                        </span>
                        <span
                          className="font-semibold"
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
