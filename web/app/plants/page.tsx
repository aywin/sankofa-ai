import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { slugify } from "@/lib/slug";
import { LeafIcon } from "@/components/chat/icons";
import type { Plante } from "@/lib/types";

export const metadata = { title: "Plantes — Lafi" };

export default async function PlantsIndexPage() {
  const { data: plantes, error } = await supabaseServer
    .from("plantes")
    .select("id, nom_local, nom_scientifique, description, precautions, photo_url")
    .order("nom_local", { ascending: true })
    .returns<Plante[]>();

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        <LeafIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        Plantes
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Le savoir traditionnel documenté par Lafi, plante par plante.
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
    </div>
  );
}
