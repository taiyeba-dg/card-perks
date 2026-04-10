import type { ValueChange } from "./devaluation-entries";

// -- Group changes by bank + month --
export interface ChangeGroup {
  key: string;          // "hdfc-2026-01"
  bankId: string;
  bankName: string;
  monthLabel: string;   // "January 2026"
  changes: ValueChange[];
  netImpact: "negative" | "positive" | "mixed";
}

export function groupChangesByBankMonth(changes: ValueChange[]): ChangeGroup[] {
  const map = new Map<string, ValueChange[]>();

  for (const change of changes) {
    const d = new Date(change.effectiveDate);
    const key = `${change.bankId}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key) || [];
    existing.push(change);
    map.set(key, existing);
  }

  const bankNames: Record<string, string> = { hdfc: "HDFC Bank", axis: "Axis Bank", sbi: "SBI Card", icici: "ICICI Bank", other: "Other Banks" };

  return Array.from(map.entries())
    .map(([key, groupChanges]) => {
      const d = new Date(groupChanges[0].effectiveDate);
      const devals = groupChanges.filter((c) => c.changeType === "devaluation").length;
      const imps = groupChanges.filter((c) => c.changeType === "improvement").length;
      return {
        key,
        bankId: groupChanges[0].bankId,
        bankName: bankNames[groupChanges[0].bankId] || groupChanges[0].bankId,
        monthLabel: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        changes: groupChanges,
        netImpact: (devals > imps ? "negative" : imps > devals ? "positive" : "mixed") as "negative" | "positive" | "mixed",
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key)); // newest first
}

// -- Calculate user exposure --
export function calculateUserExposure(
  changes: ValueChange[],
  isMyCard: (id: string) => boolean
): { totalChanges: number; highImpact: number; estimatedLoss: string } {
  const affected = changes.filter((c) => c.affectedCards.some(isMyCard));
  const highImpact = affected.filter((c) => c.impactLevel === "high");

  // Parse estimated impact strings for rough total
  let totalLoss = 0;
  for (const c of affected) {
    const match = c.estimatedAnnualImpact.match(/\u20B9([\d,]+)/);
    if (match && c.changeType === "devaluation") {
      totalLoss += parseInt(match[1].replace(/,/g, ""), 10);
    }
  }

  return {
    totalChanges: affected.length,
    highImpact: highImpact.length,
    estimatedLoss: totalLoss > 0 ? `\u20B9${totalLoss.toLocaleString()}/yr` : "None",
  };
}

// -- Pattern detection --
export function detectPatterns(changes: ValueChange[]): Map<string, string> {
  const patterns = new Map<string, string>();
  const bankChanges = new Map<string, ValueChange[]>();

  for (const c of changes) {
    if (c.changeType === "devaluation") {
      const existing = bankChanges.get(c.bankId) || [];
      existing.push(c);
      bankChanges.set(c.bankId, existing);
    }
  }

  const bankNames: Record<string, string> = { hdfc: "HDFC", axis: "Axis", sbi: "SBI", icici: "ICICI" };
  for (const [bankId, devals] of bankChanges.entries()) {
    if (devals.length >= 2) {
      const name = bankNames[bankId] || bankId;
      for (const d of devals) {
        patterns.set(d.id, `${ordinal(devals.indexOf(d) + 1)} ${name} devaluation in recent history`);
      }
    }
  }

  return patterns;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
