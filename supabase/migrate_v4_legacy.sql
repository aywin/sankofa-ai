-- ============================================================
-- LAFI — v4 : migration du corpus existant (15 plantes, 8 maladies,
-- 24 usages, seed.sql) vers le modèle claim/attestation.
-- À exécuter APRÈS schema_v4.sql, dans le même SQL Editor Supabase.
--
-- Choix assumé : tous les usages existants deviennent des Claim réels
-- (aucune perte de couverture pour le chat), mais rattachés à UNE SEULE
-- lignée générique explicitement taguée "démo" — on ne fabrique jamais
-- une lignée/tradition distincte qu'on n'a pas réellement documentée sur
-- le terrain. `est_pilote` reste `false` pour ces 24 claims ; 8 d'entre
-- eux seront enrichis (vraie taxonomie, vraies études, `est_pilote=true`)
-- par seed_v4_pilotes.sql juste après.
--
-- Les tables legacy (plantes/maladies/usages/sources) ne sont PAS
-- modifiées ni supprimées par ce script.
-- ============================================================

-- 1. Lignée démo unique + contributeur générique pour tout le corpus migré.
insert into lignee (nom, description, est_demo)
select
  'Corpus documentaire initial (non tracé)',
  'Données migrées depuis le corpus v1-v3 (supabase/seed.sql), avant la mise en place du modèle Lignée. Ne représente pas une vraie tradition d''apprentissage documentée sur le terrain — à ne jamais afficher comme une attestation validée.',
  true
where not exists (select 1 from lignee where nom = 'Corpus documentaire initial (non tracé)');

insert into contributeur (statut, lignee_id, preference_attribution)
select 'corpus_initial', l.id, 'anonyme'
from lignee l
where l.nom = 'Corpus documentaire initial (non tracé)'
  and not exists (select 1 from contributeur where statut = 'corpus_initial');

-- 2. Parties de plante utilisées par le corpus existant (liste fermée,
--    suffisante pour les 24 usages ; d'autres parties pourront être
--    ajoutées librement plus tard, "partie.nom" n'est pas un enum figé).
insert into partie (nom) values
  ('feuille'), ('écorce'), ('fruit'), ('graine'), ('calice'), ('racine'), ('fleur'), ('plante entière')
on conflict (nom) do nothing;

-- 3. Indications (remplace maladies).
insert into indication (nom, symptomes, description)
select nom, symptomes, description from maladies
where not exists (select 1 from indication i where i.nom = maladies.nom);

-- 4. Taxons (remplace plantes) — slugs calculés depuis web/lib/slug.ts
--    (algorithme vérifié : normalisation NFD + minuscule + tirets).
with slugs (nom_local, slug) as (
  values
    ('Moringa', 'moringa'),
    ('Neem (Margousier)', 'neem-margousier'),
    ('Tamarin', 'tamarin'),
    ('Kinkeliba', 'kinkeliba'),
    ('Baobab', 'baobab'),
    ('Karité', 'karite'),
    ('Papayer', 'papayer'),
    ('Goyavier', 'goyavier'),
    ('Citronnelle', 'citronnelle'),
    ('Aloe vera', 'aloe-vera'),
    ('Bissap (Oseille de Guinée)', 'bissap-oseille-de-guinee'),
    ('Néré', 'nere'),
    ('Caïlcédrat', 'cailcedrat'),
    ('Citron', 'citron'),
    ('Vernonia (Ndolé)', 'vernonia-ndole')
)
insert into taxon (slug, nom_scientifique, description, precautions, photo_url)
select s.slug, pl.nom_scientifique, pl.description, pl.precautions, pl.photo_url
from plantes pl
join slugs s on s.nom_local = pl.nom_local
where not exists (select 1 from taxon t where t.slug = s.slug);

-- 5. Noms vernaculaires — un seul nom principal par taxon pour l'instant
--    (le corpus actuel n'a jamais capturé de vrais noms multi-langues ;
--    "non précisé" est honnête, pas une valeur inventée).
with slugs (nom_local, slug) as (
  values
    ('Moringa', 'moringa'),
    ('Neem (Margousier)', 'neem-margousier'),
    ('Tamarin', 'tamarin'),
    ('Kinkeliba', 'kinkeliba'),
    ('Baobab', 'baobab'),
    ('Karité', 'karite'),
    ('Papayer', 'papayer'),
    ('Goyavier', 'goyavier'),
    ('Citronnelle', 'citronnelle'),
    ('Aloe vera', 'aloe-vera'),
    ('Bissap (Oseille de Guinée)', 'bissap-oseille-de-guinee'),
    ('Néré', 'nere'),
    ('Caïlcédrat', 'cailcedrat'),
    ('Citron', 'citron'),
    ('Vernonia (Ndolé)', 'vernonia-ndole')
)
insert into nom_vernaculaire (taxon_id, libelle, langue, est_principal)
select t.id, s.nom_local, 'non précisé', true
from slugs s
join taxon t on t.slug = s.slug
where not exists (
  select 1 from nom_vernaculaire nv where nv.taxon_id = t.id and nv.libelle = s.nom_local
);

-- 6. Table temporaire : (plante, maladie) -> (partie utilisée, mode de
--    préparation), pour reconstruire une Préparation structurée par
--    usage sans rien inventer — dérivée du texte déjà présent dans
--    supabase/seed.sql.
create temporary table _legacy_map (
  plante_nom text,
  maladie_nom text,
  partie_nom text,
  mode text
) on commit drop;

insert into _legacy_map (plante_nom, maladie_nom, partie_nom, mode) values
  ('Neem (Margousier)',          'Paludisme',                        'feuille', 'decoction'),
  ('Papayer',                    'Paludisme',                        'feuille', 'decoction'),
  ('Caïlcédrat',                 'Paludisme',                        'écorce',  'decoction'),
  ('Néré',                       'Paludisme',                        'écorce',  'decoction'),
  ('Tamarin',                    'Fièvre typhoïde',                  'fruit',   'decoction'),
  ('Baobab',                     'Fièvre typhoïde',                  'fruit',   'infusion'),
  ('Néré',                       'Fièvre typhoïde',                  'écorce',  'decoction'),
  ('Goyavier',                   'Diarrhée',                         'feuille', 'decoction'),
  ('Kinkeliba',                  'Diarrhée',                         'feuille', 'infusion'),
  ('Tamarin',                    'Diarrhée',                         'fruit',   'autre'),
  ('Vernonia (Ndolé)',           'Diarrhée',                         'feuille', 'decoction'),
  ('Citron',                     'Toux et affections respiratoires', 'fruit',   'autre'),
  ('Citronnelle',                'Toux et affections respiratoires', 'feuille', 'infusion'),
  ('Moringa',                    'Toux et affections respiratoires', 'feuille', 'infusion'),
  ('Citronnelle',                'Maux de tête',                     'feuille', 'infusion'),
  ('Moringa',                    'Maux de tête',                     'feuille', 'infusion'),
  ('Bissap (Oseille de Guinée)', 'Hypertension',                     'calice',  'infusion'),
  ('Moringa',                    'Hypertension',                     'feuille', 'poudre'),
  ('Kinkeliba',                  'Hypertension',                     'feuille', 'infusion'),
  ('Karité',                     'Plaies et infections cutanées',    'graine',  'application_directe'),
  ('Aloe vera',                  'Plaies et infections cutanées',    'feuille', 'application_directe'),
  ('Neem (Margousier)',          'Plaies et infections cutanées',    'feuille', 'decoction'),
  ('Citronnelle',                'Insomnie',                         'feuille', 'infusion'),
  ('Bissap (Oseille de Guinée)', 'Insomnie',                         'calice',  'infusion');

-- 7. Une Préparation par texte distinct — u.preparation N'EST PAS
--    unique sur les 24 lignes de seed.sql (Néré réutilise mot pour mot
--    "Décoction de l'écorce de néré." pour ses deux usages). Le SELECT
--    DISTINCT est nécessaire : un simple NOT EXISTS ne protège pas
--    contre deux lignes sources identiques traitées dans le même
--    INSERT...SELECT (Postgres évalue NOT EXISTS sur l'état de la table
--    au début de la requête, pas au fil des lignes insérées par cette
--    même requête — sans DISTINCT, les deux lignes Néré passent toutes
--    les deux le filtre et créent un doublon). Le texte sert ensuite de
--    clé de rapprochement au step 8, donc son unicité ici est
--    structurante, pas cosmétique.
insert into preparation (partie_id, mode, description_libre)
select distinct part.id, lm.mode, u.preparation
from usages u
join plantes pl on pl.id = u.plante_id
join maladies ma on ma.id = u.maladie_id
join _legacy_map lm on lm.plante_nom = pl.nom_local and lm.maladie_nom = ma.nom
join partie part on part.nom = lm.partie_nom
where not exists (select 1 from preparation p where p.description_libre = u.preparation);

-- 8. Un Claim par usage.
insert into claim (taxon_id, partie_id, preparation_id, indication_id, est_pilote, contenu_pour_recherche)
select
  t.id,
  prep.partie_id,
  prep.id,
  ind.id,
  false,
  u.contenu_pour_recherche
from usages u
join plantes pl on pl.id = u.plante_id
join maladies ma on ma.id = u.maladie_id
join nom_vernaculaire nv on nv.libelle = pl.nom_local
join taxon t on t.id = nv.taxon_id
join indication ind on ind.nom = ma.nom
join preparation prep on prep.description_libre = u.preparation
where not exists (
  select 1 from claim c
  where c.taxon_id = t.id and c.partie_id = prep.partie_id
    and c.preparation_id = prep.id and c.indication_id = ind.id
);

-- 9. Une attestation par claim, rattachée à la lignée démo unique —
--    niveau "documenté" (le corpus est déjà public), consentement=true
--    (donnée déjà publiée, pas une collecte de terrain à consentir).
insert into attestation (claim_id, contributeur_id, lignee_id, niveau_divulgation, consentement)
select
  c.id,
  (select id from contributeur where statut = 'corpus_initial' limit 1),
  (select id from lignee where nom = 'Corpus documentaire initial (non tracé)' limit 1),
  'documente',
  true
from claim c
where c.est_pilote = false
  and not exists (select 1 from attestation a where a.claim_id = c.id);

-- Vérification attendue après exécution :
--   select count(*) from claim;        -> 24
--   select count(*) from attestation;  -> 24 (une par claim)
--   select count(*) from taxon;        -> 15
--   select count(*) from indication;   -> 8
