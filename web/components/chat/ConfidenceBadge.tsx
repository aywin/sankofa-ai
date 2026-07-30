import { computeConfidence, describeSourceCounts } from "@/lib/confidence";
import type { SourceCounts } from "@/lib/types";

const TIER_STYLES: Record<string, string> = {
  fiable: "text-emerald-700 dark:text-emerald-400",
  limitee: "text-amber-700 dark:text-amber-400",
  non_renseignee: "text-neutral-400 dark:text-neutral-500",
};

export function ConfidenceBadge({ counts }: { counts: SourceCounts }) {
  const confidence = computeConfidence(counts);
  const detail = describeSourceCounts(counts);

  return (
    <p className={`text-xs font-medium ${TIER_STYLES[confidence.tier]}`}>
      {confidence.label}
      {detail && <span className="font-normal text-neutral-500 dark:text-neutral-400"> — {detail}</span>}
    </p>
  );
}
