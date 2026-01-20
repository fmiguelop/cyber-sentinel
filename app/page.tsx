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

const DefconSection = dynamic(
  () => import("../components/dashboard/DefconSection"),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

const ControlPanel = dynamic(
  () => import("../components/dashboard/ControlPanel"),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

function MobileHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-2 py-1 backdrop-blur-sm bg-background/95 w-fit rounded-br-lg">
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
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <WelcomeModal onStartTour={startTour} />

      <div className="lg:hidden">
        <MobileHeader />
      </div>

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

      <MobileSimulationUI />
    </div>
  );
}
