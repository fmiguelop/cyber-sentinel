"use client";
import Image from "next/image";
import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useCriticalAlertSound } from "@/hooks/useCriticalAlertSound";
import { useTour } from "@/hooks/useTour";
import { CyberMap } from "@/components/map/CyberMap";
import { ResponsiveLog } from "@/components/dashboard/ResponsiveLog";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

import { Logo } from "@/components/branding/logo";
import dynamic from "next/dynamic";
import { MobileSimulationUI } from "@/components/mobile-drawer";
import { HelpPanel } from "@/components/ui/help-panel";

const DefconSection = dynamic(() => import("../components/dashboard/DefconSection"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const ControlPanel = dynamic(() => import("../components/dashboard/ControlPanel"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

function MobileHeader() {
  return (
    <header className="bg-background/95 absolute top-0 right-0 left-0 z-40 flex w-fit items-center justify-between rounded-br-lg px-2 py-1 backdrop-blur-sm">
      <Image
        src="/assets/logo.svg"
        alt="CyberSentinel"
        width={32}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </header>
  );
}
export default function Home() {
  useThreatSimulation();
  useCriticalAlertSound();
  const { startTour } = useTour();
  return (
    <div className="bg-background relative h-screen w-screen overflow-hidden">
      <WelcomeModal onStartTour={startTour} />

      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <div id="cyber-map" className="absolute inset-0 z-0">
        <CyberMap />
      </div>

      <div
        id="defcon-panel"
        className="absolute top-6 left-6 isolate z-10 hidden max-h-[calc(100vh-3rem)] w-[350px] overflow-x-clip overflow-y-auto border border-zinc-800 bg-zinc-950/80 backdrop-blur-md lg:block"
      >
        <div className="p-6">
          <DefconSection />
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 hidden max-h-[calc(100vh-3rem)] w-[350px] overflow-auto border border-zinc-800 bg-zinc-950/80 backdrop-blur-md lg:block">
        <div className="p-4">
          <Logo />
        </div>
        <ControlPanel />
      </div>

      <div className="absolute right-6 bottom-6 left-6 z-10 hidden lg:block">
        <ResponsiveLog />
      </div>

      <HelpPanel />

      <MobileSimulationUI />
    </div>
  );
}
