import type { TriageResultat } from "@/lib/triage";

// Bloc d'orientation fixe (lafi-v5.md P1.4) — produit par lib/triage.ts,
// sans IA, et affiché avant la réponse : il reste visible même si le
// modèle échoue ou se trompe.
export function TriageBlock({ triage }: { triage: TriageResultat }) {
  if (triage.niveau === "aucun") return null;
  const urgent = triage.niveau === "urgence";

  return (
    <div
      role={urgent ? "alert" : "note"}
      className={`mb-3 rounded-2xl border px-4 py-3 text-sm ${
        urgent
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100"
          : "border-laterite-200 bg-laterite-50 text-laterite-900 dark:border-laterite-900 dark:bg-laterite-950/50 dark:text-laterite-100"
      }`}
    >
      <p className="font-semibold">{urgent ? "⚠️ " : ""}{triage.titre}</p>
      <ul className="mt-1 space-y-1">
        {triage.conseils.map((conseil) => (
          <li key={conseil}>{conseil}</li>
        ))}
      </ul>
    </div>
  );
}
