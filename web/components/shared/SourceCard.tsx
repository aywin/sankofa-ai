import { BuildingIcon, DocumentIcon, PersonSilhouetteIcon } from "@/components/chat/icons";
import type { SourceSavoir } from "@/lib/types";

// Composant unique pour l'attribution humaine (lafi-best.md P4) — gère
// les 3 types (structure/personne/publication) et les 2 statuts
// (réel/illustratif) sans duplication de gabarit : le jour où une
// source illustrative est remplacée par une vraie identité, seul le
// contenu change, jamais le composant.
//
// Une source illustrative ne peut jamais porter de photo de personne
// réelle (contrainte en base, schema_v7.sql) — ici, l'absence de
// photo_url bascule automatiquement sur une icône silhouette/bâtiment/
// document, jamais une image générique qui pourrait passer pour un vrai
// portrait.

const ICON_BY_TYPE = {
  structure: BuildingIcon,
  personne: PersonSilhouetteIcon,
  publication: DocumentIcon,
};

export function SourceCard({
  source,
  variant = "large",
  contexte,
}: {
  source: SourceSavoir;
  variant?: "compact" | "large";
  contexte?: { region?: string | null; langue?: string | null };
}) {
  const Icon = ICON_BY_TYPE[source.type];
  const illustratif = source.statut_verite === "illustratif";
  // La région/langue de CETTE attestation prime sur la localisation
  // générique de la source (utile surtout pour une source illustrative
  // réutilisée par plusieurs attestations à régions différentes) — ne
  // pas les concaténer, ça produisait une ligne confuse en pratique.
  const localisation =
    [contexte?.region, contexte?.langue].filter(Boolean).join(", ") || source.localisation || "";

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            illustratif
              ? "border border-dashed border-neutral-300 text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          }`}
        >
          <Icon className="h-3 w-3" />
        </span>
        <span className="truncate">
          {source.nom_affichage}
          {localisation ? ` — ${localisation}` : ""}
        </span>
        {illustratif && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500">
            illustration
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 rounded-xl p-3 ${
        illustratif
          ? "border border-dashed border-neutral-300 bg-neutral-50/60 dark:border-neutral-700 dark:bg-neutral-900/30"
          : "border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20"
      }`}
    >
      {source.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source.photo_url} alt={source.nom_affichage} className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            illustratif
              ? "border border-dashed border-neutral-300 text-neutral-400 dark:border-neutral-600 dark:text-neutral-500"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">{source.nom_affichage}</p>
        {(source.role || localisation) && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {[source.role, localisation].filter(Boolean).join(" — ")}
          </p>
        )}
        {illustratif && source.notice && (
          <p className="mt-1 text-xs italic text-neutral-500 dark:text-neutral-400">{source.notice}</p>
        )}
        {!illustratif && source.reference_url && (
          <a
            href={source.reference_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Référence vérifiable →
          </a>
        )}
      </div>
    </div>
  );
}
