"use client";

import type { StoredConversation } from "@/lib/conversations";
import { PlusIcon } from "./icons";

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

export function ConversationSidebar({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  userEmail,
  onSignInClick,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  conversations: StoredConversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  userEmail: string | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        aria-label="Fermer l'historique"
        onClick={onClose}
        className="flex-1 bg-black/20 backdrop-blur-[1px]"
      />
      <div className="flex h-full w-72 max-w-[80vw] flex-col border-l border-neutral-200 bg-sand-50 p-3 dark:border-neutral-800 dark:bg-sand-950">
        <button
          type="button"
          onClick={onNew}
          className="mb-3 flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          <PlusIcon />
          Nouvelle conversation
        </button>

        <div className="flex-1 space-y-1 overflow-y-auto">
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

        <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
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
      </div>
    </div>
  );
}
