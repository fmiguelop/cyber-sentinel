import type { AttackType, Severity } from "@/lib/types/threats";
export function getRandomSeverity(): Severity {
    const severities: Severity[] = ["low", "medium", "critical"];
    const rand = Math.random();
    if (rand < 0.5)
        return "low";
    if (rand < 0.8)
        return "medium";
    return "critical";
}
export function getRandomAttackType(): AttackType {
    const types: AttackType[] = ["DDoS", "Phishing", "Malware", "BruteForce"];
    return types[Math.floor(Math.random() * types.length)];
}
export function getRandomDurationMs(): number {
    return Math.random() * 7000 + 3000;
}
export function severityToColorToken(severity: Severity): string {
    switch (severity) {
        case "low":
            return "#22c55e";
        case "medium":
            return "#eab308";
        case "critical":
            return "#ef4444";
    }
}
