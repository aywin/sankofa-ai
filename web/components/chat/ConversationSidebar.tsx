"use client";

import Link from "next/link";
import type { StoredConversation } from "@/lib/conversations";
import type { FavoritePlant } from "@/lib/favorites";
import { slugify } from "@/lib/slug";
import { ActivityIcon, CameraIcon, LeafIcon, PlusIcon, StarIcon } from "./icons";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function relativeDate(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "hier";
  if (diffD < 7) return `il y a ${diffD} j`;
  return new Date(timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// Sidebar hybride : tiroir en overlay sur mobile (piloté par `open`),
// panneau persistant sur desktop (piloté par `visible` — repliable,
// état conservé dans localStorage par le parent). Les deux flags sont
// indépendants exprès : sur desktop `open` n'a pas de sens (pas de
// backdrop), sur mobile `visible` n'a pas de sens (pas de collapse).
export function ConversationSidebar({
  open,
  visible,
  onClose,
  onExplore,
  onContribute,
  conversations,
  favorites,
  activeId,
  onSelect,
  onNew,
  onDelete,
  userEmail,
  onSignInClick,
  onSignOut,
}: {
  open: boolean;
  visible: boolean;
  onClose: () => void;
  onExplore: (target: "plants" | "maladies" | "photo") => void;
  onContribute: () => void;
  conversations: StoredConversation[];
  favorites: FavoritePlant[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  userEmail: string | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer l'historique"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[80vw] flex-col border-r border-neutral-200 bg-sand-50 p-3 transition-transform duration-200 dark:border-neutral-800 dark:bg-sand-950 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:static md:z-auto md:translate-x-0 md:transition-[width,padding,opacity] ${
          visible ? "md:w-72 md:opacity-100" : "md:w-0 md:overflow-hidden md:p-0 md:opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onNew}
          className="mb-3 flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          <PlusIcon />
          Nouvelle conversation
        </button>

        <div className="shrink-0 space-y-0.5 border-b border-neutral-200 pb-2 dark:border-neutral-800">
          <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Explorer
          </p>
          <Link
            href="/plants"
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <LeafIcon className="h-4 w-4" />
            Plantes
          </Link>
          <Link
            href="/maladies"
            className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <ActivityIcon className="h-4 w-4" />
            Maladies
          </Link>
          <button
            type="button"
            onClick={() => onExplore("photo")}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <CameraIcon className="h-4 w-4" />
            Identifier une plante
          </button>
          <button
            type="button"
            onClick={onContribute}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            <PlusIcon />
            Contribuer
          </button>
        </div>

        {favorites.length > 0 && (
          <div className="shrink-0 space-y-0.5 border-b border-neutral-200 py-2 dark:border-neutral-800">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Favoris
            </p>
            <div className="max-h-32 space-y-0.5 overflow-y-auto">
              {favorites.map((fav) => (
                <Link
                  key={fav.planteNom}
                  href={`/plants/${slugify(fav.planteNom)}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  <StarIcon filled className="h-3.5 w-3.5 text-amber-500" />
                  <span className="truncate">{fav.planteNom}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 space-y-1 overflow-y-auto pt-2">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Pas encore d&apos;historique.
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-xl px-2 py-2 text-sm transition ${
                c.id === activeId
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="flex-1 truncate text-left"
              >
                <span className="block truncate">{c.title}</span>
                <span className="block text-[11px] text-neutral-400 dark:text-neutral-500">
                  {relativeDate(c.updatedAt)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                aria-label="Supprimer la conversation"
                className="shrink-0 rounded-lg p-1.5 text-neutral-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 shrink-0 border-t border-neutral-200 pt-2 dark:border-neutral-800">
          {userEmail ? (
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="shrink-0 text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignInClick}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              Se connecter — synchroniser l&apos;historique
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
