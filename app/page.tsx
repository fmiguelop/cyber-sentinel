"use client";

import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useCriticalAlertSound } from "@/hooks/useCriticalAlertSound";
import { CyberMap } from "@/components/map/CyberMap";
import { StatHUD } from "@/components/dashboard/StatHUD";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { EventLog } from "@/components/dashboard/EventLog";

export default function Home() {
  // Initialize simulation hook at page level
  useThreatSimulation();
  // Initialize critical alert sound hook
  useCriticalAlertSound();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Dashboard Grid Layout */}
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-4 p-4">
        {/* Main Map Area - Takes up ~75% width, top portion (rows 1-10, cols 1-9) */}
        <div className="col-span-9 row-span-10 rounded-lg border border-border bg-card overflow-hidden">
          <CyberMap />
        </div>

        {/* Stats HUD - Top right (rows 1-4, cols 10-12) */}
        <div className="col-span-3 row-span-4 space-y-4">
          <StatHUD />
        </div>

        {/* Control Panel - Bottom right, takes remaining vertical space (rows 5-12, cols 10-12) */}
        <div className="col-span-3 row-span-8">
          <ControlPanel />
        </div>

        {/* Live Event Log - Responsive docking: under-map on desktop, full-width overlay on mobile */}
        <div className="col-span-12 md:col-span-9 row-span-0 md:row-span-2 fixed md:static bottom-0 left-0 right-0 md:right-auto z-50 md:z-auto px-4 pb-4 md:p-0 md:px-0 md:pb-0 flex md:flex-col md:items-end md:justify-end">
          <EventLog />
        </div>
      </div>
    </div>
  );
}
