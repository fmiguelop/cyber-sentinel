"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useCriticalAlertSound } from "@/hooks/useCriticalAlertSound";
import { useTour } from "@/hooks/useTour";
import { CyberMap } from "@/components/map/CyberMap";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { ResponsiveLog } from "@/components/dashboard/ResponsiveLog";
import { ControlsCard } from "@/components/dashboard/ControlPanel";
// import { DefconSection } from "@/components/dashboard/DefconSection";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/branding/logo";
import dynamic from 'next/dynamic';


const DefconSection = dynamic(() => import('../components/dashboard/DefconSection'), {
  ssr: false,
  loading: () => <p>Loading...</p>, // Optional placeholder
});

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center">
        <Image
          src="/assets/logo-icon.svg"
          alt="CyberSentinel"
          width={32}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open settings menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
export default function Home() {
  useThreatSimulation();
  useCriticalAlertSound();
  const { startTour } = useTour();
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <WelcomeModal onStartTour={startTour} />

      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setSheetOpen(true)} />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-[85vw] sm:max-w-sm overflow-y-auto p-0 bg-zinc-950/50 backdrop-blur-md border-l border-zinc-800"
        >
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 space-y-6">
            <ControlsCard />
            <DefconSection />
          </div>
        </SheetContent>
      </Sheet>

      <div id="cyber-map" className="absolute inset-0 z-0">
        <CyberMap />
      </div>

      <div
        id="defcon-panel"
        className="hidden lg:block absolute left-6 top-6 z-10 w-[350px] max-h-[calc(100vh-3rem)] overflow-y-auto overflow-x-clip bg-zinc-950/80 backdrop-blur-md border border-zinc-800 isolate"
      >
        <div className="p-6">
          <DefconSection />
        </div>
      </div>

      <div className="hidden lg:block absolute right-6 top-6 z-10 w-[350px] max-h-[calc(100vh-3rem)] overflow-auto bg-zinc-950/80 backdrop-blur-md border border-zinc-800">
        <div className="p-4">
          <Logo />
        </div>
        <ControlPanel />
      </div>

      <div className="hidden lg:block absolute left-6 right-6 bottom-6 z-10">
        <ResponsiveLog />
      </div>

      <div className="lg:hidden">
        <ResponsiveLog />
      </div>
    </div>
  );
}
