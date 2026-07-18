import type { MatchUsageResult, Plante } from "@/lib/types";

type ToolPart = {
  type: string;
  state?: string;
  output?: unknown;
};

function extractPlantNames(parts: ToolPart[]): string[] {
  const names = new Set<string>();

  for (const part of parts) {
    if (part.state !== "output-available" || !part.output) continue;

    if (part.type === "tool-rechercher_par_symptome") {
      const output = part.output as { resultats?: MatchUsageResult[] };
      for (const r of output.resultats ?? []) {
        names.add(r.plante_nom);
      }
    }

    if (part.type === "tool-obtenir_details_plante") {
      const output = part.output as { plante?: Plante | null };
      if (output.plante?.nom_local) {
        names.add(output.plante.nom_local);
      }
    }
  }

  return Array.from(names);
}

export function SourcesBadge({ parts }: { parts: ToolPart[] }) {
  const names = extractPlantNames(parts);
  if (names.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Sources consultées :
      </span>
      {names.map((name) => (
        <span
          key={name}
          className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
