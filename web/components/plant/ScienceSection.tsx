import type { Cible, Compose } from "@/lib/types";

// Composés identifiés, cibles connues — et explicitement ce qui n'a pas
// été étudié (§4 du brief). Porté par le Taxon (une propriété chimique de
// la plante), pas par un claim précis — contrairement aux Études, qui
// appuient une indication spécifique et sont affichées avec elle.
export function ScienceSection({ composes }: { composes: Array<Compose & { cibles: Cible[] }> }) {
  if (composes.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Aucun composé chimique documenté à ce jour pour cette plante.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {composes.map((c) => (
        <div key={c.id} className="rounded-xl border border-neutral-200/70 p-3 text-sm dark:border-neutral-800/70">
          <p className="font-medium text-neutral-800 dark:text-neutral-200">{c.nom}</p>
          {c.methode_identification && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{c.methode_identification}</p>
          )}
          {c.cibles.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              {c.cibles.map((cible) => (
                <li key={cible.id}>
                  Cible : {cible.proteine}
                  {cible.affinite ? ` (${cible.affinite})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
