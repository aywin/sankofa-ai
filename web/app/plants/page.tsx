import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { slugify } from "@/lib/slug";
import { LeafIcon } from "@/components/chat/icons";
import type { Plante } from "@/lib/types";

export const metadata = { title: "Plantes — Lafi" };

const PAGE_SIZE = 24;

export default async function PlantsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: plantes, error, count } = await supabaseServer
    .from("plantes")
    .select("id, nom_local, nom_scientifique, description, precautions, photo_url", { count: "exact" })
    .order("nom_local", { ascending: true })
    .range(from, to)
    .returns<Plante[]>();

  if (error) throw new Error(error.message);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        <LeafIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        Plantes
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Le savoir traditionnel documenté par Lafi, plante par plante
        {typeof count === "number" ? ` — ${count} au total` : ""}.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(plantes ?? []).map((plante) => (
          <Link
            key={plante.id}
            href={`/plants/${slugify(plante.nom_local)}`}
            className="rounded-2xl border border-neutral-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
          >
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{plante.nom_local}</p>
            {plante.nom_scientifique && (
              <p className="text-sm italic text-neutral-500 dark:text-neutral-400">
                {plante.nom_scientifique}
              </p>
            )}
            {plante.description && (
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                {plante.description}
              </p>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link
            href={`/plants?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`rounded-full border border-neutral-200 px-3 py-1.5 transition dark:border-neutral-700 ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
            }`}
          >
            ← Précédent
          </Link>
          <span className="text-neutral-500 dark:text-neutral-400">
            Page {page} / {totalPages}
          </span>
          <Link
            href={`/plants?page=${page + 1}`}
            aria-disabled={page >= totalPages}
            className={`rounded-full border border-neutral-200 px-3 py-1.5 transition dark:border-neutral-700 ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
            }`}
          >
            Suivant →
          </Link>
        </div>
      )}
    </div>
  );
}
