import type { ReactNode } from "react";

// Un nœud du pipeline (§5 du brief) : entrée réelle, sortie réelle,
// logique — jamais une boîte noire. `entree`/`sortie` sont du texte
// court, `children` porte le détail (listes, badges...).
//
// `toggle` (mode expert uniquement) : "changer un paramètre en direct...
// et voir le résultat se recalculer" (§5) — honnêtement, avec les
// données actuelles, le seul paramètre réellement manipulable est
// d'inclure ou non un nœud de preuve dans l'agrégation (② et ⑨), pas une
// simulation pharmacocinétique qu'on n'a pas les données pour faire.
export function PipelineNode({
  numero,
  titre,
  entree,
  sortie,
  children,
  toggle,
}: {
  numero: string;
  titre: string;
  entree: string;
  sortie: string;
  children?: ReactNode;
  toggle?: { enabled: boolean; onToggle: () => void; label: string };
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        toggle && !toggle.enabled
          ? "border-neutral-200/40 bg-neutral-50/30 opacity-50 dark:border-neutral-800/40 dark:bg-neutral-900/20"
          : "border-neutral-200/70 bg-neutral-50/60 dark:border-neutral-800/70 dark:bg-neutral-900/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
            {numero}
          </span>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{titre}</p>
        </div>
        {toggle && (
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <input type="checkbox" checked={toggle.enabled} onChange={toggle.onToggle} className="accent-emerald-600" />
            {toggle.label}
          </label>
        )}
      </div>
      <dl className="mt-2 space-y-0.5 pl-8 text-xs text-neutral-500 dark:text-neutral-400">
        <div>
          <dt className="inline font-medium">Entrée : </dt>
          <dd className="inline">{entree}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Sortie : </dt>
          <dd className="inline">{sortie}</dd>
        </div>
      </dl>
      {children && <div className="mt-2 pl-8 text-sm text-neutral-700 dark:text-neutral-300">{children}</div>}
    </div>
  );
}

export function PipelineArrow() {
  return (
    <div className="flex justify-center py-0.5 text-neutral-300 dark:text-neutral-700" aria-hidden>
      ↓
    </div>
  );
}
