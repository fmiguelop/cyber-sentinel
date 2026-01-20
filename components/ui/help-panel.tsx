"use client";

import { useState } from "react";
import { Keyboard, X, HelpCircle, Globe, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-42 right-7 z-50 flex-col items-end gap-2 hidden lg:flex">
      <div
        className={cn(
          "w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold tracking-wide text-white">
              COMMAND CENTER
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Threat Intelligence
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <LegendItem color="bg-[#d946ef]" label="DDoS Swarm" glow />
              <LegendItem color="bg-red-500" label="Critical Attack" />
              <LegendItem
                color="bg-yellow-500"
                label="Medium Severity Attack"
              />
              <LegendItem color="bg-green-500" label="Low Severity Attack" />
              <LegendItem color="bg-[#1e3b38]" label="Active Country" outline />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Keyboard Shortcuts
            </h4>

            <div className="space-y-1.5">
              <Shortcut
                keyLabel="C"
                label="Toggle CCTV Mode"
                icon={<Globe className="w-3 h-3" />}
              />
              <Shortcut keyLabel="ESC" label="Clear Filters / Reset Camera" />
              <Shortcut keyLabel="Z" label="Toggle Map Projection" />
              <Shortcut
                keyLabel="M"
                label="Mute Audio"
                icon={<Volume2 className="w-3 h-3" />}
              />
            </div>

            <div className="space-y-1.5 mt-2">
              <Shortcut keyLabel="SPACE" label="Pause / Resume" />
              <Shortcut keyLabel="V" label="Hard Reset Simulation" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
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
          "flex items-center justify-center w-10 h-10 rounded-full border shadow-lg transition-all hover:scale-105 active:scale-95",
          isOpen
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
            : "bg-black/40 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-white"
        )}
        title="Keyboard Shortcuts & Legend"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
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
          "w-2.5 h-2.5 rounded-full",
          color,
          glow && "animate-pulse shadow-[0_0_8px_currentColor]",
          outline && "bg-transparent border border-current"
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
    <div className="flex items-center justify-between group">
      <span className="text-xs text-gray-400 flex items-center gap-1.5 group-hover:text-gray-200 transition-colors">
        {icon}
        {label}
      </span>
      <Kbd>{keyLabel}</Kbd>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400 min-w-[20px] justify-center shadow-sm">
      {children}
    </kbd>
  );
}
