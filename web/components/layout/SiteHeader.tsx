import Link from "next/link";
import { LafiMark } from "@/components/chat/icons";

// Navigation persistante partagée par toutes les pages hors chat (qui a
// sa propre coquille avec sidebar) — corrige l'absence de navigation
// relevée sur /plants, /maladies, /decouverte, /laboratoire : chacune
// vivait auparavant sans aucun moyen de circuler ailleurs dans le site.
export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200/70 dark:border-neutral-800/70">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <LafiMark className="h-5 w-5" />
          Lafi
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <Link href="/decouverte" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Découverte
          </Link>
          <Link href="/laboratoire" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Laboratoire
          </Link>
          <Link
            href="/chat"
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white transition hover:bg-emerald-700"
          >
            Parler à Lafi
          </Link>
        </nav>
      </div>
    </header>
  );
}
