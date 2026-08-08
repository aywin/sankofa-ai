-- ============================================================
-- LAFI — v6 : élargissement du corpus pilote, à partir de trois
-- recherches documentaires indépendantes (DOIs/PMID vérifiés un par un
-- via WebFetch — jamais une référence non résolue).
--
-- Deux catégories de changement :
--   A) Promotion de 8 claims déjà en base (corpus démonstratif v1) au
--      statut pilote, avec de vraies études.
--   B) 5 nouveaux claims sur 3 nouvelles indications (Acné, Ulcère
--      gastrique, Drépanocytose) — aucun ne reçoit d'attestation
--      traditionnelle : ce sont des données scientifiques sur un
--      extrait de laboratoire, jamais un usage traditionnel vérifié.
--      Le statut restera donc "non renseignée" côté tradition, jamais
--      fusionné avec l'axe scientifique.
--
-- Couple                         | GRADE       | Justification
-- Aloe vera × Plaies             | moderee     | revue systématique + 2 essais cliniques humains
-- Kinkeliba × Hypertension       | moderee     | 2 essais cliniques humains randomisés concordants
-- Néré × Paludisme               | tres_faible | préclinique in vitro/animal + revue narrative
-- Néré × Fièvre typhoïde         | tres_faible | préclinique in vitro uniquement
-- Tamarin × Fièvre typhoïde      | tres_faible | préclinique in vitro, résultats CONTRADICTOIRES (voir divergence_note)
-- Baobab × Fièvre typhoïde       | tres_faible | préclinique in vitro uniquement
-- Citronnelle × Insomnie         | faible      | seul essai humain contrôlé NÉGATIF malgré effets positifs chez l'animal (voir divergence_note)
-- Citronnelle × Maux de tête     | tres_faible | préclinique animal uniquement
-- Neem × Acné (nouveau)          | tres_faible | in vitro, extrait de laboratoire
-- Moringa × Acné (nouveau)       | tres_faible | in vitro, extrait de laboratoire
-- Fagara × Drépanocytose (nouv.) | tres_faible | essai clinique préliminaire 1975 non répliqué + in vitro 2009
-- Vernonia × Ulcère gastrique    | tres_faible | préclinique animal uniquement
-- Caïlcédrat × Ulcère gastrique  | tres_faible | préclinique animal uniquement
--
-- Volontairement écartés faute de preuve vérifiable ou trop ambigus :
-- Citron × Toux (rien de direct), Kinkeliba × Diarrhée (rien de direct),
-- Papayer × Ulcère cutané (enquête descriptive non contrôlée, pas un
-- essai), Calotropis procera / FACA (référence primaire introuvable),
-- une indication "Ulcères" générique (gastrique et cutané sont deux
-- réalités distinctes, jamais fusionnées ici).
--
-- À exécuter après schema_v4.sql, migrate_v4_legacy.sql, schema_v10.sql.
-- ============================================================

-- ============================================================
-- A. Nouveau taxon : Fagara (Zanthoxylum zanthoxyloides)
-- ============================================================
insert into taxon (slug, nom_scientifique, autorite, famille, precautions)
select 'fagara', 'Zanthoxylum zanthoxyloides', '(Lam.) Zepern. & Timler', 'Rutaceae',
  'Peu de données de sécurité modernes disponibles. Le seul essai clinique connu (1975) est préliminaire et n''a pas été répliqué à grande échelle depuis — à considérer comme exploratoire, pas comme un usage validé.'
where not exists (select 1 from taxon where slug = 'fagara');

insert into nom_vernaculaire (taxon_id, libelle, langue, est_principal)
select t.id, 'Fagara', 'français', true
from taxon t where t.slug = 'fagara'
and not exists (select 1 from nom_vernaculaire where taxon_id = t.id and libelle = 'Fagara');

-- ============================================================
-- B. Nouvelles indications
-- ============================================================
insert into indication (nom, symptomes, description)
select v.nom, v.symptomes, v.description
from (values
  ('Acné', 'boutons, points noirs, inflammation cutanée du visage', 'Affection cutanée liée à l''inflammation des follicules pilo-sébacés, souvent associée à la bactérie Cutibacterium acnes.'),
  ('Drépanocytose', 'crises douloureuses vaso-occlusives, anémie, fatigue', 'Maladie génétique héréditaire du globule rouge, à forte prévalence en Afrique de l''Ouest — sujet de recherche ethnopharmacologique actif dans la région, notamment au Burkina Faso (IRSS Ouagadougou).'),
  ('Ulcère gastrique', 'douleurs épigastriques, brûlures d''estomac, digestion difficile', 'Lésion de la muqueuse de l''estomac ou du duodénum — distinct d''une plaie cutanée, jamais confondu avec elle dans Lafi.')
) as v(nom, symptomes, description)
where not exists (select 1 from indication i where i.nom = v.nom);

-- ============================================================
-- C. Promotion au statut pilote de 8 claims déjà en base
-- ============================================================

-- Aloe vera × Plaies et infections cutanées
update claim c set est_pilote = true, qualite_preuve_scientifique = 'moderee'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'aloe-vera' and i.nom = 'Plaies et infections cutanées';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'The efficacy of aloe vera used for burn wound healing: a systematic review', 'revue_systematique', 2007, 'https://pubmed.ncbi.nlm.nih.gov/17499928/'),
  ('10.1097/PRS.0000000000004515', 'Topical Aloe Vera Gel for Accelerated Wound Healing of Split-Thickness Skin Graft Donor Sites: A Double-Blind, Randomized, Controlled Trial and Systematic Review', 'essai_clinique_humain', 2018, 'https://pubmed.ncbi.nlm.nih.gov/29649056/'),
  ('10.5539/gjhs.v7n1p203', 'Aloe Vera Gel and Cesarean Wound Healing; A Randomized Controlled Clinical Trial', 'essai_clinique_humain', 2014, 'https://pubmed.ncbi.nlm.nih.gov/25560349/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'aloe-vera' and i.nom = 'Plaies et infections cutanées'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Kinkeliba × Hypertension
update claim c set est_pilote = true, qualite_preuve_scientifique = 'moderee'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'kinkeliba' and i.nom = 'Hypertension';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.1038/s41371-017-0001-6'::text, 'Clinical efficacy of African traditional medicines in hypertension: A randomized controlled trial with Combretum micranthum and Hibiscus sabdariffa', 'essai_clinique_humain', 2018, 'https://pubmed.ncbi.nlm.nih.gov/29311704/'),
  ('10.1038/s41371-020-00415-1', 'Hypertension treatment with Combretum micranthum or Hibiscus sabdariffa, as decoction or tablet: a randomized clinical trial', 'essai_clinique_humain', 2021, null),
  ('10.1016/j.jff.2024.106511', 'Combretum micranthum G. Don (Combretaceae): Its physiological effects on hydro-electrolyte metabolism, renal tubular function and blood pressure', 'etude_experimentale_humaine', 2024, null),
  ('10.1016/j.jep.2022.115582', 'Combretum micranthum G. Don protects hypertension induced by L-NAME by cardiovascular and renal remodelling through reversing inflammation and oxidative stress', 'preclinique_animal', 2022, null)
) as v(doi, titre, type, annee, url) on true
where t.slug = 'kinkeliba' and i.nom = 'Hypertension'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Néré × Paludisme
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'nere' and i.nom = 'Paludisme';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Antiplasmodial activities of Parkia biglobosa leaves: In vivo and In vitro studies', 'preclinique_animal', 2011, null),
  ('10.3390/ijerph21040394', 'Contemporary Insights into the Biological Mechanisms of Parkia biglobosa', 'revue_narrative', 2024, 'https://doi.org/10.3390/ijerph21040394')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'nere' and i.nom = 'Paludisme'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Néré × Fièvre typhoïde
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'nere' and i.nom = 'Fièvre typhoïde';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.4314/ajtcam.v5i3.31279'::text, 'Comparative study of leaf and stem bark extracts of Parkia biglobosa against enterobacteria', 'preclinique_in_vitro', 2008, 'https://doi.org/10.4314/ajtcam.v5i3.31279')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'nere' and i.nom = 'Fièvre typhoïde'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Tamarin × Fièvre typhoïde — résultats contradictoires, signalés
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible',
  divergence_note = 'Deux études in vitro donnent des résultats opposés sur l''activité contre Salmonella typhi : aucune activité détectée en 2008, activité mesurée (CMI 2,56 mg/mL) en 2014 — protocoles/solvants différents. Les deux sont rapportées plutôt que de n''en garder qu''une.'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'tamarin' and i.nom = 'Fièvre typhoïde';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.3923/ajb.2008.134.138'::text, 'Phytochemical Screening and Antibacterial Activity of Tamarindus Indica Pulp Extract', 'preclinique_in_vitro', 2008, 'https://doi.org/10.3923/ajb.2008.134.138'),
  (null::text, 'Studies on the antimicrobial activity of Tamarind (Tamarindus indica) and its potential as food bio-preservative', 'preclinique_in_vitro', 2014, null)
) as v(doi, titre, type, annee, url) on true
where t.slug = 'tamarin' and i.nom = 'Fièvre typhoïde'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Baobab × Fièvre typhoïde
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'baobab' and i.nom = 'Fièvre typhoïde';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.1038/s41598-025-30536-x'::text, 'Reduce the risk of microbial activity and cytotoxicity by Adansonia digitata pulp extract grown under the semi arid conditions of Sudan', 'preclinique_in_vitro', 2025, 'https://pubmed.ncbi.nlm.nih.gov/41331504/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'baobab' and i.nom = 'Fièvre typhoïde'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Citronnelle × Insomnie — le seul essai humain est négatif, signalé
update claim c set est_pilote = true, qualite_preuve_scientifique = 'faible',
  divergence_note = 'Le seul essai contrôlé chez l''humain (1986, double aveugle, n=50) n''a montré aucune différence versus placebo sur le sommeil, malgré des effets sédatifs positifs mesurés chez la souris. L''évidence humaine, plus rare et plus fiable, ne confirme pas l''effet animal — à ne jamais présenter comme un effet prouvé.'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'citronnelle' and i.nom = 'Insomnie';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.1016/j.phymed.2007.04.007'::text, 'Neurobehavioral effect of essential oil of Cymbopogon citratus in mice', 'preclinique_animal', 2009, 'https://pubmed.ncbi.nlm.nih.gov/17561386/'),
  ('10.1016/j.jep.2011.07.003', 'The GABAergic system contributes to the anxiolytic-like effect of essential oil from Cymbopogon citratus (lemongrass)', 'preclinique_animal', 2011, 'https://doi.org/10.1016/j.jep.2011.07.003'),
  (null::text, 'Pharmacology of lemongrass (Cymbopogon citratus Stapf). III. Assessment of eventual toxic, hypnotic and anxiolytic effects on humans', 'essai_clinique_humain', 1986, 'https://pubmed.ncbi.nlm.nih.gov/2429120/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'citronnelle' and i.nom = 'Insomnie'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Citronnelle × Maux de tête
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from taxon t, indication i
where c.taxon_id = t.id and c.indication_id = i.id
  and t.slug = 'citronnelle' and i.nom = 'Maux de tête';

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Antinociceptive effect of the essential oil from Cymbopogon citratus in mice', 'preclinique_animal', 2000, 'https://pubmed.ncbi.nlm.nih.gov/10837994/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'citronnelle' and i.nom = 'Maux de tête'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- ============================================================
-- D. Nouvelle partie utilisée (racine, pour Fagara)
-- ============================================================
insert into partie (nom)
select 'écorce de racine'
where not exists (select 1 from partie where nom = 'écorce de racine');

-- ============================================================
-- E. Nouveaux claims — aucune attestation traditionnelle (non
--    vérifiée), uniquement des données scientifiques sur un extrait de
--    laboratoire. Le mode de préparation "autre" + description_libre
--    précisent qu'il ne s'agit PAS d'une pratique traditionnelle
--    documentée.
-- ============================================================

-- Neem × Acné
insert into preparation (partie_id, mode, description_libre, precautions_specifiques)
select p.id, 'autre', 'Extrait de laboratoire (hexanique/éthanolique) de feuilles, testé en conditions expérimentales — ce n''est pas une préparation traditionnelle documentée dans Lafi.', 'Usage externe étudié uniquement ; aucune préparation domestique validée pour cette indication.'
from partie p where p.nom = 'feuille'
and not exists (
  select 1 from preparation pr join claim c on c.preparation_id = pr.id join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'neem-margousier' and i.nom = 'Acné'
);

insert into claim (taxon_id, partie_id, preparation_id, indication_id, qualite_preuve_scientifique, est_pilote, contenu_pour_recherche)
select t.id, pr.partie_id, pr.id, i.id, 'tres_faible', true,
  'Acné : boutons, points noirs, inflammation cutanée du visage. Étude scientifique sur Neem (Azadirachta indica) — extrait de feuilles testé in vitro contre la bactérie Cutibacterium acnes. Aucun usage traditionnel documenté pour cette indication dans Lafi à ce jour.'
from taxon t, indication i,
  preparation pr join partie p on p.id = pr.partie_id
where t.slug = 'neem-margousier' and i.nom = 'Acné' and p.nom = 'feuille'
  and pr.description_libre like 'Extrait de laboratoire (hexanique/éthanolique) de feuilles%'
  and not exists (select 1 from claim c where c.taxon_id = t.id and c.indication_id = i.id);

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.5530/pj.2022.14.62'::text, 'Azadirachta indica Hexane Extract: Potent Antibacterial Activity Against Propionibacterium acne and Identification of its Chemicals Content', 'preclinique_in_vitro', 2022, 'https://doi.org/10.5530/pj.2022.14.62'),
  ('10.53699/joimedlabs.v7i1.284', 'Utilization of neem leaf extract (Azadirachta indica A. Juss.) in inhibiting the growth of acne-causing bacteria Cutibacterium acnes', 'preclinique_in_vitro', 2026, 'https://doi.org/10.53699/joimedlabs.v7i1.284')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'neem-margousier' and i.nom = 'Acné'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Moringa × Acné
insert into preparation (partie_id, mode, description_libre, precautions_specifiques)
select p.id, 'autre', 'Hydrogel de laboratoire à base de poudre de feuilles, testé en conditions expérimentales — ce n''est pas une préparation traditionnelle documentée dans Lafi.', 'Usage externe étudié uniquement ; aucune préparation domestique validée pour cette indication.'
from partie p where p.nom = 'feuille'
and not exists (
  select 1 from preparation pr join claim c on c.preparation_id = pr.id join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'moringa' and i.nom = 'Acné'
);

insert into claim (taxon_id, partie_id, preparation_id, indication_id, qualite_preuve_scientifique, est_pilote, contenu_pour_recherche)
select t.id, pr.partie_id, pr.id, i.id, 'tres_faible', true,
  'Acné : boutons, points noirs, inflammation cutanée du visage. Étude scientifique sur Moringa (Moringa oleifera) — hydrogel à base de poudre de feuilles testé in vitro contre Cutibacterium acnes. Aucun usage traditionnel documenté pour cette indication dans Lafi à ce jour.'
from taxon t, indication i,
  preparation pr join partie p on p.id = pr.partie_id
where t.slug = 'moringa' and i.nom = 'Acné' and p.nom = 'feuille'
  and pr.description_libre like 'Hydrogel de laboratoire%'
  and not exists (select 1 from claim c where c.taxon_id = t.id and c.indication_id = i.id);

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.30574/wjarr.2024.23.2.2566'::text, 'Development and assessment of an anti-acne hydrogel formulation containing Moringa oleifera leaf powder', 'preclinique_in_vitro', 2024, 'https://doi.org/10.30574/wjarr.2024.23.2.2566')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'moringa' and i.nom = 'Acné'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Fagara × Drépanocytose
insert into preparation (partie_id, mode, description_libre, precautions_specifiques)
select p.id, 'autre', 'Extrait de laboratoire d''écorce de racine, étudié en essai clinique préliminaire (1975) et in vitro (2009) — ce n''est pas une préparation traditionnelle documentée dans Lafi.', 'Toxicologie évaluée uniquement dans le cadre de l''essai clinique de 1975 (non répliqué depuis) ; aucune préparation domestique validée.'
from partie p where p.nom = 'écorce de racine'
and not exists (
  select 1 from preparation pr join claim c on c.preparation_id = pr.id join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'fagara' and i.nom = 'Drépanocytose'
);

insert into claim (taxon_id, partie_id, preparation_id, indication_id, qualite_preuve_scientifique, est_pilote, contenu_pour_recherche)
select t.id, pr.partie_id, pr.id, i.id, 'tres_faible', true,
  'Drépanocytose : crises douloureuses vaso-occlusives, anémie, fatigue. Étude scientifique sur Fagara (Zanthoxylum zanthoxyloides) — extrait d''écorce de racine, essai clinique préliminaire (1975) et activité anti-falcémiante in vitro (2009, composés isolés : les burkinabines). Aucun usage traditionnel documenté pour cette indication dans Lafi à ce jour.'
from taxon t, indication i,
  preparation pr join partie p on p.id = pr.partie_id
where t.slug = 'fagara' and i.nom = 'Drépanocytose' and p.nom = 'écorce de racine'
  and not exists (select 1 from claim c where c.taxon_id = t.id and c.indication_id = i.id);

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.1159/000208177'::text, 'Extract of Fagara zanthoxyloides Root in Sickle Cell Anaemia: Toxicology and Preliminary Clinical Trials', 'essai_clinique_humain', 1975, 'https://doi.org/10.1159/000208177'),
  ('10.1016/j.phymed.2008.10.013', 'Antisickling properties of divanilloylquinic acids isolated from Fagara zanthoxyloides Lam. (Rutaceae)', 'preclinique_in_vitro', 2009, 'https://pubmed.ncbi.nlm.nih.gov/19110407/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'fagara' and i.nom = 'Drépanocytose'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Vernonia × Ulcère gastrique
insert into preparation (partie_id, mode, description_libre, precautions_specifiques)
select p.id, 'autre', 'Extrait méthanolique de laboratoire, testé sur ulcère gastrique induit à l''aspirine chez le rat — ce n''est pas une préparation traditionnelle documentée dans Lafi.', null
from partie p where p.nom = 'feuille'
and not exists (
  select 1 from preparation pr join claim c on c.preparation_id = pr.id join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'vernonia-ndole' and i.nom = 'Ulcère gastrique'
);

insert into claim (taxon_id, partie_id, preparation_id, indication_id, qualite_preuve_scientifique, est_pilote, contenu_pour_recherche)
select t.id, pr.partie_id, pr.id, i.id, 'tres_faible', true,
  'Ulcère gastrique : douleurs épigastriques, brûlures d''estomac. Étude scientifique sur Vernonia (Vernonia amygdalina) — extrait méthanolique de feuilles, effet gastro-protecteur mesuré chez le rat. Aucun usage traditionnel documenté pour cette indication dans Lafi à ce jour.'
from taxon t, indication i,
  preparation pr join partie p on p.id = pr.partie_id
where t.slug = 'vernonia-ndole' and i.nom = 'Ulcère gastrique' and p.nom = 'feuille'
  and pr.description_libre like 'Extrait méthanolique de laboratoire%'
  and not exists (select 1 from claim c where c.taxon_id = t.id and c.indication_id = i.id);

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  ('10.1016/j.toxrep.2017.11.004'::text, 'Gastro-protective effect of methanol extract of Vernonia amygdalina (del.) leaf on aspirin-induced gastric ulcer in Wistar rats', 'preclinique_animal', 2017, 'https://pubmed.ncbi.nlm.nih.gov/29657922/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'vernonia-ndole' and i.nom = 'Ulcère gastrique'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- Caïlcédrat × Ulcère gastrique
insert into preparation (partie_id, mode, description_libre, precautions_specifiques)
select p.id, 'autre', 'Extrait éthanolique de laboratoire d''écorce de tige, testé sur toxicité gastrique induite au piroxicam chez le rat — ce n''est pas une préparation traditionnelle documentée dans Lafi.', null
from partie p where p.nom = 'écorce'
and not exists (
  select 1 from preparation pr join claim c on c.preparation_id = pr.id join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'cailcedrat' and i.nom = 'Ulcère gastrique'
);

insert into claim (taxon_id, partie_id, preparation_id, indication_id, qualite_preuve_scientifique, est_pilote, contenu_pour_recherche)
select t.id, pr.partie_id, pr.id, i.id, 'tres_faible', true,
  'Ulcère gastrique : douleurs épigastriques, brûlures d''estomac. Étude scientifique sur Caïlcédrat (Khaya senegalensis) — extrait éthanolique d''écorce de tige, effet protecteur mesuré contre la toxicité gastrique induite par un anti-inflammatoire chez le rat. Aucun usage traditionnel documenté pour cette indication dans Lafi à ce jour.'
from taxon t, indication i,
  preparation pr join partie p on p.id = pr.partie_id
where t.slug = 'cailcedrat' and i.nom = 'Ulcère gastrique' and p.nom = 'écorce'
  and pr.description_libre like 'Extrait éthanolique de laboratoire%'
  and not exists (select 1 from claim c where c.taxon_id = t.id and c.indication_id = i.id);

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Khaya senegalensis inhibits piroxicam mediated gastro-toxicity in wistar rats', 'preclinique_animal', 2014, 'https://pubmed.ncbi.nlm.nih.gov/25386401/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'cailcedrat' and i.nom = 'Ulcère gastrique'
  and not exists (select 1 from etude e where e.claim_id = c.id and e.titre = v.titre);

-- ============================================================
-- Vérification attendue après exécution :
--   select t.slug, i.nom, c.est_pilote, c.qualite_preuve_scientifique
--   from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
--   where i.nom in ('Acné', 'Ulcère gastrique', 'Drépanocytose')
--      or (t.slug in ('aloe-vera','nere','tamarin','baobab','kinkeliba','citronnelle') and c.est_pilote = true);
--   -> 13 lignes, toutes est_pilote = true.
--
-- N'oublie pas de relancer `npm run embeddings` (web/scripts/generate-
-- embeddings.ts) après exécution : les 5 nouveaux claims ont un
-- embedding NULL tant que le script n'a pas tourné, donc le chat ne les
-- trouvera pas encore par recherche sémantique.
-- ============================================================
