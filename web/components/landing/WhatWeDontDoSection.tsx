// §9 du brief : "assumé, pas relégué en pied de page." Reprend
// directement les garde-fous structurels du §8.
const POINTS = [
  "Aucun diagnostic. Lafi documente des usages traditionnels et ce qu'en dit la science — jamais un avis médical.",
  "Aucune dose ni fréquence à l'impératif. On décrit une pratique observée, pas une prescription.",
  "Aucun pourcentage de chance de guérison. Ce que le moteur calcule, c'est une plausibilité mécanistique et un niveau d'attestation — pas une probabilité clinique.",
  "Aucun élément marchand. Pas d'achat, pas de promotion, pas d'urgence, pas d'étoiles ni de notes.",
  "Aucun statut sans son incertitude affichée à côté.",
];

export function WhatWeDontDoSection() {
  return (
    <ul className="mx-auto max-w-xl space-y-2.5">
      {POINTS.map((p) => (
        <li key={p} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="mt-0.5 shrink-0 text-red-500">✕</span>
          {p}
        </li>
      ))}
    </ul>
  );
}
