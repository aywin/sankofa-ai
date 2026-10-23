"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/useAuth";
import { LafiMark } from "@/components/chat/icons";
import { Sidebar } from "./Sidebar";
import { estActif, ICONES } from "./navigation";

// Coquille de l'application (tout sauf l'accueil) : une seule barre
// latérale — navigation + conversations récentes + compte — qui sert aussi
// de barre du chat. Sur téléphone : barre du haut, tiroir, et quatre
// entrées en bas de l'écran.

const CLE_REPLIE = "lafi-barre-repliee";

interface Coquille {
  replie: boolean;
  // Le panneau du chat replie la barre pour laisser la place à la réponse.
  setReplie: (r: boolean) => void;
}
const CoquilleContexte = createContext<Coquille>({ replie: false, setReplie: () => {} });
export const useCoquille = () => useContext(CoquilleContexte);

const BAS = [
  { cle: "lafi" as const, href: "/chat", libelle: "Lafi", prefixes: ["/chat"] },
  { cle: "plantes" as const, href: "/decouverte", libelle: "Plantes", prefixes: ["/decouverte", "/plants", "/maladies", "/laboratoire", "/synergies"] },
  { cle: "remedes" as const, href: "/remedes", libelle: "Remèdes", prefixes: ["/remedes", "/tradipraticiens", "/b/"] },
  { cle: "moi" as const, href: "/moi", libelle: "Moi", prefixes: ["/moi", "/admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [replie, setReplieEtat] = useState(false);
  const [tiroir, setTiroir] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(CLE_REPLIE) === "1") setReplieEtat(true);
    } catch {}
  }, []);

  const setReplie = (r: boolean) => {
    setReplieEtat(r);
    try {
      window.localStorage.setItem(CLE_REPLIE, r ? "1" : "0");
    } catch {}
  };

  return (
    <CoquilleContexte.Provider value={{ replie, setReplie }}>
      <div className="flex h-dvh flex-col md:flex-row">
        <aside
          className={`hidden shrink-0 border-r border-neutral-200 bg-sand-50 transition-[width] duration-200 md:block dark:border-neutral-800/70 dark:bg-sand-950 ${
            replie ? "w-[72px]" : "w-[264px]"
          }`}
        >
          <Suspense>
            <Sidebar user={user} replie={replie} onReplier={() => setReplie(!replie)} />
          </Suspense>
        </aside>

        <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200 px-2 md:hidden dark:border-neutral-800/70">
          <button type="button" onClick={() => setTiroir(true)} aria-label="Ouvrir le menu" className="rounded-lg p-2 text-neutral-600 dark:text-neutral-300">
            {ICONES.menu("h-5 w-5")}
          </button>
          <Link href="/" className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <LafiMark className="h-5 w-5" />
            Lafi
          </Link>
          <button
            type="button"
            onClick={() => router.push(`/chat?nouveau=${Date.now()}`)}
            aria-label="Nouvelle conversation"
            className="rounded-lg p-2 text-neutral-600 dark:text-neutral-300"
          >
            {ICONES.plus("h-5 w-5")}
          </button>
        </header>

        {tiroir && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" aria-label="Fermer le menu" onClick={() => setTiroir(false)} className="absolute inset-0 bg-black/40" />
            <aside className="relative h-full w-[280px] max-w-[85vw] bg-sand-50 shadow-xl dark:bg-sand-950">
              <Suspense>
                <Sidebar user={user} replie={false} onNaviguer={() => setTiroir(false)} />
              </Suspense>
            </aside>
          </div>
        )}

        {/* Pas de <main> ici : chaque page porte le sien. */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>

        <nav aria-label="Navigation" className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-sand-50 pb-[env(safe-area-inset-bottom)] md:hidden dark:border-neutral-800/70 dark:bg-sand-950">
          {BAS.map((b) => {
            const actif = estActif(pathname, b.prefixes);
            return (
              <Link
                key={b.cle}
                href={b.href}
                aria-current={actif ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  actif ? "text-emerald-700 dark:text-emerald-400" : "text-neutral-500"
                }`}
              >
                {ICONES[b.cle]("h-5 w-5")}
                {b.libelle}
              </Link>
            );
          })}
        </nav>
      </div>
    </CoquilleContexte.Provider>
  );
}
