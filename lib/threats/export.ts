import type { ThreatEvent } from "@/lib/types/threats";
import { format } from "date-fns";
export function logsToJson(logs: ThreatEvent[]): string {
  return JSON.stringify(logs, null, 2);
}
export function logsToCsv(logs: ThreatEvent[]): string {
  if (logs.length === 0) {
    return "timestamp,type,severity,source_city,source_country,source_region,target_city,target_country,target_region,ip_address,duration_ms,payload_size_kb,packet_count\n";
  }
  const headers = [
    "timestamp",
    "type",
    "severity",
    "source_city",
    "source_country",
    "source_region",
    "target_city",
    "target_country",
    "target_region",
    "ip_address",
    "duration_ms",
    "payload_size_kb",
    "packet_count",
  ];
  const rows = logs.map((log) => {
    const timestamp = format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss");
    return [
      timestamp,
      log.type,
      log.severity,
      log.source.name,
      log.source.country,
      log.source.region,
      log.target.name,
      log.target.country,
      log.target.region,
      log.metadata.ipAddress,
      log.duration.toString(),
      log.metadata.payloadSize?.toString() || "",
      log.metadata.packetCount?.toString() || "",
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
export function downloadTextFile(
  filename: string,
  mimeType: string,
  content: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
