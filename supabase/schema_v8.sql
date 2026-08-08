-- ============================================================
-- LAFI — v8 : execution (laboratoire, P9 de lafi-best.md).
-- À exécuter dans Supabase : Project > SQL Editor > New query.
--
-- Une exécution = une simulation sauvegardée pour un couple précis, avec
-- ses entrées, sa synthèse, et une empreinte des données qui l'ont
-- produite (version_donnees) — pour qu'un lien permanent reste
-- reproductible tant que les données sous-jacentes n'ont pas changé, et
-- se régénère automatiquement le jour où elles changent (voucher
-- déposé, nouvelle étude ajoutée, etc.).
-- ============================================================

create table if not exists execution (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claim(id) on delete cascade,
  note_libre text,
  -- Empreinte des sorties structurées des nœuds 1-4 au moment du calcul
  -- (voir web/lib/laboratoireAnalyse.ts) — clé de cache : une exécution
  -- existante est réutilisée tant que cette empreinte ne change pas.
  version_donnees text not null,
  entrees jsonb not null,
  synthese_texte text not null,
  -- 'ia' : généré par le modèle et validé. 'repli_deterministe' : le
  -- modèle a échoué ou sa sortie a été rejetée par la validation — texte
  -- composé sans IA à partir des mêmes données structurées, jamais une
  -- page vide ni une erreur brute affichée à l'utilisateur.
  synthese_origine text not null check (synthese_origine in ('ia', 'repli_deterministe')),
  created_at timestamptz not null default now(),
  unique (claim_id, version_donnees, note_libre)
);

create index if not exists execution_claim_idx on execution(claim_id);

alter table execution enable row level security;
-- Pas de policy : accès service role uniquement, comme le reste du
-- modèle de connaissance. Les exécutions sont lues via une route
-- publique dédiée (lien permanent), pas par un accès direct client.

-- Vérification attendue après exécution :
--   insert into execution (claim_id, version_donnees, entrees, synthese_texte, synthese_origine)
--   values ((select id from claim limit 1), 'test', '{}', 'texte', 'repli_deterministe');
--   -> doit réussir.
