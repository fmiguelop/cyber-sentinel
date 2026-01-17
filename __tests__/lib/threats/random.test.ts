import { getRandomSeverity, getRandomAttackType, getRandomDurationMs, severityToColorToken, } from "@/lib/threats/random";
import type { Severity, AttackType } from "@/lib/types/threats";
describe("random utilities", () => {
    describe("getRandomSeverity", () => {
        it("should return a valid severity", () => {
            const severity = getRandomSeverity();
            expect(["low", "medium", "critical"]).toContain(severity);
        });
        it("should return all severities over many calls", () => {
            const severities = new Set<Severity>();
            for (let i = 0; i < 100; i++) {
                severities.add(getRandomSeverity());
            }
            expect(severities.size).toBeGreaterThanOrEqual(2);
        });
    });
    describe("getRandomAttackType", () => {
        it("should return a valid attack type", () => {
            const type = getRandomAttackType();
            expect(["DDoS", "Phishing", "Malware", "BruteForce"]).toContain(type);
        });
        it("should return all attack types over many calls", () => {
            const types = new Set<AttackType>();
            for (let i = 0; i < 100; i++) {
                types.add(getRandomAttackType());
            }
            expect(types.size).toBeGreaterThanOrEqual(3);
        });
    });
    describe("getRandomDurationMs", () => {
        it("should return a duration between 3000 and 10000ms", () => {
            for (let i = 0; i < 50; i++) {
                const duration = getRandomDurationMs();
                expect(duration).toBeGreaterThanOrEqual(3000);
                expect(duration).toBeLessThanOrEqual(10000);
            }
        });
    });
    describe("severityToColorToken", () => {
        it("should return correct color for low severity", () => {
            expect(severityToColorToken("low")).toBe("#22c55e");
        });
        it("should return correct color for medium severity", () => {
            expect(severityToColorToken("medium")).toBe("#eab308");
        });
        it("should return correct color for critical severity", () => {
            expect(severityToColorToken("critical")).toBe("#ef4444");
        });
    });
});
