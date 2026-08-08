-- ============================================================
-- LAFI — v9 : synergie_execution (espace expérimental "Explorer des
-- synergies" — croisement de profils chimiques entre deux plantes).
-- À exécuter dans Supabase : Project > SQL Editor > New query.
--
-- Contrairement à `execution` (laboratoire), ceci ne documente jamais un
-- usage attesté : c'est une hypothèse générée à partir de composés/
-- cibles déjà en base, mise en cache pour la reproductibilité — même
-- logique que web/lib/laboratoireAnalyse.ts, appliquée à
-- web/lib/synergieAnalyse.ts.
-- ============================================================

create table if not exists synergie_execution (
  id uuid primary key default gen_random_uuid(),
  -- Toujours stockés triés (taxon_a_id < taxon_b_id en comparaison
  -- texte) côté application — une seule ligne de cache par paire, quel
  -- que soit l'ordre de sélection dans l'interface.
  taxon_a_id uuid not null references taxon(id) on delete cascade,
  taxon_b_id uuid not null references taxon(id) on delete cascade,
  note_libre text,
  version_donnees text not null,
  entrees jsonb not null,
  hypothese_texte text not null,
  hypothese_origine text not null check (hypothese_origine in ('ia', 'repli_deterministe')),
  created_at timestamptz not null default now(),
  unique (taxon_a_id, taxon_b_id, version_donnees, note_libre)
);

create index if not exists synergie_execution_paire_idx on synergie_execution(taxon_a_id, taxon_b_id);

alter table synergie_execution enable row level security;
-- Pas de policy : accès service role uniquement, même régime que le
-- reste du modèle de connaissance.

-- Vérification attendue après exécution :
--   insert into synergie_execution (taxon_a_id, taxon_b_id, version_donnees, entrees, hypothese_texte, hypothese_origine)
--   values ((select id from taxon limit 1), (select id from taxon offset 1 limit 1), 'test', '{}', 'texte', 'repli_deterministe');
--   -> doit réussir.
