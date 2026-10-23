"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { deleteConversation, loadConversations, migrateLocalToRemote, type StoredConversation } from "@/lib/conversations";
import { migrateLocalFavoritesToRemote } from "@/lib/favorites";
import { LafiMark } from "@/components/chat/icons";
import { AuthModal } from "@/components/compte/AuthModal";
import { estActif, ICONES, NAVIGATION } from "./navigation";

// Le chat signale chaque enregistrement de conversation par cet événement :
// la liste des récents se met à jour sans état partagé.
export const EVENEMENT_CONVERSATIONS = "lafi:conversations";

function dateCourte(ms: number) {
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.round(minutes / 60)} h`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(ms);
}

export function Sidebar({
  user,
  replie,
  onReplier,
  onNaviguer,
}: {
  user: User | null;
  replie: boolean;
  onReplier?: () => void;
  // Fermeture du tiroir mobile après un clic.
  onNaviguer?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [authOuverte, setAuthOuverte] = useState(false);
  const migrePour = useRef<string | null>(null);

  const charger = useCallback(() => {
    loadConversations(user?.id ?? null).then(setConversations);
  }, [user?.id]);

  useEffect(() => {
    // À la connexion, l'historique et les plantes du mode invité passent
    // sur le compte (une fois par session).
    if (user && migrePour.current !== user.id) {
      migrePour.current = user.id;
      migrateLocalToRemote(user.id).then(charger);
      migrateLocalFavoritesToRemote(user.id);
    } else {
      charger();
    }
    window.addEventListener(EVENEMENT_CONVERSATIONS, charger);
    return () => window.removeEventListener(EVENEMENT_CONVERSATIONS, charger);
  }, [user, charger]);

  const params = useSearchParams();
  const conversationActive = pathname === "/chat" ? params.get("c") : null;

  const supprimer = async (id: string) => {
    await deleteConversation(user?.id ?? null, id);
    charger();
    if (id === conversationActive) router.push("/chat");
  };

  const lien = (actif: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${replie ? "justify-center px-0" : ""} ${
      actif
        ? "bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
    }`;

  return (
    <nav aria-label="Navigation principale" className="flex h-full flex-col gap-2 p-3">
      <div className={`flex items-center ${replie ? "justify-center" : "justify-between"} px-1 pb-1`}>
        {!replie && (
          <Link href="/" onClick={onNaviguer} className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            <LafiMark className="h-5 w-5" />
            Lafi
          </Link>
        )}
        {onReplier && (
          <button
            type="button"
            onClick={onReplier}
            aria-label={replie ? "Déplier la barre latérale" : "Replier la barre latérale"}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {ICONES.replier("h-5 w-5")}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          // Horodatage au clic : chaque clic ouvre une conversation neuve.
          router.push(`/chat?nouveau=${Date.now()}`);
          onNaviguer?.();
        }}
        title="Nouvelle conversation"
        className={`flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 ${
          replie ? "justify-center px-0" : ""
        }`}
      >
        {ICONES.plus("h-4 w-4")}
        {!replie && "Nouvelle conversation"}
      </button>

      <ul className="space-y-0.5">
        {NAVIGATION.map((n) => (
          <li key={n.cle}>
            <Link href={n.href} onClick={onNaviguer} title={n.libelle} aria-current={estActif(pathname, n.prefixes) ? "page" : undefined} className={lien(estActif(pathname, n.prefixes))}>
              {ICONES[n.cle]("h-5 w-5 shrink-0")}
              {!replie && n.libelle}
            </Link>
          </li>
        ))}
      </ul>

      {!replie && (
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500">Récents</p>
          {conversations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-neutral-500">Tes conversations apparaîtront ici.</p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.slice(0, 30).map((c) => (
                <li key={c.id} className="group flex items-center">
                  <Link
                    href={`/chat?c=${c.id}`}
                    onClick={onNaviguer}
                    className={`min-w-0 flex-1 rounded-xl px-3 py-1.5 ${
                      c.id === conversationActive ? "bg-neutral-100 dark:bg-neutral-900" : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span className="block truncate text-sm text-neutral-700 dark:text-neutral-200">{c.title}</span>
                    <span className="block text-[11px] text-neutral-500">{dateCourte(c.updatedAt)}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => supprimer(c.id)}
                    aria-label={`Supprimer « ${c.title} »`}
                    className="shrink-0 rounded-lg p-1.5 text-neutral-400 opacity-0 transition hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    {ICONES.corbeille("h-4 w-4")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {replie && <div className="flex-1" />}

      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
        {user ? (
          <Link href="/moi" onClick={onNaviguer} title="Mon espace" className={lien(pathname.startsWith("/moi"))}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold uppercase text-white" aria-hidden>
              {((user.user_metadata?.nom as string | undefined) ?? user.email ?? "?")[0]}
            </span>
            {!replie && (
              <span className="min-w-0">
                <span className="block text-sm font-medium">Mon espace</span>
                <span className="block truncate text-[11px] text-neutral-500">{user.email}</span>
              </span>
            )}
          </Link>
        ) : (
          <button type="button" onClick={() => setAuthOuverte(true)} title="Se connecter" className={`${lien(false)} w-full`}>
            {ICONES.moi("h-5 w-5 shrink-0")}
            {!replie && "Se connecter"}
          </button>
        )}
      </div>
      {authOuverte && <AuthModal onClose={() => setAuthOuverte(false)} onConnecte={(t) => t && router.push("/moi/boutique")} />}
    </nav>
  );
}
