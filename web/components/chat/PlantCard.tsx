"use client";

import Link from "next/link";
import { LeafIcon } from "./icons";
import { SyntheseBadge } from "@/components/shared/SyntheseBadge";
import { FavoriteButton } from "./FavoriteButton";
import type { MatchClaimResult } from "@/lib/types";

export function PlantCard({
  usage,
  onFavoriteChange,
}: {
  usage: MatchClaimResult;
  onFavoriteChange?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/plants/${usage.taxon_slug}`}
          className="flex items-center gap-1.5 text-emerald-700 hover:underline dark:text-emerald-400"
        >
          <LeafIcon className="h-4 w-4 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{usage.nom_principal}</span>
        </Link>
        <FavoriteButton planteNom={usage.nom_principal} onChange={onFavoriteChange} />
      </div>

      <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">{usage.indication_nom}</p>

      <dl className="mt-2 space-y-1 text-sm text-neutral-900 dark:text-neutral-100">
        <div>
          <dt className="inline font-medium text-neutral-500 dark:text-neutral-400">Préparation : </dt>
          <dd className="inline">
            {usage.partie_nom} · {usage.preparation_resume ?? usage.preparation_mode}
          </dd>
        </div>
      </dl>

      {(usage.precautions || usage.precautions_specifiques || usage.public_deconseille) && (
        <div className="mt-2 space-y-0.5 rounded-lg bg-laterite-50 px-2 py-1.5 text-xs text-laterite-900 dark:bg-laterite-950 dark:text-laterite-100">
          {(usage.precautions_specifiques || usage.precautions) && (
            <p>
              <span className="font-semibold">Précautions : </span>
              {usage.precautions_specifiques ?? usage.precautions}
            </p>
          )}
          {usage.public_deconseille && (
            <p>
              <span className="font-semibold">Déconseillé : </span>
              {usage.public_deconseille}
            </p>
          )}
        </div>
      )}

      <div className="mt-2">
        <SyntheseBadge
          qualitePreuve={usage.qualite_preuve_scientifique}
          stats={{
            attestations_count: usage.attestations_count,
            lignees_distinctes: usage.lignees_distinctes,
            regions_distinctes: usage.regions_distinctes,
            langues_distinctes: usage.langues_distinctes,
          }}
          contreIndicationForte={usage.contre_indication_forte}
          divergenceNote={null}
          estPilote={usage.est_pilote || usage.origine === "documentaire"}
        />
      </div>
    </div>
  );
}
