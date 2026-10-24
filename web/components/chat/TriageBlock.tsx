import type { TriageResultat } from "@/lib/triage";

// Encadré d'urgence (lafi-v5.md P1.4) : produit par lib/triage.ts, sans
// IA, et affiché avant la réponse, il reste visible même si le modèle
// échoue. Un simple conseil de consulter n'a pas d'encadré : le modèle le
// dit avec ses mots.
export function TriageBlock({ triage }: { triage: TriageResultat }) {
  if (triage.niveau !== "urgence") return null;

  return (
    <div
      role="alert"
      className="mb-4 border-l-2 border-red-500 pl-3 text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100"
    >
      <p className="font-semibold text-red-700 dark:text-red-400">{triage.titre}</p>
      {triage.conseils.map((conseil) => (
        <p key={conseil} className="mt-1">
          {conseil}
        </p>
      ))}
    </div>
  );
}
