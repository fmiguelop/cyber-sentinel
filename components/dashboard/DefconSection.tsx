"use client";
import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { HudDivider } from "@/components/dashboard/hud";
import {
  useThreatStore,
  selectFilteredThreats,
  selectStatsFiltered,
} from "@/stores/useThreatStore";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@uidotdev/usehooks";

function getDefconLevel(activeCritical: number): number {
  if (activeCritical === 0) return 5;
  if (activeCritical <= 2) return 4;
  if (activeCritical <= 5) return 3;
  if (activeCritical <= 10) return 2;
  return 1;
}

function getDefconSubtitle(level: number): string {
  switch (level) {
    case 5:
      return "Normal Global Activity";
    case 4:
      return "Low Global Activity";
    case 3:
      return "Moderate Global Activity";
    case 2:
      return "Elevated Global Activity";
    case 1:
      return "Maximum Global Activity";
    default:
      return "Unknown Status";
  }
}

function getDefconColor(level: number): string {
  switch (level) {
    case 5:
      return "bg-green-500";
    case 4:
      return "bg-blue-500";
    case 3:
      return "bg-yellow-500";
    case 2:
      return "bg-orange-500";
    case 1:
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function DefconIndicator({
  level,
  size = "sm",
}: {
  level: number;
  size?: "sm" | "xs";
}) {
  const colorClass = getDefconColor(level);
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-2 w-2";
  return (
    <div
      className={`${colorClass} ${sizeClass} rounded-full shrink-0 ${level <= 2 ? "ring-2 ring-offset-1 ring-offset-card ring-red-500/50" : ""}`}
      aria-hidden="true"
    />
  );
}

export { getDefconLevel, getDefconSubtitle };

function toCountryCode(country: string | null): string {
  if (!country) return "--";
  if (/^[A-Z]{2,3}$/.test(country)) return country;
  const map: Record<string, string> = {
    // --- North America & Caribbean ---
    USA: "USA",
    Canada: "CAN",
    Mexico: "MEX",
    Cuba: "CUB",
    "Dominican Republic": "DOM",
    "Puerto Rico": "PRI",
    Jamaica: "JAM",
    Haiti: "HTI",

    // --- South & Central America ---
    Brazil: "BRA",
    Argentina: "ARG",
    Chile: "CHL",
    Colombia: "COL",
    Peru: "PER",
    Venezuela: "VEN",
    Ecuador: "ECU",
    Bolivia: "BOL",
    Paraguay: "PRY",
    Uruguay: "URY",
    "El Salvador": "SLV",
    Panama: "PAN",
    "Costa Rica": "CRI",
    Guatemala: "GTM",
    Honduras: "HND",
    Nicaragua: "NIC",
    Belize: "BLZ",

    // --- Europe ---
    UK: "GBR",
    France: "FRA",
    Germany: "DEU",
    Netherlands: "NLD",
    Belgium: "BEL",
    Switzerland: "CHE",
    Austria: "AUT",
    Ireland: "IRL",
    Spain: "ESP",
    Italy: "ITA",
    Portugal: "PRT",
    Greece: "GRC",
    Turkey: "TUR",
    Sweden: "SWE",
    Denmark: "DNK",
    Norway: "NOR",
    Finland: "FIN",
    Iceland: "ISL",
    Poland: "POL",
    "Czech Republic": "CZE",
    Hungary: "HUN",
    Romania: "ROU",
    Bulgaria: "BGR",
    Serbia: "SRB",
    Croatia: "HRV",
    Slovakia: "SVK",
    Slovenia: "SVN",
    Lithuania: "LTU",
    Latvia: "LVA",
    Estonia: "EST",
    Russia: "RUS",
    Ukraine: "UKR",

    // --- Asia ---
    China: "CHN",
    Japan: "JPN",
    "South Korea": "KOR",
    Taiwan: "TWN",
    India: "IND",
    Pakistan: "PAK",
    Bangladesh: "BGD",
    Singapore: "SGP",
    Thailand: "THA",
    Indonesia: "IDN",
    Vietnam: "VNM",
    Malaysia: "MYS",
    Philippines: "PHL",
    Myanmar: "MMR",
    Cambodia: "KHM",
    Laos: "LAO",
    Brunei: "BRN",
    UAE: "ARE",
    "Saudi Arabia": "SAU",
    Israel: "ISR",
    Qatar: "QAT",
    Kuwait: "KWT",
    Bahrain: "BHR",
    Oman: "OMN",
    Iran: "IRN",
    Iraq: "IRQ",
    Lebanon: "LBN",
    Syria: "SYR",
    Jordan: "JOR",
    Kazakhstan: "KAZ",
    Uzbekistan: "UZB",
    Kyrgyzstan: "KGZ",
    Tajikistan: "TJK",
    Turkmenistan: "TKM",
    Nepal: "NPL",
    "Sri Lanka": "LKA",
    Afghanistan: "AFG",
    Mongolia: "MNG",

    // --- Africa ---
    Egypt: "EGY",
    Morocco: "MAR",
    Algeria: "DZA",
    Tunisia: "TUN",
    Libya: "LBY",
    Nigeria: "NGA",
    Ghana: "GHA",
    Senegal: "SEN",
    "Ivory Coast": "CIV",
    Guinea: "GIN",
    Mali: "MLI",
    "Burkina Faso": "BFA",
    "Sierra Leone": "SLE",
    Liberia: "LBR",
    Kenya: "KEN",
    Ethiopia: "ETH",
    Tanzania: "TZA",
    Uganda: "UGA",
    Rwanda: "RWA",
    Somalia: "SOM",
    Djibouti: "DJI",
    "DR Congo": "COD",
    Congo: "COG",
    Cameroon: "CMR",
    Angola: "AGO",
    Chad: "TCD",
    Gabon: "GAB",
    "South Africa": "ZAF",
    Zimbabwe: "ZWE",
    Zambia: "ZMB",
    Mozambique: "MOZ",
    Botswana: "BWA",
    Namibia: "NAM",
    Madagascar: "MDG",
    Mauritius: "MUS",
    Sudan: "SDN",
    Eritrea: "ERI",

    // --- Oceania ---
    Australia: "AUS",
    "New Zealand": "NZL",
    Fiji: "FJI",
    "Papua New Guinea": "PNG",
    "New Caledonia": "NCL",
    "French Polynesia": "PYF",
    Samoa: "WSM",
    Tonga: "TON",
    "Solomon Islands": "SLB",
    Vanuatu: "VUT",
  };
  return map[country] ?? country;
}

function isSignificantDiff(now: number, global: number): boolean {
  if (global === 0) return now > 0;
  return Math.abs(now - global) / global > 0.5;
}

function TrendArrow({ now, global }: { now: number; global: number }) {
  if (now === global) return null;
  const direction = now > global ? "up" : "down";
  const label = now > global ? "Higher than global" : "Lower than global";
  return (
    <span
      className="ml-1 text-[10px] text-gray-500"
      role="img"
      aria-label={label}
    >
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
}

export default function DefconSection() {
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const filteredThreats = useThreatStore(selectFilteredThreats);
  const statsFiltered = useThreatStore(selectStatsFiltered);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const defconLevel = getDefconLevel(statsGlobal.activeCritical);
  const defconSubtitle = getDefconSubtitle(defconLevel);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const nowIsEmpty =
    filteredThreats.length === 0 && statsFiltered.totalAttacks === 0;

  return (
    <div role="region" aria-label="DEFCON Status">
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={isMobile}
        className={cn(
          "w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          isExpanded && "mb-4"
        )}
        aria-expanded={isExpanded}
        aria-label={`DEFCON ${defconLevel} - ${
          isExpanded ? "Collapse" : "Expand"
        } details`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DefconIndicator level={defconLevel} size="sm" />
            <span className="text-sm font-semibold text-foreground">
              DEFCON {defconLevel}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-zinc-500 transition-transform duration-200 hidden md:block",
              isExpanded && "rotate-180"
            )}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {defconSubtitle}
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                damping: 20,
                stiffness: 300,
              }
        }
        className="overflow-hidden"
      >
        <HudDivider />
        <div className="space-y-3 mt-4">
          <div
            className="pb-2 text-xs"
            role="table"
            aria-label="Threat metrics comparison table: Global versus Now"
          >
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 mb-2 text-muted-foreground">
              <span></span>
              <span className="text-right font-mono">Global</span>
              <span className="text-right text-yellow-500 font-mono">Now</span>
            </div>

            <div className="space-y-0" role="rowgroup">
              <div
                className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5"
                role="row"
              >
                <span className="text-gray-300" role="cell">
                  Active Threats
                </span>
                <span
                  className="text-right text-white font-mono tabular-nums"
                  role="cell"
                >
                  {activeThreats.length}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${
                    nowIsEmpty && filteredThreats.length === 0
                      ? "text-gray-600"
                      : isSignificantDiff(
                            filteredThreats.length,
                            activeThreats.length
                          )
                        ? "text-yellow-300 font-semibold"
                        : "text-yellow-500"
                  }`}
                  role="cell"
                  aria-label={`Now ${filteredThreats.length}, global ${activeThreats.length}`}
                >
                  {nowIsEmpty && filteredThreats.length === 0
                    ? "--"
                    : filteredThreats.length}
                  {!nowIsEmpty && (
                    <TrendArrow
                      now={filteredThreats.length}
                      global={activeThreats.length}
                    />
                  )}
                </span>
              </div>

              <div
                className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5"
                role="row"
              >
                <span className="text-gray-300" role="cell">
                  Critical
                </span>
                <span
                  className="text-right text-white font-mono tabular-nums"
                  role="cell"
                >
                  {statsGlobal.activeCritical}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${
                    nowIsEmpty && statsFiltered.activeCritical === 0
                      ? "text-gray-600"
                      : isSignificantDiff(
                            statsFiltered.activeCritical,
                            statsGlobal.activeCritical
                          )
                        ? "text-yellow-300 font-semibold"
                        : "text-yellow-500"
                  }`}
                  role="cell"
                  aria-label={`Now critical ${statsFiltered.activeCritical}, global critical ${statsGlobal.activeCritical}`}
                >
                  {nowIsEmpty && statsFiltered.activeCritical === 0
                    ? "--"
                    : statsFiltered.activeCritical}
                  {!nowIsEmpty && (
                    <TrendArrow
                      now={statsFiltered.activeCritical}
                      global={statsGlobal.activeCritical}
                    />
                  )}
                </span>
              </div>

              <div
                className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5"
                role="row"
              >
                <span className="text-gray-300" role="cell">
                  Primary Source
                </span>
                <span
                  className="text-right text-white font-mono truncate"
                  role="cell"
                  title={toCountryCode(statsGlobal.topSourceCountry)}
                >
                  {toCountryCode(statsGlobal.topSourceCountry)}
                </span>
                <span
                  className={`text-right font-mono truncate ${nowIsEmpty ? "text-gray-600" : "text-yellow-500"}`}
                  role="cell"
                  title={toCountryCode(statsFiltered.topSourceCountry)}
                >
                  {nowIsEmpty
                    ? "--"
                    : toCountryCode(statsFiltered.topSourceCountry)}
                </span>
              </div>

              <div
                className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5"
                role="row"
              >
                <span className="text-gray-300" role="cell">
                  Hotspot Region
                </span>
                <span className="text-right text-white font-mono" role="cell">
                  {statsGlobal.topSourceRegion || "--"}
                </span>
                <span
                  className={`text-right font-mono ${nowIsEmpty ? "text-gray-600" : "text-yellow-500"}`}
                  role="cell"
                >
                  {nowIsEmpty ? "--" : statsFiltered.topSourceRegion || "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
