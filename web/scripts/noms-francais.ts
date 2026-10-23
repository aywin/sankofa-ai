// Noms français courants des plantes importées sans nom français, chacun
// confirmé par une source (recherche du 24/10/2026). Le nom devient le nom
// affiché, l'adresse de la fiche suit, et les usages sont ré-indexés pour
// que la recherche du chat trouve la plante sous ce nom.
//
//   npx tsx --env-file=.env.local scripts/noms-francais.ts
//   npx tsx scripts/generate-embeddings.ts   (ensuite)

import { createClient } from "@supabase/supabase-js";
import { slugify } from "../lib/slug";

const NOMS: { sci: string; nom: string; source: string }[] = [
  { sci: "Balanites aegyptiaca", nom: "Dattier du désert", source: "https://fao.org/4/i1488f/i1488f10.pdf" },
  { sci: "Ziziphus mauritiana", nom: "Jujubier", source: "https://citarea.cita-aragon.es/bitstream/10532/1683/2/2011_338FR.pdf" },
  { sci: "Detarium microcarpum", nom: "Petit détar", source: "https://citarea.cita-aragon.es/bitstream/10532/1687/2/2011_343FR.pdf" },
  { sci: "Ximenia americana", nom: "Prunier de mer", source: "https://prosea.prota4u.org/view.aspx?id=1823" },
  { sci: "Momordica charantia", nom: "Margose", source: "https://uses.plantnet-project.org/fr/Momordica_charantia" },
  { sci: "Terminalia leiocarpa", nom: "Bouleau d'Afrique", source: "https://uses.plantnet-project.org/en/Anogeissus_leiocarpa_(PROTA)" },
  { sci: "Nauclea latifolia", nom: "Pêcher africain", source: "https://plantnames.unimelb.edu.au/Sorting/Sarcocephalus.html" },
  { sci: "Sclerocarya birrea", nom: "Prunier d'Afrique", source: "https://citarea.cita-aragon.es/bitstream/10532/1690/2/2011_341FR.pdf" },
  { sci: "Ocimum gratissimum", nom: "Basilic africain", source: "https://gbif.org/species/2927094" },
  { sci: "Annona senegalensis", nom: "Annone du Sénégal", source: "https://www.fao.org/4/AB385F/ab385f09.htm" },
  { sci: "Diospyros mespiliformis", nom: "Ébénier d'Afrique", source: "https://www.memoireonline.com/08/10/3821/m_Suivi-evaluation-de-la-phytomasse-de-cinq-especes-medicinales-dans-la-fort-communautaire-Mama-K12.html" },
  { sci: "Lippia multiflora", nom: "Thé de Gambie", source: "https://dspace.uac.bj/items/42a31ca8-7208-438a-9bb2-1d43c3f845ae/full" },
];

async function main() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  for (const { sci, nom, source } of NOMS) {
    const { data: t } = await db.from("taxon").select("id, slug").eq("nom_scientifique", sci).maybeSingle();
    if (!t) {
      console.log(`✗ ${sci} : introuvable`);
      continue;
    }
    const { data: principal } = await db.from("nom_vernaculaire").select("libelle").eq("taxon_id", t.id).eq("est_principal", true).maybeSingle();
    if (principal) {
      console.log(`· ${sci} : a déjà un nom affiché (${principal.libelle}), inchangé`);
      continue;
    }
    const { error } = await db
      .from("nom_vernaculaire")
      .upsert({ taxon_id: t.id, libelle: nom, langue: "français", est_principal: true, source }, { onConflict: "taxon_id,libelle,langue" });
    if (error) throw new Error(`${sci} : ${error.message}`);

    const slug = slugify(nom);
    const { error: errSlug } = await db.from("taxon").update({ slug }).eq("id", t.id);
    if (errSlug) console.log(`  adresse inchangée pour ${sci} (${errSlug.message})`);

    // Texte de recherche : le nom français à la place du nom scientifique,
    // puis effacement de l'index pour qu'il soit recalculé.
    const { data: claims } = await db.from("claim").select("id, contenu_pour_recherche").eq("taxon_id", t.id);
    for (const c of claims ?? []) {
      const texte = c.contenu_pour_recherche.replace(`Usage traditionnel de ${sci} (${sci})`, `Usage traditionnel de ${nom} (${sci})`);
      await db.from("claim").update({ contenu_pour_recherche: texte, embedding: null }).eq("id", c.id);
    }
    console.log(`✓ ${sci} → ${nom} (/plants/${slug}, ${claims?.length ?? 0} usage(s) à ré-indexer)`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
