import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function HudDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-emerald-900 to-transparent",
        className
      )}
      role="separator"
      aria-hidden="true"
    />
  );
}

interface HudSectionTitleProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function HudSectionTitle({
  icon: Icon,
  children,
  className,
  id,
}: HudSectionTitleProps) {
  return (
    <h3
      id={id}
      className={cn(
        "font-mono uppercase text-xs tracking-widest text-gray-300 mb-3 flex items-center gap-2",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </h3>
  );
}
