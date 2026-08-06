import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { SyntheseBadge } from "@/components/shared/SyntheseBadge";
import { LeafIcon } from "@/components/chat/icons";
import type { GradeTier } from "@/lib/types";

interface Row {
  id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  est_pilote: boolean;
  taxon: { slug: string; nom_scientifique: string; noms_vernaculaires: { libelle: string; est_principal: boolean }[] } | null;
  indication: { nom: string } | null;
  attestations: { lignee_id: string }[];
  etudes: { id: string }[];
}

// La "capture produit" du hero (tendance 2026 : montrer le vrai produit,
// pas une illustration) — une vraie carte, vraies données, pas une
// maquette. Flotte au-dessus du graphe côté desktop.
export async function HeroPreviewCard() {
  const { data } = await supabaseServer
    .from("claim")
    .select(
      `id, qualite_preuve_scientifique, contre_indication_forte, est_pilote,
       taxon(slug, nom_scientifique, noms_vernaculaires:nom_vernaculaire(libelle, est_principal)),
       indication(nom),
       attestations:attestation(lignee_id),
       etudes:etude(id)`
    )
    .returns<Row[]>();

  const row = (data ?? []).find((r) => r.taxon?.slug === "bissap-oseille-de-guinee" && r.indication?.nom === "Hypertension");
  if (!row || !row.taxon || !row.indication) return null;

  const nom = row.taxon.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? row.taxon.nom_scientifique;
  const lignees = new Set(row.attestations.map((a) => a.lignee_id));

  return (
    <Link
      href={`/laboratoire/${row.id}`}
      className="block w-full max-w-[300px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 sm:rotate-2 sm:hover:rotate-0"
    >
      <div className="flex items-center gap-1.5 text-emerald-700">
        <LeafIcon className="h-4 w-4 shrink-0" />
        <span className="font-semibold text-neutral-900">{nom}</span>
      </div>
      <p className="text-xs italic text-neutral-500">{row.taxon.nom_scientifique}</p>
      <p className="mt-2 text-sm text-neutral-700">
        Pour : <span className="font-medium">{row.indication.nom}</span>
      </p>
      <div className="mt-2">
        <SyntheseBadge
          qualitePreuve={row.qualite_preuve_scientifique}
          stats={{
            attestations_count: row.attestations.length,
            lignees_distinctes: lignees.size,
            regions_distinctes: 0,
            langues_distinctes: 0,
          }}
          contreIndicationForte={row.contre_indication_forte}
          divergenceNote={null}
          estPilote={row.est_pilote}
        />
      </div>
      <p className="mt-3 text-xs font-medium text-emerald-700">Voir le raisonnement complet →</p>
    </Link>
  );
}
