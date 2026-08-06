import Link from "next/link";
import { STATUT_LABELS, STATUT_STYLES, type StatutSynthese } from "@/lib/synthese";
import type { Etude } from "@/lib/types";

const ETUDE_TYPE_LABELS: Record<string, string> = {
  preclinique_in_vitro: "préclinique (in vitro)",
  preclinique_animal: "préclinique (animal)",
  essai_clinique_humain: "essai clinique humain",
  revue_systematique: "revue systématique",
  revue_narrative: "revue narrative",
  etude_experimentale_humaine: "étude expérimentale humaine",
  autre: "étude",
};

// Panneau de sortie (§5 du brief) : statut, décomposition, justificatifs
// cliquables. Pas d'export PDF/lien versionné en v1 — l'URL de cette
// page (/laboratoire/[claimId]) sert déjà de lien permanent tant que les
// données sous-jacentes ne sont pas éditables (table Exécution réservée
// au mode expert, voir schema_v4.sql).
export function OutputPanel({
  statut,
  raisonnement,
  etudes,
  attestationsCount,
  chatHref,
}: {
  statut: StatutSynthese;
  raisonnement: string[];
  etudes: Etude[];
  attestationsCount: number;
  chatHref: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-white p-5 dark:border-emerald-900 dark:bg-neutral-950">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
        Statut de plausibilité
      </p>
      <span
        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUT_STYLES[statut]}`}
      >
        {STATUT_LABELS[statut]}
      </span>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          Comment ce statut a été obtenu (nœud ⑩ Agrégation)
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          {raisonnement.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {etudes.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            Justificatifs — littérature ({etudes.length})
          </p>
          <ul className="space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {etudes.map((e) => (
              <li key={e.id}>
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    {e.titre}
                  </a>
                ) : (
                  e.titre
                )}{" "}
                — {ETUDE_TYPE_LABELS[e.type] ?? e.type}
                {e.annee ? ` (${e.annee})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
        {attestationsCount} attestation{attestationsCount > 1 ? "s" : ""} traditionnelle
        {attestationsCount > 1 ? "s" : ""} prise{attestationsCount > 1 ? "s" : ""} en compte — détail dans le nœud ②
        ci-dessus.
      </p>

      <Link
        href={chatHref}
        className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        En discuter avec Lafi →
      </Link>
    </div>
  );
}
