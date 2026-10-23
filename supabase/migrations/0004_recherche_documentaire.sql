-- ============================================================
-- LAFI — 0004 : accueillir la recherche documentaire (lots A et B)
--
-- Ajoute les colonnes qui rendent le savoir utilisable : où trouver la
-- plante, comment la préparer pas à pas, à qui c'est déconseillé, quand
-- arrêter, les signes de gravité d'un mal, les sources. Ajoute trois
-- tables de référence : produits homologués, structures, remèdes non
-- végétaux. Idempotente.
-- ============================================================

-- Plante : répartition, accès, sécurité, sources.
alter table taxon add column if not exists synonymes text;
alter table taxon add column if not exists regions_burkina text;
alter table taxon add column if not exists localites text;
alter table taxon add column if not exists pays_presence text;
alter table taxon add column if not exists ou_la_trouver text;
alter table taxon add column if not exists saison_recolte text;
alter table taxon add column if not exists conservation text;
alter table taxon add column if not exists confusions_possibles text;
alter table taxon add column if not exists statut_protection text;
alter table taxon add column if not exists toxicite_connue text;
alter table taxon add column if not exists interactions_medicaments text;
alter table taxon add column if not exists sources text;

-- Nom local : un nom qui désigne plusieurs espèces n'est jamais utilisé
-- pour identifier une plante.
alter table nom_vernaculaire add column if not exists ambigu boolean not null default false;
alter table nom_vernaculaire add column if not exists source text;

-- Préparation : étapes, voie, usage rapporté (décrit, jamais prescrit),
-- public déconseillé, signes d'arrêt.
alter table preparation add column if not exists etapes text;
alter table preparation add column if not exists voie text;
alter table preparation add column if not exists mode_usage_rapporte text;
alter table preparation add column if not exists public_deconseille text;
alter table preparation add column if not exists signes_arret text;

-- Usage : origine de l'information et sources.
alter table claim add column if not exists origine text not null default 'terrain'
  check (origine in ('terrain', 'documentaire'));
alter table claim add column if not exists pays_region_usage text;
alter table claim add column if not exists nombre_sources_tradition int;
alter table claim add column if not exists resume_science text;
alter table claim add column if not exists sources_tradition text;

-- Mal : les signes qui imposent d'aller au centre de santé.
alter table indication add column if not exists signes_de_gravite text;
alter table indication add column if not exists source text;

alter table compose add column if not exists source text;

-- Tables de référence, en lecture publique.
create table if not exists produit_homologue (
  id uuid primary key default gen_random_uuid(),
  nom_produit text not null,
  plantes text,
  indication text,
  fabricant_ou_structure text,
  statut text,
  annee int,
  pays text,
  sources text not null,
  created_at timestamptz not null default now()
);

create table if not exists structure_reference (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  type text,
  ville text,
  role text,
  contact_public text,
  sources text not null,
  created_at timestamptz not null default now()
);

create table if not exists remede_non_vegetal (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  origine text check (origine in ('animale', 'minerale', 'eau')),
  matiere text,
  indication_id uuid references indication(id),
  preparation_description text,
  risques text,
  pays_region_usage text,
  sources text not null,
  created_at timestamptz not null default now()
);

alter table produit_homologue enable row level security;
alter table structure_reference enable row level security;
alter table remede_non_vegetal enable row level security;
drop policy if exists "lecture publique" on produit_homologue;
create policy "lecture publique" on produit_homologue for select using (true);
drop policy if exists "lecture publique" on structure_reference;
create policy "lecture publique" on structure_reference for select using (true);
drop policy if exists "lecture publique" on remede_non_vegetal;
create policy "lecture publique" on remede_non_vegetal for select using (true);

-- Recherche du chat : on renvoie aussi les informations de sécurité de la
-- préparation, pour que l'assistant les dise et que le panneau les montre.
drop function if exists match_claims(text, int, float);
create function match_claims(
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
  similarity float,
  precautions_specifiques text,
  public_deconseille text,
  signes_arret text,
  origine text
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
    1 - (c.embedding <=> query_embedding::vector(768)) as similarity,
    prep.precautions_specifiques,
    prep.public_deconseille,
    prep.signes_arret,
    c.origine
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

notify pgrst, 'reload schema';
