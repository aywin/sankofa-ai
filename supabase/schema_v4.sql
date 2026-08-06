-- ============================================================
-- LAFI — v4 : modèle de données "claim/attestation" (voir LafiIabrief.md).
-- À exécuter dans Supabase : Project > SQL Editor > New query,
-- APRÈS schema.sql + seed.sql + schema_v3.sql + seed_v3.sql +
-- schema_users.sql (déjà en place).
--
-- Ordre d'exécution pour la migration v4 complète :
--   1. schema_v4.sql              (ce fichier — DDL)
--   2. migrate_v4_legacy.sql      (migre les 24 usages existants, marqués démo)
--   3. seed_v4_pilotes.sql        (enrichit 8 couples avec de vraies données)
--   4. npm run embeddings         (régénère claim.embedding, désormais vide)
--
-- Ce fichier ne supprime AUCUNE table existante (plantes/maladies/usages/
-- sources) : elles restent en base comme trace d'audit, simplement plus
-- interrogées par le code applicatif après cette migration. match_usages
-- n'est pas non plus supprimée. Pas de système de migration/rollback dans
-- ce repo (exécution manuelle via SQL Editor) — la prudence est le seul
-- filet de sécurité.
--
-- RLS : activé sur toutes les tables ci-dessous, SANS policy — accès
-- service role uniquement, exactement le pattern déjà en place pour
-- plantes/maladies/usages/sources.
-- ============================================================

-- 1. Lignée — tradition d'apprentissage. C'est elle qui porte le calcul
--    d'indépendance des attestations (nœud ② du futur laboratoire) : dix
--    personnes formées par le même maître sont une source répétée dix
--    fois, pas dix sources indépendantes.
create table if not exists lignee (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  -- true = lignée générique/placeholder (corpus migré ou attestation de
  -- démonstration), jamais une vraie tradition documentée sur le terrain.
  -- Sert à taguer l'UI pour ne jamais laisser croire qu'une donnée démo
  -- est validée.
  est_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Contributeur
create table if not exists contributeur (
  id uuid primary key default gen_random_uuid(),
  nom_affichage text, -- null = anonyme
  statut text not null check (statut in ('tradipraticien', 'chercheur', 'particulier', 'institution', 'corpus_initial')),
  lignee_id uuid references lignee(id), -- lignée d'apprentissage principale, nullable (un chercheur n'en a pas forcément)
  preference_attribution text not null default 'anonyme' check (preference_attribution in ('nommement', 'anonyme')),
  contact text,
  created_at timestamptz not null default now()
);

-- 3. Partie de plante utilisée
create table if not exists partie (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique, -- feuille, écorce, racine, fruit, graine, fleur, calice, gel, plante entière...
  description text
);

-- 4. Préparation — mode, solvant, durée, température. L'écart entre savoir
--    traditionnel et pharmacologie n'est pas "quelle plante" mais "quelle
--    préparation délivre quelle dose" : une décoction et une infusion de
--    la même plante n'extraient pas les mêmes composés aux mêmes
--    concentrations.
create table if not exists preparation (
  id uuid primary key default gen_random_uuid(),
  partie_id uuid not null references partie(id),
  mode text not null check (mode in ('decoction', 'infusion', 'maceration', 'poudre', 'cataplasme', 'application_directe', 'autre')),
  solvant text,
  duree text,
  temperature text,
  description_libre text, -- texte brut préservé (utile pour les préparations migrées, non finement structurées)
  precautions_specifiques text, -- ex. "usage externe uniquement"
  created_at timestamptz not null default now()
);
create index if not exists preparation_partie_idx on preparation(partie_id);

-- 5. Indication (remplace "maladies")
create table if not exists indication (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  categorie text, -- organe/système — prépare les filtres de la future page découverte
  symptomes text,
  description text,
  code_nomenclature text, -- réservé, non rempli en v4
  created_at timestamptz not null default now()
);

-- 6. Taxon (remplace "plantes")
create table if not exists taxon (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom_scientifique text not null,
  autorite text, -- ex. "L.", "A.Juss."
  famille text,
  voucher_reference text, -- référence du spécimen déposé en herbier
  herbier text, -- institution dépositaire
  description text,
  precautions text, -- toujours affichée sans clic sur la fiche
  habitat_region text, -- champ descriptif NON transactionnel (habitat/région/disponibilité) — jamais d'annuaire, jamais de CTA
  photo_url text,
  created_at timestamptz not null default now()
);
create index if not exists taxon_slug_idx on taxon(slug);

-- 7. Médias de la galerie (une ligne par vue étiquetée)
create table if not exists taxon_media (
  id uuid primary key default gen_random_uuid(),
  taxon_id uuid not null references taxon(id) on delete cascade,
  partie_id uuid references partie(id), -- nullable : "plante entière" n'a pas de partie
  url text not null,
  label text not null,
  created_at timestamptz not null default now()
);
create index if not exists taxon_media_taxon_idx on taxon_media(taxon_id);

-- 8. Noms vernaculaires (un taxon a plusieurs noms, un par langue/région)
create table if not exists nom_vernaculaire (
  id uuid primary key default gen_random_uuid(),
  taxon_id uuid not null references taxon(id) on delete cascade,
  libelle text not null,
  langue text not null,
  region text,
  est_principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (taxon_id, libelle, langue)
);
create index if not exists nom_vernaculaire_taxon_idx on nom_vernaculaire(taxon_id);

-- 9. Claim — l'unité atomique : (Taxon, Partie, Préparation, Indication).
--    On ne stocke pas des fiches de plantes, on stocke des affirmations
--    vérifiables.
create table if not exists claim (
  id uuid primary key default gen_random_uuid(),
  taxon_id uuid not null references taxon(id),
  partie_id uuid not null references partie(id),
  preparation_id uuid not null references preparation(id),
  indication_id uuid not null references indication(id),
  -- GRADE : élevée / modérée / faible / très faible. NULL = non évaluée
  -- (aucune étude liée) — jamais de 5e valeur sentinelle.
  qualite_preuve_scientifique text check (qualite_preuve_scientifique in ('elevee', 'moderee', 'faible', 'tres_faible')),
  -- La sortie sécurité prime toujours sur le reste de l'affichage.
  contre_indication_forte boolean not null default false,
  divergence_note text, -- renseigné par un curateur si sources/traditions se contredisent -> statut "Divergent"
  -- true uniquement pour les couples pilotes construits avec de vraies
  -- données (taxonomie, préparation, études) ; false = migré depuis le
  -- corpus v1-v3, à afficher avec un tag démonstration explicite.
  est_pilote boolean not null default false,
  contenu_pour_recherche text not null, -- texte source pour l'embedding
  embedding vector(768),
  created_at timestamptz not null default now(),
  unique (taxon_id, partie_id, preparation_id, indication_id)
);
create index if not exists claim_taxon_idx on claim(taxon_id);
create index if not exists claim_indication_idx on claim(indication_id);

-- 10. Attestation — un témoignage recueilli, jamais un document. Rattaché
--     à une Lignée obligatoirement : sans elle, le calcul d'indépendance
--     ne vaut rien (règle non négociable, §10 du brief).
create table if not exists attestation (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claim(id) on delete cascade,
  contributeur_id uuid references contributeur(id), -- nullable : anonyme accepté
  lignee_id uuid not null references lignee(id),
  region text,
  langue text,
  date_collecte date,
  methode_collecte text,
  consentement boolean not null default false,
  niveau_divulgation text not null check (niveau_divulgation in ('declaratif', 'documente', 'complet')),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists attestation_claim_idx on attestation(claim_id);
create index if not exists attestation_lignee_idx on attestation(lignee_id);

-- 11. Composé chimique identifié dans le taxon
create table if not exists compose (
  id uuid primary key default gen_random_uuid(),
  taxon_id uuid not null references taxon(id) on delete cascade,
  nom text not null,
  concentration text,
  methode_identification text,
  created_at timestamptz not null default now()
);
create index if not exists compose_taxon_idx on compose(taxon_id);

-- 12. Cible biologique connue d'un composé
create table if not exists cible (
  id uuid primary key default gen_random_uuid(),
  compose_id uuid not null references compose(id) on delete cascade,
  proteine text not null,
  affinite text,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists cible_compose_idx on cible(compose_id);

-- 13. Étude scientifique appuyant un claim
create table if not exists etude (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claim(id) on delete cascade,
  doi text,
  titre text not null,
  type text not null check (type in (
    'preclinique_in_vitro', 'preclinique_animal', 'essai_clinique_humain',
    'revue_systematique', 'revue_narrative', 'etude_experimentale_humaine', 'autre'
  )),
  annee int,
  resume text,
  url text,
  created_at timestamptz not null default now()
);
create index if not exists etude_claim_idx on etude(claim_id);

-- Note : la table "Exécution" (§10 du brief — simulation sauvegardée et
-- versionnée) est volontairement absente ici. Elle appartient au
-- laboratoire de simulation (étape 3 du plan de construction), pas à
-- cette étape de fondations.

alter table lignee enable row level security;
alter table contributeur enable row level security;
alter table partie enable row level security;
alter table preparation enable row level security;
alter table indication enable row level security;
alter table taxon enable row level security;
alter table taxon_media enable row level security;
alter table nom_vernaculaire enable row level security;
alter table claim enable row level security;
alter table attestation enable row level security;
alter table compose enable row level security;
alter table cible enable row level security;
alter table etude enable row level security;
-- Aucune policy : accès service role uniquement, comme plantes/maladies/usages/sources.

-- 14. Vue d'agrégation — comptages bruts uniquement, aucune règle métier
--     ici (le tiering vit en TypeScript, voir web/lib/synthese.ts, pour
--     les mêmes raisons que confidence.ts aujourd'hui : ajuster un seuil
--     ne doit pas nécessiter un DROP FUNCTION Postgres).
create or replace view claim_attestation_stats as
select
  claim_id,
  count(*) as attestations_count,
  count(distinct lignee_id) as lignees_distinctes,
  count(distinct region) filter (where region is not null) as regions_distinctes,
  count(distinct langue) filter (where langue is not null) as langues_distinctes
from attestation
group by claim_id;

-- 15. match_claims — remplace match_usages pour la recherche sémantique.
--     query_embedding en text (pas vector) : PostgREST ne lie pas toujours
--     correctement un paramètre RPC de type extension — même contournement
--     que match_usages (voir schema.sql).
create or replace function match_claims(
  query_embedding text,
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  claim_id uuid,
  taxon_id uuid,
  taxon_slug text,
  nom_principal text,
  nom_scientifique text,
  precautions text,
  indication_nom text,
  partie_nom text,
  preparation_mode text,
  preparation_resume text,
  qualite_preuve_scientifique text,
  contre_indication_forte boolean,
  est_pilote boolean,
  attestations_count int,
  lignees_distinctes int,
  regions_distinctes int,
  langues_distinctes int,
  similarity float
)
language sql stable
as $$
  select
    c.id as claim_id,
    t.id as taxon_id,
    t.slug as taxon_slug,
    coalesce(
      (select nv.libelle from nom_vernaculaire nv where nv.taxon_id = t.id and nv.est_principal limit 1),
      t.nom_scientifique
    ) as nom_principal,
    t.nom_scientifique,
    t.precautions,
    i.nom as indication_nom,
    p.nom as partie_nom,
    prep.mode as preparation_mode,
    concat_ws(' — ', prep.mode, prep.solvant, prep.description_libre) as preparation_resume,
    c.qualite_preuve_scientifique,
    c.contre_indication_forte,
    c.est_pilote,
    coalesce(s.attestations_count, 0)::int as attestations_count,
    coalesce(s.lignees_distinctes, 0)::int as lignees_distinctes,
    coalesce(s.regions_distinctes, 0)::int as regions_distinctes,
    coalesce(s.langues_distinctes, 0)::int as langues_distinctes,
    1 - (c.embedding <=> query_embedding::vector(768)) as similarity
  from claim c
  join taxon t on t.id = c.taxon_id
  join indication i on i.id = c.indication_id
  join partie p on p.id = c.partie_id
  join preparation prep on prep.id = c.preparation_id
  left join claim_attestation_stats s on s.claim_id = c.id
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding::vector(768)) > match_threshold
  order by c.embedding <=> query_embedding::vector(768)
  limit match_count;
$$;

-- Pas d'index vectoriel ivfflat/hnsw ici non plus : même raisonnement que
-- schema.sql — volume trop faible pour qu'un index approximatif soit
-- autre chose que contre-productif.
