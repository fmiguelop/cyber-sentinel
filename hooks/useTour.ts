"use client";

import { useCallback, useRef } from "react";

type DriverInstance = {
  drive: (stepIndex?: number) => void;
  destroy: () => void;
};

export function useTour() {
  const driverInstanceRef = useRef<DriverInstance | null>(null);

  const startTour = useCallback(async () => {
    if (typeof window === "undefined" || window.innerWidth < 1024) {
      return;
    }

    const driverModule = await import("driver.js");
    const { driver } = driverModule;

    const allSteps = [
      {
        element: "#defcon-panel",
        popover: {
          title: "Global Threat Status",
          description:
            "Monitor global threat levels and detailed metrics. Click the header to collapse or expand this panel.",
          side: "right" as const,
          align: "start" as const,
        },
      },
      {
        element: "#simulation-controls",
        popover: {
          title: "Simulation Controls",
          description: "Control the flow of time. Pause or speed up the simulation.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#active-filters",
        popover: {
          title: "Active Filters",
          description: "Filter the map by Attack Type or Severity.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#map-view-button",
        popover: {
          title: "Map View Toggle",
          description:
            "Switch between globe and flat map projections to view threats from different perspectives.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#sound-button",
        popover: {
          title: "Audio Alerts",
          description:
            "Toggle sound effects for critical threat notifications. Keep enabled to stay alert.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#auto-track-button",
        popover: {
          title: "Auto Tracking",
          description: "Toggle auto tracking of critical threats. Keep enabled to stay alert.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#event-log",
        popover: {
          title: "Event Log",
          description: "Real-time feed of detected events. Export logs to JSON/CSV here.",
          side: "top" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cyber-map",
        popover: {
          title: "The Battleground",
          description:
            "The Battleground. Hover over any attack line or city node to see detailed metadata.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
    ];

    const filteredSteps = allSteps.filter((step) => {
      const element = document.querySelector(step.element);
      return element !== null;
    });

    const steps =
      filteredSteps.length > 0
        ? filteredSteps.map((step, index) => {
            if (index === filteredSteps.length - 1) {
              return {
                ...step,
                onNextClick: (
                  _element: Element | null,
                  _step: unknown,
                  options: { driver: DriverInstance }
                ) => {
                  options.driver.destroy();
                },
              };
            }
            return step;
          })
        : [];

    if (steps.length === 0) {
      console.warn("No tour steps available - elements not found");
      return;
    }

    if (driverInstanceRef.current) {
      driverInstanceRef.current.destroy();
    }

    const driverInstance = driver({
      popoverClass: "cybersentinel-driver",
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      animate: true,
      overlayOpacity: 0.7,
      smoothScroll: true,
      doneBtnText: "Start",
      nextBtnText: "Next",
      prevBtnText: "Previous",
      steps: steps,
      onDestroyed: () => {
        driverInstanceRef.current = null;
      },
    });

    driverInstanceRef.current = driverInstance;
    driverInstance.drive(0);
  }, []);

  return { startTour };
}
