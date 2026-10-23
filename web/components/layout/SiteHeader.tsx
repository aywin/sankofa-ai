import Link from "next/link";
import { LafiMark } from "@/components/chat/icons";
import { BoutonCompte } from "@/components/compte/BoutonCompte";

// En-tête de l'accueil, seule page hors de la coquille de l'application
// (components/app/AppShell, qui a sa barre latérale).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-sand-50/90 backdrop-blur dark:border-neutral-800/70 dark:bg-sand-950/90">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <LafiMark className="h-5 w-5" />
          Lafi
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-5 font-medium text-neutral-600 dark:text-neutral-300">
          {/* Mêmes entrées que la barre latérale de l'application. */}
          <Link href="/decouverte" className="hidden hover:text-emerald-700 sm:inline dark:hover:text-emerald-400">
            Plantes
          </Link>
          <Link href="/remedes" className="hidden hover:text-emerald-700 sm:inline dark:hover:text-emerald-400">
            Remèdes
          </Link>
          <Link href="/tradipraticiens" className="hidden hover:text-emerald-700 md:inline dark:hover:text-emerald-400">
            Tradipraticiens
          </Link>
          <Link
            href="/chat"
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white transition hover:bg-emerald-700"
          >
            Parler à Lafi
          </Link>
          <BoutonCompte />
        </nav>
      </div>
    </header>
  );
}
