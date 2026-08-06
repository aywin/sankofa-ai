import type { LafiStats } from "@/lib/stats";

// "Le minimalisme n'est crédible que payé par des preuves" (§9 du
// brief). Uniquement des comptages réels et sourcés à une requête SQL —
// jamais "traditions indépendantes" mises en avant tant que le corpus
// est démonstratif (voir lib/stats.ts).
export function StatsSection({ stats }: { stats: LafiStats }) {
  const items = [
    { value: stats.plantesCount, label: "plantes documentées" },
    { value: stats.usagesCount, label: "usages traditionnels enregistrés" },
    { value: stats.etudesCount, label: "études scientifiques référencées" },
    { value: stats.indicationsCount, label: "indications couvertes" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-400">{item.value}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
