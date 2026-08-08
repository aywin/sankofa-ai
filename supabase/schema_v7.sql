-- ============================================================
-- LAFI — v7 : source_savoir (attribution humaine, réel vs illustratif).
-- À exécuter dans Supabase : Project > SQL Editor > New query.
--
-- Principe (voir lafi-best.md P1) : une attestation traditionnelle doit
-- pouvoir montrer un visage/un nom — mais aucune organisation ni
-- personne réelle ne doit apparaître comme source sans un accord
-- documenté. La distinction réel/illustratif est portée en base, avec
-- une contrainte dure qui empêche une source illustrative de compter
-- dans un score, quoi que fasse le code applicatif au-dessus.
-- ============================================================

create table if not exists source_savoir (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('structure', 'personne', 'publication')),
  nom_affichage text not null,
  role text,
  localisation text,
  -- 'reel_verifie' : identité réelle, vérifiable, autorisation au dossier
  -- pour structure/personne. 'illustratif' : représente le type de
  -- source que Lafi aura, jamais présenté comme réel.
  statut_verite text not null check (statut_verite in ('reel_verifie', 'illustratif')),
  autorisation_obtenue boolean not null default false,
  autorisation_reference text,
  reference_url text,
  photo_url text,
  -- Texte affiché sous le nom quand illustratif — obligatoire dans ce cas,
  -- voir contrainte plus bas.
  notice text,
  created_at timestamptz not null default now(),

  -- Une source réelle doit être vérifiable publiquement.
  constraint source_savoir_reel_requiert_reference check (
    statut_verite <> 'reel_verifie' or reference_url is not null
  ),
  -- Une structure/personne réelle doit avoir une autorisation documentée.
  -- Les publications sont exemptées : citer un travail publié ne demande
  -- l'accord de personne.
  constraint source_savoir_reel_requiert_autorisation check (
    statut_verite <> 'reel_verifie'
    or type = 'publication'
    or (autorisation_obtenue = true and autorisation_reference is not null)
  ),
  -- Une source illustrative doit porter sa notice — jamais un silence qui
  -- pourrait se lire comme une omission plutôt qu'un choix.
  constraint source_savoir_illustratif_requiert_notice check (
    statut_verite <> 'illustratif' or notice is not null
  ),
  -- Aucune photo de personne réelle sur un enregistrement illustratif —
  -- la contrainte ne peut pas juger le CONTENU de la photo, mais elle
  -- interdit structurellement le cas le plus dangereux : illustratif +
  -- type personne + photo, qui est la combinaison qui peut le plus
  -- facilement passer pour un vrai portrait.
  constraint source_savoir_illustratif_personne_sans_photo check (
    not (statut_verite = 'illustratif' and type = 'personne' and photo_url is not null)
  )
);

alter table source_savoir enable row level security;
-- Pas de policy : accès service role uniquement, comme le reste du
-- modèle de connaissance.

-- Rattache une attestation à sa source. Nullable : les attestations
-- migrées avant ce schéma seront reliées par migrate_v7_source_savoir.sql,
-- pas laissées orphelines.
alter table attestation add column if not exists source_savoir_id uuid references source_savoir(id);

-- Gate de comptage — c'est CETTE colonne, pas source_savoir.statut_verite
-- directement, que lisent les fonctions de calcul (lib/synthese.ts côté
-- app). Elle est pilotée par un trigger, pas par l'applicatif : impossible
-- d'insérer ou de modifier une attestation pour contourner la règle.
alter table attestation add column if not exists compte_dans_les_scores boolean not null default true;

create or replace function attestation_verrouiller_comptage()
returns trigger
language plpgsql
as $$
begin
  if new.source_savoir_id is not null and exists (
    select 1 from source_savoir s
    where s.id = new.source_savoir_id and s.statut_verite = 'illustratif'
  ) then
    new.compte_dans_les_scores := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_attestation_verrouiller_comptage on attestation;
create trigger trg_attestation_verrouiller_comptage
  before insert or update on attestation
  for each row execute function attestation_verrouiller_comptage();

create index if not exists attestation_source_savoir_idx on attestation(source_savoir_id);
create index if not exists source_savoir_statut_verite_idx on source_savoir(statut_verite);

-- claim_attestation_stats (schema_v4.sql) comptait toutes les
-- attestations sans distinction. Redéfinie ici pour ne compter que
-- celles dont compte_dans_les_scores = true — match_claims (qui la
-- consomme via LEFT JOIN) n'a pas besoin d'être modifiée, sa signature
-- ne change pas.
create or replace view claim_attestation_stats as
select
  claim_id,
  count(*) filter (where compte_dans_les_scores) as attestations_count,
  count(distinct lignee_id) filter (where compte_dans_les_scores) as lignees_distinctes,
  count(distinct region) filter (where compte_dans_les_scores and region is not null) as regions_distinctes,
  count(distinct langue) filter (where compte_dans_les_scores and langue is not null) as langues_distinctes
from attestation
group by claim_id;

-- Registre interne des organisations réelles à démarcher (lafi-best.md
-- P3.4) — outil de travail, jamais exposé publiquement : aucune route API
-- ne doit lire cette table, et aucune de ses entrées ne doit apparaître
-- sur le site tant qu'un accord n'a pas été obtenu (à ce moment-là, une
-- vraie ligne source_savoir est créée séparément, en reel_verifie).
create table if not exists partenaire_a_contacter (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  contact text,
  statut_demarche text not null default 'a_contacter'
    check (statut_demarche in ('a_contacter', 'contacte', 'en_discussion', 'accord_obtenu', 'refuse')),
  derniere_relance date,
  notes text,
  created_at timestamptz not null default now()
);

alter table partenaire_a_contacter enable row level security;
-- Pas de policy, accès service role uniquement — et surtout, ne jamais
-- créer de route API qui lit cette table.

-- Vérification attendue après exécution :
--   insert into source_savoir (type, nom_affichage, statut_verite) values ('personne','Test','reel_verifie');
--   -> doit échouer (pas de reference_url ni autorisation).
