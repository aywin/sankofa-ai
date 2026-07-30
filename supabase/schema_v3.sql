-- ============================================================
-- LAFI — v3 : sources (confiance réelle), photo de plante,
-- contributions communautaires, favoris.
-- À exécuter dans Supabase : Project > SQL Editor > New query,
-- APRÈS schema.sql + seed.sql (et après schema_users.sql si les
-- comptes ne sont pas encore en place).
-- ============================================================

-- 1. Sources : appuient un usage (plante <-> maladie) avec une preuve
--    concrète et comptable. Le score de confiance (prompt 5, app) ne
--    doit JAMAIS être un chiffre inventé — il se calcule uniquement à
--    partir du nombre réel de lignes ici.
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  usage_id uuid not null references usages(id) on delete cascade,
  type text not null check (type in ('tradipraticien', 'scientifique', 'institution')),
  label text not null,
  reference_url text,
  created_at timestamptz not null default now()
);

create index if not exists sources_usage_id_idx on sources(usage_id);

alter table sources enable row level security;
-- Pas de policy : accès service role uniquement, comme usages/plantes/maladies.

-- 2. Photo de plante (nullable — un fallback visuel est utilisé côté app
--    tant qu'elle n'est pas renseignée).
alter table plantes add column if not exists photo_url text;

-- 3. match_usages : ajoute les comptages de sources par type, pour que
--    l'app puisse afficher un niveau de confiance basé sur des données
--    réelles plutôt que sur une estimation du modèle.
-- Postgres refuse un CREATE OR REPLACE qui change les colonnes de sortie
-- d'une fonction "returns table(...)" — il faut d'abord la supprimer.
drop function if exists match_usages(text, int, float);

create or replace function match_usages(
  query_embedding text,
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  usage_id uuid,
  plante_nom text,
  plante_precautions text,
  maladie_nom text,
  preparation text,
  posologie text,
  niveau_de_preuve text,
  similarity float,
  tradipraticien_count int,
  scientifique_count int,
  institution_count int
)
language sql stable
as $$
  select
    u.id as usage_id,
    p.nom_local as plante_nom,
    p.precautions as plante_precautions,
    m.nom as maladie_nom,
    u.preparation,
    u.posologie,
    u.niveau_de_preuve,
    1 - (u.embedding <=> query_embedding::vector(768)) as similarity,
    coalesce((select count(*) from sources s where s.usage_id = u.id and s.type = 'tradipraticien'), 0)::int as tradipraticien_count,
    coalesce((select count(*) from sources s where s.usage_id = u.id and s.type = 'scientifique'), 0)::int as scientifique_count,
    coalesce((select count(*) from sources s where s.usage_id = u.id and s.type = 'institution'), 0)::int as institution_count
  from usages u
  join plantes p on p.id = u.plante_id
  join maladies m on m.id = u.maladie_id
  where u.embedding is not null
    and 1 - (u.embedding <=> query_embedding::vector(768)) > match_threshold
  order by u.embedding <=> query_embedding::vector(768)
  limit match_count;
$$;

-- 4. Contributions communautaires ("Signaler un remède"). Volontairement
--    sans clé étrangère vers plantes/maladies : tout l'intérêt est de
--    pouvoir signaler quelque chose qui n'existe pas encore en base.
--    Capture uniquement en v3 — pas de back-office de validation, la
--    modération se fait manuellement via le Table Editor Supabase.
create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  plante_nom text not null,
  maladie_nom text not null,
  preparation text not null,
  posologie text,
  region text,
  ethnie text,
  langue text,
  contributeur text,
  contact text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'validee', 'rejetee')),
  created_at timestamptz not null default now()
);

alter table contributions enable row level security;
-- Pas de policy de lecture : insertion via la route API (service role)
-- uniquement, consultation manuelle via le Table Editor pour la modération.

-- 5. Favoris — même logique RLS que "conversations" (schema_users.sql) :
--    interrogée directement par le navigateur (clé anon + session), le
--    RLS fait tout le travail de sécurité. Identifié par plante_nom (texte)
--    plutôt que plante_id : la table "plantes" n'a volontairement aucune
--    policy RLS pour le navigateur (accès service role uniquement, voir
--    schema.sql), donc résoudre un nom -> id depuis le client n'est pas
--    possible sans passer par une route serveur — plante_nom l'évite.
create table if not exists favoris (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plante_nom text not null,
  created_at timestamptz not null default now(),
  unique (user_id, plante_nom)
);

create index if not exists favoris_user_id_idx on favoris(user_id);

alter table favoris enable row level security;

create policy "Les utilisateurs lisent leurs propres favoris"
  on favoris for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs propres favoris"
  on favoris for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres favoris"
  on favoris for delete
  using (auth.uid() = user_id);
