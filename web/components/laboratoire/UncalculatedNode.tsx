// Mode expert : chaque nœud absent a sa propre raison, pas un bloc
// générique — c'est ce qui distingue "on n'a pas encore fait" de "on ne
// veut pas montrer".
export function UncalculatedNode({ numero, titre, raison }: { numero: string; titre: string; raison: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/30">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-neutral-500 dark:border-neutral-600 dark:text-neutral-500">
          {numero}
        </span>
        <p className="font-semibold text-neutral-500 dark:text-neutral-500">{titre}</p>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500">
          non calculé
        </span>
      </div>
      <p className="mt-1.5 pl-8 text-xs text-neutral-500 dark:text-neutral-500">{raison}</p>
    </div>
  );
}
