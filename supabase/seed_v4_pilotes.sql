-- ============================================================
-- LAFI — v4 : enrichissement des 8 couples pilotes avec de vraies
-- données (taxonomie, préparations structurées, études scientifiques
-- réelles trouvées par recherche documentaire — DOIs vérifiés).
-- À exécuter APRÈS schema_v4.sql et migrate_v4_legacy.sql.
--
-- Ce que ce fichier NE fait PAS, volontairement :
--   - aucun voucher_reference/herbier n'est renseigné : aucun spécimen
--     n'a réellement été déposé, donc le champ reste NULL (affiché comme
--     "non déposé — donnée non publiable en l'état" côté UI) plutôt que
--     simulé ;
--   - aucune nouvelle lignée n'est inventée pour gonfler artificiellement
--     l'indépendance des attestations. Les régions réutilisées ici sont
--     exactement celles déjà présentes dans supabase/seed_v3.sql
--     (illustratives, jamais une vraie collecte de terrain) ;
--   - qualite_preuve_scientifique est un jugement GRADE assigné à la
--     main par couple (voir tableau ci-dessous), jamais calculé par une
--     formule — GRADE demande une évaluation du risque de biais, pas un
--     comptage.
--
-- Couple          | Qualité GRADE | Justification
-- Bissap×HTA      | moderee       | essais cliniques humains + revue systématique
-- Karité×Plaies   | moderee       | revue + étude expérimentale humaine (brûlures)
-- Goyavier×Diarr. | faible        | préclinique + revue de synthèse, pas d'essai humain
-- Moringa×HTA     | faible        | étude humaine préliminaire, revue notant l'absence d'essais robustes
-- Neem×Paludisme  | tres_faible   | in vitro / animal uniquement
-- Caïlcédrat×Palu | tres_faible   | préclinique, chimie fine, pas d'essai in vivo humain
-- Papayer×Palu    | tres_faible   | préclinique uniquement
-- Vernonia×Diarr. | tres_faible   | préclinique uniquement
-- ============================================================

-- 1. Lignées "démo par région" — réutilisent les étiquettes déjà
--    présentes dans seed_v3.sql (illustratives), jamais une vraie
--    collecte de terrain. Une lignée par région, réutilisable entre
--    couples (une même tradition orale régionale peut concerner
--    plusieurs plantes).
insert into lignee (nom, description, est_demo)
select v.nom, v.description, true
from (values
  ('Tradition orale — région du Sahel (démonstration, terrain non réalisé)', 'Étiquette régionale reprise de supabase/seed_v3.sql à titre illustratif. Ne remplace pas une vraie collecte de terrain avec consentement documenté.'),
  ('Tradition orale — région des Hauts-Bassins (démonstration, terrain non réalisé)', 'Étiquette régionale reprise de supabase/seed_v3.sql à titre illustratif. Ne remplace pas une vraie collecte de terrain avec consentement documenté.'),
  ('Tradition orale — région du Centre (démonstration, terrain non réalisé)', 'Étiquette régionale reprise de supabase/seed_v3.sql à titre illustratif. Ne remplace pas une vraie collecte de terrain avec consentement documenté.'),
  ('Tradition orale — région du Sud-Ouest (démonstration, terrain non réalisé)', 'Étiquette régionale reprise de supabase/seed_v3.sql à titre illustratif. Ne remplace pas une vraie collecte de terrain avec consentement documenté.'),
  ('Tradition orale — région du Centre-Est (démonstration, terrain non réalisé)', 'Étiquette régionale reprise de supabase/seed_v3.sql à titre illustratif. Ne remplace pas une vraie collecte de terrain avec consentement documenté.')
) as v(nom, description)
where not exists (select 1 from lignee l where l.nom = v.nom);

-- 1bis. Retire l'attestation générique "corpus documentaire initial" sur
--       les 8 claims pilotes : une fois enrichis, ils reçoivent soit une
--       vraie attestation régionale (précise mais toujours démo), soit
--       aucune si le corpus n'en a jamais eu (Caïlcédrat, Moringa,
--       Vernonia) — mélanger les deux régimes sur un même claim brouille
--       la lecture du niveau réel de corroboration.
delete from attestation a
using claim c, taxon t, indication i,
  (values
    ('neem-margousier', 'Paludisme'),
    ('bissap-oseille-de-guinee', 'Hypertension'),
    ('goyavier', 'Diarrhée'),
    ('cailcedrat', 'Paludisme'),
    ('moringa', 'Hypertension'),
    ('papayer', 'Paludisme'),
    ('vernonia-ndole', 'Diarrhée'),
    ('karite', 'Plaies et infections cutanées')
  ) as pilotes(slug, indication_nom)
where a.claim_id = c.id
  and c.taxon_id = t.id
  and c.indication_id = i.id
  and t.slug = pilotes.slug
  and i.nom = pilotes.indication_nom;

-- ============================================================
-- 2. Neem (Margousier) × Paludisme
-- ============================================================
update taxon set autorite = 'A.Juss.', famille = 'Meliaceae' where slug = 'neem-margousier';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'neem-margousier' and i.nom = 'Paludisme'
)
update preparation p set solvant = 'eau', duree = '15 minutes', temperature = 'ébullition'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'neem-margousier' and i.nom = 'Paludisme'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Inhibition of the growth and development of asexual and sexual stages of drug-sensitive and resistant strains of the human malaria parasite Plasmodium falciparum by Neem (Azadirachta indica) fractions', 'preclinique_in_vitro', 1998, 'https://pubmed.ncbi.nlm.nih.gov/9687079/'),
  (null::text, 'Transmission blocking activity of Azadirachta indica and Guiera senegalensis extracts on the sporogonic development of Plasmodium falciparum field isolates in Anopheles coluzzii mosquitoes', 'preclinique_animal', 2014, 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3996177/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'neem-margousier' and i.nom = 'Paludisme';

insert into attestation (claim_id, lignee_id, region, niveau_divulgation, consentement)
select c.id, l.id, v.region, 'documente', true
from claim c
join taxon t on t.id = c.taxon_id
join indication i on i.id = c.indication_id
join (values
  ('Tradition orale — région du Sahel (démonstration, terrain non réalisé)', 'Sahel'),
  ('Tradition orale — région des Hauts-Bassins (démonstration, terrain non réalisé)', 'Hauts-Bassins')
) as v(lignee_nom, region) on true
join lignee l on l.nom = v.lignee_nom
where t.slug = 'neem-margousier' and i.nom = 'Paludisme';

-- ============================================================
-- 3. Bissap (Oseille de Guinée) × Hypertension
-- ============================================================
update taxon set autorite = 'L.', famille = 'Malvaceae' where slug = 'bissap-oseille-de-guinee';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'bissap-oseille-de-guinee' and i.nom = 'Hypertension'
)
update preparation p set solvant = 'eau chaude'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'bissap-oseille-de-guinee' and i.nom = 'Hypertension'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'moderee'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Effect of Hibiscus sabdariffa on blood pressure in patients with stage 1 hypertension', 'essai_clinique_humain', 2019, 'https://pubmed.ncbi.nlm.nih.gov/31334091/'),
  (null::text, 'A Randomized, Double-Blind, Placebo-Controlled Trial to Determine the Effectiveness of a Polyphenolic Extract (Hibiscus sabdariffa and Lippia citriodora) for Reducing Blood Pressure', 'essai_clinique_humain', 2021, 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8005037/'),
  (null::text, 'The effectiveness of Hibiscus sabdariffa in the treatment of hypertension: a systematic review', 'revue_systematique', null, 'https://www.ncbi.nlm.nih.gov/books/NBK79564/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'bissap-oseille-de-guinee' and i.nom = 'Hypertension';

insert into attestation (claim_id, lignee_id, region, niveau_divulgation, consentement)
select c.id, l.id, 'Sahel', 'documente', true
from claim c
join taxon t on t.id = c.taxon_id
join indication i on i.id = c.indication_id
join lignee l on l.nom = 'Tradition orale — région du Sahel (démonstration, terrain non réalisé)'
where t.slug = 'bissap-oseille-de-guinee' and i.nom = 'Hypertension';

-- ============================================================
-- 4. Goyavier × Diarrhée
-- ============================================================
update taxon set autorite = 'L.', famille = 'Myrtaceae' where slug = 'goyavier';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'goyavier' and i.nom = 'Diarrhée'
)
update preparation p set solvant = 'eau'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'goyavier' and i.nom = 'Diarrhée'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Antidiarrhoeal activity of Psidium guajava Linn. (Myrtaceae) leaf aqueous extract in rodents', 'preclinique_animal', 2009, 'https://pubmed.ncbi.nlm.nih.gov/19234374/'),
  (null::text, 'Ethnobotany, phytochemistry, and biological activities of Psidium guajava in the treatment of diarrhea: a review', 'revue_narrative', 2024, 'https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2024.1459066/full')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'goyavier' and i.nom = 'Diarrhée';

insert into attestation (claim_id, lignee_id, region, niveau_divulgation, consentement)
select c.id, l.id, v.region, 'documente', true
from claim c
join taxon t on t.id = c.taxon_id
join indication i on i.id = c.indication_id
join (values
  ('Tradition orale — région du Sud-Ouest (démonstration, terrain non réalisé)', 'Sud-Ouest'),
  ('Tradition orale — région du Centre-Est (démonstration, terrain non réalisé)', 'Centre-Est')
) as v(lignee_nom, region) on true
join lignee l on l.nom = v.lignee_nom
where t.slug = 'goyavier' and i.nom = 'Diarrhée';

-- ============================================================
-- 5. Caïlcédrat × Paludisme (aucune attestation traditionnelle en base
--    aujourd'hui : seed_v3.sql n'en avait pas seedé pour ce couple)
-- ============================================================
update taxon set autorite = '(Desr.) A.Juss.', famille = 'Meliaceae' where slug = 'cailcedrat';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'cailcedrat' and i.nom = 'Paludisme'
)
update preparation p set solvant = 'eau'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'cailcedrat' and i.nom = 'Paludisme'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, '10.3390/molecules28207227', 'Antiplasmodial and Antileishmanial Activities of a New Limonoid and Other Constituents from the Stem Bark of Khaya senegalensis', 'preclinique_in_vitro', 2023, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10609173/'
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
where t.slug = 'cailcedrat' and i.nom = 'Paludisme';

-- Composé/cible mentionnés explicitement dans l'étude ci-dessus.
insert into compose (taxon_id, nom, methode_identification)
select t.id, 'Limonoïde (21β-hydroxybourjotinolone A)', 'Isolement et élucidation structurale (RMN/MS), écorce de tige'
from taxon t where t.slug = 'cailcedrat'
and not exists (select 1 from compose where taxon_id = t.id and nom = 'Limonoïde (21β-hydroxybourjotinolone A)');

insert into cible (compose_id, proteine, affinite, source)
select co.id, 'Plasmodium falciparum (souche chloroquino-résistante PfDd2)', 'IC50 = 2.5 ± 0.12 µg/mL', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10609173/'
from compose co join taxon t on t.id = co.taxon_id
where t.slug = 'cailcedrat' and co.nom = 'Limonoïde (21β-hydroxybourjotinolone A)';

-- ============================================================
-- 6. Moringa × Hypertension (aucune attestation traditionnelle en base)
-- ============================================================
update taxon set autorite = 'Lam.', famille = 'Moringaceae' where slug = 'moringa';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'moringa' and i.nom = 'Hypertension'
)
update preparation p set solvant = 'eau'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'moringa' and i.nom = 'Hypertension'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Consumption of Moringa oleifera Lam Leaves Lowers Postprandial Blood Pressure', 'etude_experimentale_humaine', 2019, 'https://pubmed.ncbi.nlm.nih.gov/31063434/'),
  (null::text, 'Moringa oleifera and Blood Pressure: Evidence and Potential Mechanisms', 'revue_narrative', null, 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11990149/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'moringa' and i.nom = 'Hypertension';

-- ============================================================
-- 7. Papayer × Paludisme
-- ============================================================
update taxon set autorite = 'L.', famille = 'Caricaceae' where slug = 'papayer';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'papayer' and i.nom = 'Paludisme'
)
update preparation p set solvant = 'eau'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'papayer' and i.nom = 'Paludisme'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'Antimalarial activity of Carica papaya (Family: Caricaceae) leaf extract against Plasmodium falciparum', 'preclinique_in_vitro', 2012, 'https://www.sciencedirect.com/science/article/abs/pii/S2222180812601716'),
  ('10.9734/arrb/2020/v35i1230323', 'GC–MS Analysis and Antimalarial Activity of Methanolic Leaf Extract of Carica papaya against Plasmodium berghei NK65 Infection in Swiss Mice', 'preclinique_animal', 2020, null)
) as v(doi, titre, type, annee, url) on true
where t.slug = 'papayer' and i.nom = 'Paludisme';

insert into attestation (claim_id, lignee_id, region, niveau_divulgation, consentement)
select c.id, l.id, 'Centre', 'documente', true
from claim c
join taxon t on t.id = c.taxon_id
join indication i on i.id = c.indication_id
join lignee l on l.nom = 'Tradition orale — région du Centre (démonstration, terrain non réalisé)'
where t.slug = 'papayer' and i.nom = 'Paludisme';

-- ============================================================
-- 8. Vernonia (Ndolé) × Diarrhée (aucune attestation traditionnelle en base)
-- ============================================================
update taxon set autorite = 'Delile', famille = 'Asteraceae' where slug = 'vernonia-ndole';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'vernonia-ndole' and i.nom = 'Diarrhée'
)
update preparation p set solvant = 'eau'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'vernonia-ndole' and i.nom = 'Diarrhée'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'tres_faible'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, '10.2147/JEP.S282669', 'Evaluation of Anti-Diarrheal Activity of 80% Methanol Extracts of Vernonia amygdalina Delile (Asteraceae) Leaves in Mice', 'preclinique_animal', 2020, 'https://www.tandfonline.com/doi/full/10.2147/JEP.S282669'
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
where t.slug = 'vernonia-ndole' and i.nom = 'Diarrhée';

-- ============================================================
-- 9. Karité × Plaies et infections cutanées
-- ============================================================
update taxon set autorite = 'C.F.Gaertn.', famille = 'Sapotaceae' where slug = 'karite';

with cible_claim as (
  select c.id as claim_id, c.preparation_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'karite' and i.nom = 'Plaies et infections cutanées'
)
update preparation p set precautions_specifiques = 'Usage externe uniquement.'
from cible_claim where p.id = cible_claim.preparation_id;

with cible_claim as (
  select c.id as claim_id
  from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
  where t.slug = 'karite' and i.nom = 'Plaies et infections cutanées'
)
update claim c set est_pilote = true, qualite_preuve_scientifique = 'moderee'
from cible_claim where c.id = cible_claim.claim_id;

insert into etude (claim_id, doi, titre, type, annee, url)
select c.id, v.doi, v.titre, v.type, v.annee, v.url
from claim c join taxon t on t.id = c.taxon_id join indication i on i.id = c.indication_id
join (values
  (null::text, 'A review of ethnomedicinal uses of shea butter for dermatoses in Sub-Saharan Africa', 'revue_narrative', 2021, 'https://pubmed.ncbi.nlm.nih.gov/33480103/'),
  (null::text, 'Experimental study comparing burn healing effects of raw South African Shea butter and the samples from a Libyan market', 'etude_experimentale_humaine', 2021, 'https://pubmed.ncbi.nlm.nih.gov/33614438/')
) as v(doi, titre, type, annee, url) on true
where t.slug = 'karite' and i.nom = 'Plaies et infections cutanées';

insert into attestation (claim_id, lignee_id, region, niveau_divulgation, consentement)
select c.id, l.id, 'Hauts-Bassins', 'documente', true
from claim c
join taxon t on t.id = c.taxon_id
join indication i on i.id = c.indication_id
join lignee l on l.nom = 'Tradition orale — région des Hauts-Bassins (démonstration, terrain non réalisé)'
where t.slug = 'karite' and i.nom = 'Plaies et infections cutanées';

-- Vérification attendue après exécution :
--   select count(*) from claim where est_pilote = true;  -> 8
--   select count(*) from etude;                          -> 15
--   select count(*) from compose;                        -> 1 (Caïlcédrat)
--   select count(*) from attestation where claim_id in
--     (select id from claim where est_pilote = true);    -> 5
--     (Neem: 2, Bissap: 1, Goyavier: 2 ; Caïlcédrat/Moringa/Vernonia: 0)
--   select count(*) from claim;                          -> toujours 24 (rien supprimé)
