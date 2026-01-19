"use client";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThreatStore } from "@/stores/useThreatStore";
import {
  DefconIndicator,
  getDefconLevel,
  getDefconSubtitle,
} from "@/components/dashboard/DefconSection";
function DefconHeaderContent({
  disableTooltip = false,
}: {
  disableTooltip?: boolean;
}) {
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const defconLevel = getDefconLevel(statsGlobal.activeCritical);
  const defconSubtitle = getDefconSubtitle(defconLevel);
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("defcon-tooltip-seen");
    if (!hasSeenTooltip) {
      setShowPulse(true);
    }
  }, []);
  const handleTooltipOpenChange = (open: boolean) => {
    if (open && showPulse) {
      localStorage.setItem("defcon-tooltip-seen", "true");
      setShowPulse(false);
    }
  };
  const tooltipContent = (
    <TooltipContent side="right" className="max-w-sm">
      <div className="space-y-3">
        <div>
          <div className="font-semibold text-sm">
            DEFCON (Defense Condition)
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Military alert readiness scale
          </div>
        </div>
        <div className="space-y-1 font-mono text-xs">
          <div
            className={`flex items-center gap-2 ${defconLevel === 5 ? "text-white font-bold" : "text-gray-400"}`}
          >
            <DefconIndicator level={5} size="xs" />
            <span>
              5 - Normal (0 critical){defconLevel === 5 && " ← YOU ARE HERE"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${defconLevel === 4 ? "text-white font-bold" : "text-gray-400"}`}
          >
            <DefconIndicator level={4} size="xs" />
            <span>
              4 - Low (1-2 critical){defconLevel === 4 && " ← YOU ARE HERE"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${defconLevel === 3 ? "text-white font-bold" : "text-gray-400"}`}
          >
            <DefconIndicator level={3} size="xs" />
            <span>
              3 - Moderate (3-5 critical)
              {defconLevel === 3 && " ← YOU ARE HERE"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${defconLevel === 2 ? "text-white font-bold" : "text-gray-400"}`}
          >
            <DefconIndicator level={2} size="xs" />
            <span>
              2 - Elevated (6-10 critical)
              {defconLevel === 2 && " ← YOU ARE HERE"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 ${defconLevel === 1 ? "text-white font-bold" : "text-gray-400"}`}
          >
            <DefconIndicator level={1} size="xs" />
            <span>
              1 - Maximum (10+ critical){defconLevel === 1 && " ← YOU ARE HERE"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400">
            Based on active critical threats in the system
          </div>
        </div>
      </div>
    </TooltipContent>
  );
  return (
    <TooltipProvider delayDuration={300}>
      <div className="group">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 cursor-help">
            <DefconIndicator level={defconLevel} size="sm" />
            <span className="text-sm font-semibold text-foreground">
              DEFCON {defconLevel}
            </span>
          </div>
          {disableTooltip ? (
            <button
              type="button"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm cursor-default opacity-50"
              aria-label="DEFCON levels info (tooltip disabled on mobile)"
              disabled
            >
              <Info
                className={`h-4 w-4 text-gray-400 ${showPulse ? "animate-pulse" : ""}`}
              />
            </button>
          ) : (
            <Tooltip onOpenChange={handleTooltipOpenChange}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm cursor-pointer"
                  aria-label="Learn about DEFCON levels"
                >
                  <Info
                    className={`h-4 w-4 text-gray-400 transition-colors hover:text-gray-200 ${showPulse ? "animate-pulse" : ""}`}
                  />
                </button>
              </TooltipTrigger>
              {tooltipContent}
            </Tooltip>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {defconSubtitle}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function DefconCard({
  disableTooltip = false,
}: {
  disableTooltip?: boolean;
}) {
  return (
    <div role="region" aria-label="DEFCON Status" className="px-6 py-4">
      <DefconHeaderContent disableTooltip={disableTooltip} />
    </div>
  );
}

export function StatHUD() {
  return null;
}
