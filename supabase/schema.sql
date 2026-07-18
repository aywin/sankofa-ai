-- ============================================================
-- LAFI IA — Schéma Supabase v1
-- À exécuter dans Supabase : Project > SQL Editor > New query
-- Accès prévu : uniquement via le service role key, côté serveur
-- (routes Next.js). Le RLS est activé sans policy pour bloquer
-- tout accès direct depuis le navigateur (clé anon).
-- ============================================================

-- 1. Extension pgvector pour la recherche sémantique
create extension if not exists vector;

-- 2. Maladies
create table if not exists maladies (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  symptomes text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 3. Plantes
create table if not exists plantes (
  id uuid primary key default gen_random_uuid(),
  nom_local text not null unique,
  nom_scientifique text,
  description text,
  precautions text,
  created_at timestamptz not null default now()
);

-- 4. Usages : liaison plante <-> maladie (savoir traditionnel documenté)
create table if not exists usages (
  id uuid primary key default gen_random_uuid(),
  plante_id uuid not null references plantes(id) on delete cascade,
  maladie_id uuid not null references maladies(id) on delete cascade,
  preparation text not null,
  posologie text,
  niveau_de_preuve text not null default 'traditionnel'
    check (niveau_de_preuve in ('traditionnel', 'scientifique', 'les_deux')),
  -- texte source utilisé pour générer l'embedding (rempli au seed)
  contenu_pour_recherche text not null,
  -- vecteur généré par le script d'ingestion (prompt 3), NULL au seed
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists usages_plante_id_idx on usages(plante_id);
create index if not exists usages_maladie_id_idx on usages(maladie_id);

-- 5. Pas d'index vectoriel en v1 : avec ~24 lignes, un index ivfflat est
--    contre-productif (index approximatif calibré pour des dizaines de
--    milliers de lignes ; sur un aussi petit volume il peut carrément
--    renvoyer 0 résultat pour des vecteurs de requête hors distribution
--    d'entraînement — c'est arrivé en test). Le scan séquentiel sur 24
--    lignes est exact et instantané. À réintroduire (ivfflat ou hnsw)
--    seulement si la table dépasse plusieurs milliers de lignes.

-- 6. Fonction RPC — c'est l'outil "rechercher_par_symptome" de l'agent IA.
--    Recherche par similarité sémantique uniquement (cosine distance),
--    aucun mot-clé / ILIKE / regex.
--    query_embedding est en `text` (pas `vector`) : PostgREST ne lie pas
--    toujours correctement un paramètre RPC de type extension (vector) —
--    testé et confirmé sur ce projet. On transmet donc le vecteur en texte
--    JSON (ex. "[0.01,0.02,...]") et on le caste en vector() à l'intérieur
--    de la fonction, où le cast texte -> vector est natif et fiable.
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
  similarity float
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
    1 - (u.embedding <=> query_embedding::vector(768)) as similarity
  from usages u
  join plantes p on p.id = u.plante_id
  join maladies m on m.id = u.maladie_id
  where u.embedding is not null
    and 1 - (u.embedding <=> query_embedding::vector(768)) > match_threshold
  order by u.embedding <=> query_embedding::vector(768)
  limit match_count;
$$;

-- 7. RLS activé, sans policy : bloque tout accès via la clé anon publique.
--    Le service role key (utilisé côté serveur uniquement) contourne le RLS.
alter table maladies enable row level security;
alter table plantes enable row level security;
alter table usages enable row level security;
