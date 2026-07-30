import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { slugify } from "@/lib/slug";
import { LeafIcon } from "@/components/chat/icons";
import { ConfidenceBadge } from "@/components/chat/ConfidenceBadge";
import { FavoriteButton } from "@/components/chat/FavoriteButton";
import type { NiveauDePreuve, Plante, Source, SourceCounts } from "@/lib/types";

function countSources(sources: Source[]): SourceCounts {
  return {
    tradipraticien_count: sources.filter((s) => s.type === "tradipraticien").length,
    scientifique_count: sources.filter((s) => s.type === "scientifique").length,
    institution_count: sources.filter((s) => s.type === "institution").length,
  };
}

const NIVEAU_LABELS: Record<NiveauDePreuve, string> = {
  traditionnel: "Traditionnel",
  les_deux: "Traditionnel + scientifique",
  scientifique: "Scientifique",
};

interface UsageWithMaladie {
  id: string;
  preparation: string;
  posologie: string | null;
  niveau_de_preuve: NiveauDePreuve;
  maladies: { nom: string } | null;
  sources: Source[];
}

async function findPlanteBySlug(slug: string): Promise<Plante | null> {
  const { data: plantes, error } = await supabaseServer
    .from("plantes")
    .select("id, nom_local, nom_scientifique, description, precautions, photo_url")
    .returns<Plante[]>();

  if (error) throw new Error(error.message);
  return (plantes ?? []).find((p) => slugify(p.nom_local) === slug) ?? null;
}

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plante = await findPlanteBySlug(slug);
  if (!plante) notFound();

  const { data: usages, error: usagesError } = await supabaseServer
    .from("usages")
    .select(
      "id, preparation, posologie, niveau_de_preuve, maladies(nom), sources(id, usage_id, type, label, reference_url)"
    )
    .eq("plante_id", plante.id)
    .returns<UsageWithMaladie[]>();

  if (usagesError) throw new Error(usagesError.message);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <Link
        href="/plants"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Toutes les plantes
      </Link>

      <div className="flex items-start gap-4">
        {plante.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plante.photo_url}
            alt={plante.nom_local}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <LeafIcon className="h-8 w-8" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {plante.nom_local}
            </h1>
            <FavoriteButton planteNom={plante.nom_local} />
          </div>
          {plante.nom_scientifique && (
            <p className="italic text-neutral-500 dark:text-neutral-400">{plante.nom_scientifique}</p>
          )}
        </div>
      </div>

      {plante.description && (
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">{plante.description}</p>
      )}

      {plante.precautions && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="mb-1 font-medium">Précautions</p>
          <p>{plante.precautions}</p>
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        Maladies traitées
      </h2>

      <div className="space-y-3">
        {(usages ?? []).map((usage) => (
          <div
            key={usage.id}
            className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {usage.maladies?.nom}
              </span>
              <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {NIVEAU_LABELS[usage.niveau_de_preuve]}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">Préparation : </span>
              {usage.preparation}
            </p>
            {usage.posologie && (
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium text-neutral-500 dark:text-neutral-400">Posologie : </span>
                {usage.posologie}
              </p>
            )}
            <div className="mt-2">
              <ConfidenceBadge counts={countSources(usage.sources)} />
            </div>
            {usage.sources.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {usage.sources.map((s) =>
                  s.reference_url ? (
                    <li key={s.id}>
                      <a
                        href={s.reference_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {s.label}
                      </a>
                    </li>
                  ) : (
                    <li key={s.id}>{s.label}</li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
