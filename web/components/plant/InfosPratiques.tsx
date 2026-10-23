import type { Taxon } from "@/lib/types";

// Ce dont on a besoin pour se procurer et utiliser la plante sans risque :
// où la trouver, quand, comment la garder ; puis ce qui peut mal tourner.
// Rien ne s'affiche pour une information absente.

function Ligne({ titre, valeur }: { titre: string; valeur?: string | null }) {
  if (!valeur) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500">{titre}</dt>
      <dd className="mt-0.5 text-sm text-neutral-800 dark:text-neutral-200">{valeur.split(" | ").join(", ")}</dd>
    </div>
  );
}

export function OuLaTrouver({ taxon }: { taxon: Taxon }) {
  const champs = [taxon.ou_la_trouver, taxon.regions_burkina, taxon.localites, taxon.saison_recolte, taxon.conservation, taxon.pays_presence];
  if (!champs.some(Boolean)) return null;
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Où la trouver</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Ligne titre="Où se la procurer" valeur={taxon.ou_la_trouver} />
        <Ligne titre="Régions du Burkina" valeur={taxon.regions_burkina} />
        <Ligne titre="Localités citées" valeur={taxon.localites} />
        <Ligne titre="Saison" valeur={taxon.saison_recolte} />
        <Ligne titre="Conservation" valeur={taxon.conservation} />
        <Ligne titre="Aussi présente au" valeur={taxon.pays_presence} />
      </dl>
    </section>
  );
}

export function Securite({ taxon }: { taxon: Taxon }) {
  // « non » seul ne prouve rien : on n'affiche la toxicité que si elle est
  // documentée (« oui… ») ou expliquée.
  const toxicite = taxon.toxicite_connue && !/^non\b/i.test(taxon.toxicite_connue) ? taxon.toxicite_connue.replace(/^oui[.:]?\s*/i, "") : null;
  const interactions =
    taxon.interactions_medicaments && taxon.interactions_medicaments !== "aucune_interaction_trouvee" ? taxon.interactions_medicaments : null;
  if (!toxicite && !interactions && !taxon.confusions_possibles && !taxon.statut_protection) return null;
  return (
    <section className="rounded-2xl border border-laterite-200 bg-laterite-50/60 p-4 dark:border-laterite-900 dark:bg-laterite-950/40">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Sécurité</h2>
      <dl className="space-y-3">
        <Ligne titre="Toxicité connue" valeur={toxicite} />
        <Ligne titre="Interactions avec des médicaments" valeur={interactions} />
        <Ligne titre="Ne pas confondre avec" valeur={taxon.confusions_possibles} />
        <Ligne titre="Protection de l'espèce" valeur={taxon.statut_protection} />
      </dl>
    </section>
  );
}

export function SourcesPlante({ sources }: { sources?: string | null }) {
  if (!sources) return null;
  const liens = sources
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <p className="text-xs text-neutral-500">
      Sources :{" "}
      {liens.map((s, i) => {
        const url = s.match(/https?:\/\/\S+/)?.[0];
        let libelle = s;
        if (url) {
          try {
            libelle = s.replace(url, "").replace(/,?\s*cité dans\s*$/, "").trim() || new URL(url).hostname.replace(/^www\./, "");
          } catch {}
        }
        return (
          <span key={i}>
            {i > 0 && ", "}
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="hover:underline">
                {libelle}
              </a>
            ) : (
              libelle
            )}
          </span>
        );
      })}
      .
    </p>
  );
}
