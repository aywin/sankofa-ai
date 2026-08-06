import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";

interface Row {
  id: string;
  nom: string;
  claims: { count: number }[];
}

// "Explorer par le mal" (§9 du brief) : uniquement les catégories
// effectivement couvertes, avec leur vrai décompte — même règle que les
// filtres de la page découverte (lib/decouverte.ts).
export async function IndicationsPreview() {
  const { data } = await supabaseServer
    .from("indication")
    .select("id, nom, claims:claim(count)")
    .returns<Row[]>();

  const sorted = (data ?? []).sort((a, b) => (b.claims[0]?.count ?? 0) - (a.claims[0]?.count ?? 0));

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {sorted.map((i) => (
        <Link
          key={i.id}
          href={`/decouverte?indication=${i.id}`}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-800 dark:hover:text-emerald-400"
        >
          {i.nom} <span className="text-neutral-400 dark:text-neutral-500">({i.claims[0]?.count ?? 0})</span>
        </Link>
      ))}
    </div>
  );
}
