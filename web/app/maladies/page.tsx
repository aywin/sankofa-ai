import { supabaseServer } from "@/lib/supabase";
import { ActivityIcon } from "@/components/chat/icons";
import type { Maladie } from "@/lib/types";

export const metadata = { title: "Maladies — Lafi" };

export default async function MaladiesIndexPage() {
  const { data: maladies, error } = await supabaseServer
    .from("maladies")
    .select("id, nom, symptomes, description")
    .order("nom", { ascending: true })
    .returns<Maladie[]>();

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        <ActivityIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        Maladies
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Les maladies pour lesquelles Lafi connaît des usages traditionnels documentés.
      </p>

      <div className="space-y-3">
        {(maladies ?? []).map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/40"
          >
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{m.nom}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{m.symptomes}</p>
            {m.description && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{m.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
