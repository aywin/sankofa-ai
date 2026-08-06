-- ============================================================
-- LAFI — v6 : contribution à divulgation graduée + symétrie
-- ajouter/contester (§7 du brief).
-- À exécuter dans Supabase : Project > SQL Editor > New query.
--
-- Reste volontairement HORS scope de ce patch (à faire plus tard,
-- nécessite des comptes liés aux contributions, pas seulement du texte
-- libre) :
--   - "relever" le niveau de divulgation d'une contribution déjà
--     soumise — pour l'instant, on resoumet en le précisant en texte
--     libre dans "notes" ;
--   - promotion automatique d'une contribution en Claim/Attestation —
--     reste manuel via le Table Editor, comme depuis schema_v3.sql.
-- ============================================================

alter table contributions
  add column if not exists type text not null default 'ajout' check (type in ('ajout', 'contestation')),
  add column if not exists niveau_divulgation text not null default 'declaratif' check (niveau_divulgation in ('declaratif', 'documente', 'complet')),
  add column if not exists consentement boolean not null default false,
  add column if not exists associations text;

-- "preparation" était NOT NULL depuis schema_v3.sql — le niveau
-- déclaratif (plante + indication seules) doit être soumettable sans
-- rien remplir d'autre (§7 : "l'entrée en niveau déclaratif doit être
-- très facile et sans engagement").
alter table contributions alter column preparation drop not null;

-- Vérification attendue après exécution :
--   \d contributions   (ou Table Editor) doit montrer type, niveau_divulgation,
--   consentement, associations, et preparation nullable.
