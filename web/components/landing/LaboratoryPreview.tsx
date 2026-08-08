import Link from "next/link";
import Image from "next/image";
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
    <div>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        <span className="font-medium">
          {nom} × {indication.nom}
        </span>{" "}
        — le pipeline complet, nœud par nœud, données réelles à l&apos;appui.
      </p>
      <Link
        href={`/laboratoire/${claim.id}`}
        className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Lancer cette simulation
      </Link>

      {/* Illustration éditoriale — comble le vide sous le CTA dans la
          tuile bento. next/image sert une version redimensionnée/
          compressée plutôt que le PNG source (2 Mo) tel quel. */}
      <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30">
        <Image
          src="/images/laboratoire/pipeline.png"
          alt=""
          fill
          sizes="(min-width: 640px) 500px, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
