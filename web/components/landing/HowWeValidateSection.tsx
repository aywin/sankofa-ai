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
    titre: "Deux axes, gardés séparés",
    texte:
      "La qualité de la preuve scientifique (échelle GRADE) et la force de l'attestation traditionnelle répondent à deux questions différentes. On les affiche côte à côte, chacune lisible pour ce qu'elle est.",
  },
];

export function HowWeValidateSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {POINTS.map((p, i) => (
        <div
          key={p.titre}
          className="rounded-2xl border border-neutral-200/70 bg-white/70 p-5 dark:border-neutral-800/70 dark:bg-neutral-900/40"
        >
          <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
            {i + 1}
          </span>
          <p className="mb-1.5 font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">{p.titre}</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{p.texte}</p>
        </div>
      ))}
    </div>
  );
}
