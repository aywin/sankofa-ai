import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";

// "Un exemple préchargé qui s'exécute, pour donner envie de cliquer"
// (§9 du brief). Bissap × Hypertension est le couple le mieux
// documenté du corpus pilote (essais cliniques humains + revue
// systématique) — le plus honnête à montrer en premier, puisqu'il ne
// sort même pas en "Convergent" mais en "Plausible" (une seule tradition
// démonstrative) : ça illustre directement pourquoi le statut n'est
// jamais gonflé.
export async function LaboratoryPreview() {
  const { data: taxon } = await supabaseServer
    .from("taxon")
    .select("id, noms_vernaculaires:nom_vernaculaire(libelle, est_principal)")
    .eq("slug", "bissap-oseille-de-guinee")
    .maybeSingle<{ id: string; noms_vernaculaires: { libelle: string; est_principal: boolean }[] }>();

  if (!taxon) return null;

  const { data: indication } = await supabaseServer
    .from("indication")
    .select("id, nom")
    .eq("nom", "Hypertension")
    .maybeSingle<{ id: string; nom: string }>();

  if (!indication) return null;

  const { data: claim } = await supabaseServer
    .from("claim")
    .select("id")
    .eq("taxon_id", taxon.id)
    .eq("indication_id", indication.id)
    .maybeSingle<{ id: string }>();

  if (!claim) return null;

  const nom = taxon.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? "Bissap";

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        {nom} × {indication.nom} — le pipeline complet, nœud par nœud, données réelles à l&apos;appui.
      </p>
      <Link
        href={`/laboratoire/${claim.id}`}
        className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Lancer cette simulation →
      </Link>
    </div>
  );
}
