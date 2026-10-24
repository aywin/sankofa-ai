"use client";

import Link from "next/link";
import { LeafIcon } from "./icons";
import { FavoriteButton } from "./FavoriteButton";
import type { GradeTier, MatchClaimResult } from "@/lib/types";

// Ce que la science en dit, seulement quand il y a quelque chose à dire :
// l'absence d'étude ne s'affiche pas comme un verdict, c'est le texte de
// Lafi qui la mentionne.
const SCIENCE: Record<GradeTier, string> = {
  elevee: "Bien étudié par la science",
  moderee: "Des études encourageantes",
  faible: "Quelques études",
  tres_faible: "Quelques études",
};

// Wikimedia sert l'original (souvent plusieurs Mo) : on demande une
// vignette. Wikimedia n'accepte que certaines largeurs (160 est refusée,
// 250 passe).
function vignette(url: string): string {
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/]+)$/);
  return m ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/250px-${m[2]}` : url;
}

export function PlantCard({
  usage,
  onFavoriteChange,
}: {
  usage: MatchClaimResult;
  onFavoriteChange?: () => void;
}) {
  const fiche = `/plants/${usage.taxon_slug}`;
  const latinDifferent = usage.nom_scientifique && usage.nom_scientifique !== usage.nom_principal;
  const precaution = usage.precautions_specifiques ?? usage.precautions;
  const origine =
    usage.origine === "documentaire" ? "Usage publié" : usage.est_pilote ? "Recueilli auprès de tradipraticiens" : null;

  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(40,30,10,0.08)] ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex items-start gap-3">
        <Link href={fiche} className="shrink-0">
          {usage.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vignette(usage.photo_url)} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <LeafIcon className="h-6 w-6" />
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={fiche} className="block text-[15px] font-semibold leading-snug text-neutral-900 hover:underline dark:text-neutral-50">
            {usage.nom_principal}
          </Link>
          {latinDifferent && <p className="text-[13px] italic text-neutral-500">{usage.nom_scientifique}</p>}
          <p className="mt-1 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
            {usage.indication_nom} · {usage.partie_nom}
          </p>
        </div>
        <FavoriteButton planteNom={usage.nom_principal} onChange={onFavoriteChange} />
      </div>

      {usage.preparation_resume && (
        <p className="mt-3 text-[14px] leading-relaxed text-neutral-800 dark:text-neutral-200">{usage.preparation_resume}</p>
      )}

      {(precaution || usage.public_deconseille) && (
        <div
          className={`mt-3 border-l-2 pl-3 text-[13px] leading-relaxed ${
            usage.contre_indication_forte
              ? "border-red-400 text-red-900 dark:text-red-200"
              : "border-laterite-300 text-laterite-900 dark:text-laterite-100"
          }`}
        >
          {precaution && (
            <p>
              <span className="font-semibold">{usage.contre_indication_forte ? "Usage délicat. " : "À savoir. "}</span>
              {precaution}
            </p>
          )}
          {usage.public_deconseille && <p className="mt-1">Déconseillé : {usage.public_deconseille}</p>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
        <span className="text-neutral-500">
          {[origine, usage.qualite_preuve_scientifique ? SCIENCE[usage.qualite_preuve_scientifique] : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <Link href={fiche} className="shrink-0 font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Voir la fiche
        </Link>
      </div>
    </article>
  );
}
