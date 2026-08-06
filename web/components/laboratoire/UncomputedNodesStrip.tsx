const NODES = [
  { numero: "③", titre: "Profil phytochimique" },
  { numero: "④", titre: "Cinétique d'extraction" },
  { numero: "⑤", titre: "Filtre ADME" },
  { numero: "⑥", titre: "Cibles moléculaires" },
  { numero: "⑦", titre: "Cartographie pathologie" },
  { numero: "⑧", titre: "Convergence réseau" },
];

// Le mode simple n'affiche que les nœuds réellement calculables
// aujourd'hui (résolution, attestation, littérature, agrégation,
// sécurité). Les six autres existent dans l'architecture cible (§5 du
// brief) mais demandent des données absentes de la base (composés,
// cibles moléculaires, cartographie des voies biologiques) — on les
// nomme plutôt que de les cacher, pour ne jamais laisser croire que le
// pipeline s'arrête là par choix plutôt que par manque de données.
export function UncomputedNodesStrip() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 p-3 text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
      <p className="mb-1.5 font-medium uppercase tracking-wide">Non calculés dans cette version</p>
      <div className="flex flex-wrap gap-1.5">
        {NODES.map((n) => (
          <span
            key={n.numero}
            className="rounded-full border border-neutral-200 px-2 py-0.5 dark:border-neutral-700"
          >
            {n.numero} {n.titre}
          </span>
        ))}
      </div>
      <p className="mt-1.5">
        Données phytochimiques, ADME et cartographie des voies biologiques absentes de la base pour l&apos;instant.
      </p>
    </div>
  );
}
