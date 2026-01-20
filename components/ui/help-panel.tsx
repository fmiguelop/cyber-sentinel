"use client";

import { useState } from "react";
import { Keyboard, X, HelpCircle, Globe, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute right-7 bottom-48 z-50 hidden flex-col items-end gap-2 lg:flex">
      <div
        className={cn(
          "w-80 origin-bottom-right overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md transition-all duration-300",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none h-0 translate-y-4 scale-95 opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold tracking-wide text-white">COMMAND CENTER</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-4">
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Threat Intelligence
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <LegendItem color="bg-[#d946ef]" label="DDoS Swarm" glow />
              <LegendItem color="bg-red-500" label="Critical Attack" />
              <LegendItem color="bg-yellow-500" label="Medium Severity Attack" />
              <LegendItem color="bg-green-500" label="Low Severity Attack" />
              <LegendItem color="bg-[#1e3b38]" label="Active Country" outline />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Keyboard Shortcuts
            </h4>

            <div className="space-y-1.5">
              <Shortcut
                keyLabel="C"
                label="Toggle CCTV Mode"
                icon={<Globe className="h-3 w-3" />}
              />
              <Shortcut keyLabel="ESC" label="Clear Filters / Reset Camera" />
              <Shortcut keyLabel="Z" label="Toggle Map Projection" />
              <Shortcut keyLabel="M" label="Mute Audio" icon={<Volume2 className="h-3 w-3" />} />
            </div>

            <div className="mt-2 space-y-1.5">
              <Shortcut keyLabel="SPACE" label="Pause / Resume" />
              <Shortcut keyLabel="V" label="Hard Reset Simulation" />
            </div>

            <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
              <span>Speed Control</span>
              <div className="flex gap-1">
                <Kbd>1</Kbd>
                <Kbd>2</Kbd>
                <Kbd>3</Kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all hover:scale-105 active:scale-95",
          isOpen
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
            : "text-muted-foreground border-white/20 bg-black/40 hover:bg-white/10 hover:text-white"
        )}
        title="Keyboard Shortcuts & Legend"
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}

function LegendItem({
  color,
  label,
  glow = false,
  outline = false,
}: {
  color: string;
  label: string;
  glow?: boolean;
  outline?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          color,
          glow && "animate-pulse shadow-[0_0_8px_currentColor]",
          outline && "border border-current bg-transparent"
        )}
      />
      <span className="text-gray-300">{label}</span>
    </div>
  );
}

function Shortcut({
  keyLabel,
  label,
  icon,
}: {
  keyLabel: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors group-hover:text-gray-200">
        {icon}
        {label}
      </span>
      <Kbd>{keyLabel}</Kbd>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden h-5 min-w-[20px] items-center justify-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400 shadow-sm sm:inline-flex">
      {children}
    </kbd>
  );
}
