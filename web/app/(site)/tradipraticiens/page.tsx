import Link from "next/link";
import { getTradipraticiens } from "@/lib/boutique";
import { EnteteMarche } from "@/components/boutique/EnteteMarche";

// Liste rafraîchie au plus toutes les minutes (sinon figée au build).
export const revalidate = 60;

export const metadata = {
  title: "Tradipraticiens · Lafi",
  description: "Les tradipraticiens qui vendent leurs préparations sur Lafi.",
};

export default async function TradipraticiensPage() {
  const tradipraticiens = await getTradipraticiens();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8">
      <EnteteMarche actif="tradipraticiens" />

      {tradipraticiens.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          Aucune boutique ouverte pour le moment.{" "}
          <Link href="/moi/boutique" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Ouvrir la mienne
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tradipraticiens.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/b/${t.slug}`}
                className="flex h-full gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm dark:border-neutral-800/70 dark:bg-neutral-900/60"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-semibold uppercase text-white" aria-hidden>
                  {t.nom[0]}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-neutral-900 dark:text-neutral-100">{t.nom}</span>
                  <span className="block text-xs text-neutral-500">
                    {[t.ville, `${t.remedes} remède${t.remedes > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
                  </span>
                  {t.description && <span className="mt-1 line-clamp-2 block text-sm text-neutral-600 dark:text-neutral-300">{t.description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
