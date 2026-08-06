const POINTS = [
  {
    titre: "Le claim, pas la fiche",
    texte:
      "On ne stocke pas des fiches de plantes toutes faites. On stocke des affirmations vérifiables — une plante, une partie utilisée, une préparation, une indication — chacune avec son propre niveau de preuve.",
  },
  {
    titre: "L'indépendance, pas le nombre",
    texte:
      "Dix personnes formées par le même maître, c'est une source répétée dix fois, pas dix sources. Ce qui compte, c'est combien de traditions réellement distinctes convergent — pas combien de fois on l'a entendu dire.",
  },
  {
    titre: "Deux axes, jamais fusionnés",
    texte:
      "La qualité de la preuve scientifique (échelle GRADE) et la force de l'attestation traditionnelle sont deux questions différentes. On ne les réduit jamais à un seul chiffre ou un pourcentage de guérison.",
  },
];

export function HowWeValidateSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {POINTS.map((p) => (
        <div key={p.titre} className="rounded-2xl border border-neutral-200/70 p-4 dark:border-neutral-800/70">
          <p className="mb-1.5 font-semibold text-neutral-900 dark:text-neutral-100">{p.titre}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{p.texte}</p>
        </div>
      ))}
    </div>
  );
}
