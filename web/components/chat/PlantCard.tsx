"use client";

import Link from "next/link";
import { LeafIcon } from "./icons";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { FavoriteButton } from "./FavoriteButton";
import { slugify } from "@/lib/slug";
import type { MatchUsageResult } from "@/lib/types";

const NIVEAU_STYLES: Record<string, string> = {
  traditionnel:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  les_deux: "bg-emerald-600 text-white",
  scientifique:
    "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
};

const NIVEAU_LABELS: Record<string, string> = {
  traditionnel: "Traditionnel",
  les_deux: "Traditionnel + scientifique",
  scientifique: "Scientifique",
};

export function PlantCard({
  usage,
  onFavoriteChange,
}: {
  usage: MatchUsageResult;
  onFavoriteChange?: () => void;
}) {
  const niveauClass = NIVEAU_STYLES[usage.niveau_de_preuve] ?? NIVEAU_STYLES.traditionnel;
  const niveauLabel = NIVEAU_LABELS[usage.niveau_de_preuve] ?? usage.niveau_de_preuve;

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-3 dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/plants/${slugify(usage.plante_nom)}`}
          className="flex items-center gap-1.5 text-emerald-700 hover:underline dark:text-emerald-400"
        >
          <LeafIcon className="h-4 w-4 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {usage.plante_nom}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${niveauClass}`}>
            {niveauLabel}
          </span>
          <FavoriteButton planteNom={usage.plante_nom} onChange={onFavoriteChange} />
        </div>
      </div>

      <dl className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        <div>
          <dt className="inline font-medium text-neutral-500 dark:text-neutral-400">
            Préparation :{" "}
          </dt>
          <dd className="inline">{usage.preparation}</dd>
        </div>
        {usage.posologie && (
          <div>
            <dt className="inline font-medium text-neutral-500 dark:text-neutral-400">
              Posologie :{" "}
            </dt>
            <dd className="inline">{usage.posologie}</dd>
          </div>
        )}
      </dl>

      {usage.plante_precautions && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <span className="font-medium">Précautions : </span>
          {usage.plante_precautions}
        </p>
      )}

      <div className="mt-2">
        <ConfidenceBadge
          counts={{
            tradipraticien_count: usage.tradipraticien_count,
            scientifique_count: usage.scientifique_count,
            institution_count: usage.institution_count,
          }}
        />
      </div>
    </div>
  );
}
