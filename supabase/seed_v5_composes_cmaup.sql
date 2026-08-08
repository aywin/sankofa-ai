-- ============================================================
-- LAFI — v5 : composés/cibles réels, sourcés depuis CMAUP (Collective
-- Molecular Activities of Useful Plants — Zeng et al., Nucleic Acids
-- Research 2019/2024, https://bidd.group/CMAUP/), pour élargir
-- /synergies au-delà du seul Caïlcédrat.
--
-- Portée volontairement limitée : sur les 8 couples pilotes, CMAUP
-- référence bien Karité, Goyavier, Moringa, Papayer et Caïlcédrat
-- (vérifié plante par plante sur bidd.group). Bissap et Vernonia ne sont
-- PAS dans CMAUP (recherche par genre infructueuse) et Neem, bien que
-- présent, n'a livré aucun composé nommé avec cible documentée dans le
-- temps de recherche disponible — les trois restent donc absents d'ici,
-- honnêtement, plutôt que d'y forcer une donnée non vérifiée.
--
-- Chaque composé ci-dessous est confirmé présent dans la plante via la
-- fiche CMAUP de cette plante (bidd.group/CMAUP/plant.php?plant=...) ;
-- chaque cible et sa valeur d'activité viennent de la fiche CMAUP de
-- l'ingrédient (bidd.group/CMAUP/ingredient.php?ingredient=...), qui
-- cite elle-même un PMID. C'est un lien "molécule → cible" pharmaco-
-- logique général, PAS une preuve que ce composé explique l'usage
-- traditionnel de la plante — cette distinction reste celle que le
-- Laboratoire protège déjà (jamais fusionner tradition et science).
--
-- À exécuter dans Supabase après schema_v4.sql et seed_v4_pilotes.sql.
-- ============================================================

-- Quercétine — confirmée dans Karité, Goyavier et Caïlcédrat (fiches
-- CMAUP respectives). NPC20791, PubChem CID 5280343, ChEMBL CHEMBL50.
insert into compose (taxon_id, nom, methode_identification)
select t.id, 'Quercétine', 'Association plante-ingrédient répertoriée dans CMAUP (bidd.group/CMAUP), NPC20791'
from taxon t
where t.slug in ('karite', 'goyavier', 'cailcedrat')
and not exists (select 1 from compose where taxon_id = t.id and nom = 'Quercétine');

insert into cible (compose_id, proteine, affinite, source)
select co.id, v.proteine, v.affinite, v.source
from compose co
join taxon t on t.id = co.taxon_id
join (values
  ('CYP1B1', 'IC50 = 77 nM', 'https://pubmed.ncbi.nlm.nih.gov/20696580/'),
  ('KDR', 'IC50 = 280 nM', 'https://pubmed.ncbi.nlm.nih.gov/24328302/'),
  ('IGF1R', 'IC50 = 300 nM', 'https://pubmed.ncbi.nlm.nih.gov/24328302/')
) as v(proteine, affinite, source) on true
where t.slug in ('karite', 'goyavier', 'cailcedrat')
  and co.nom = 'Quercétine'
  and not exists (select 1 from cible c where c.compose_id = co.id and c.proteine = v.proteine);

-- Acide ascorbique (vitamine C) — confirmé dans Goyavier, Moringa et
-- Papayer (fiches CMAUP respectives). NPC187770, PubChem CID 54670067.
insert into compose (taxon_id, nom, methode_identification)
select t.id, 'Acide ascorbique (vitamine C)', 'Association plante-ingrédient répertoriée dans CMAUP (bidd.group/CMAUP), NPC187770'
from taxon t
where t.slug in ('goyavier', 'moringa', 'papayer')
and not exists (select 1 from compose where taxon_id = t.id and nom = 'Acide ascorbique (vitamine C)');

insert into cible (compose_id, proteine, affinite, source)
select co.id, v.proteine, v.affinite, v.source
from compose co
join taxon t on t.id = co.taxon_id
join (values
  ('ADRA2B', 'EC50 = 0.5 nM', 'https://pubmed.ncbi.nlm.nih.gov/19243956/'),
  ('TYR (tyrosinase)', 'IC50 = 32500 nM', 'https://pubmed.ncbi.nlm.nih.gov/25726329/')
) as v(proteine, affinite, source) on true
where t.slug in ('goyavier', 'moringa', 'papayer')
  and co.nom = 'Acide ascorbique (vitamine C)'
  and not exists (select 1 from cible c where c.compose_id = co.id and c.proteine = v.proteine);

-- Vérification attendue après exécution :
--   select t.slug, co.nom, count(ci.id) as cibles
--   from compose co join taxon t on t.id = co.taxon_id
--   left join cible ci on ci.compose_id = co.id
--   where t.slug in ('karite','goyavier','moringa','papayer','cailcedrat')
--   group by t.slug, co.nom order by t.slug;
--   -> karite/Quercétine (3), goyavier/Quercétine (3),
--      goyavier/Acide ascorbique (2), moringa/Acide ascorbique (2),
--      papayer/Acide ascorbique (2), cailcedrat/Limonoïde... (1, déjà
--      existant), cailcedrat/Quercétine (3).
