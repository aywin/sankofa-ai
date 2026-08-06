-- ============================================================
-- LAFI — v4 : correction des études dupliquées, causée par une deuxième
-- exécution de seed_v4_pilotes.sql sans garde-fou d'idempotence sur les
-- inserts "etude" (contrairement à "compose", qui en avait un, et
-- "attestation", protégée indirectement par l'étape 1bis qui les purge
-- avant de les recréer).
--
-- Sans risque à exécuter même si aucun doublon n'existe (ne supprime
-- rien s'il n'y a qu'une ligne par groupe).
-- ============================================================

with dupes as (
  select id,
         row_number() over (partition by claim_id, titre order by created_at, id) as rn
  from etude
)
delete from etude where id in (select id from dupes where rn > 1);

-- Vérification attendue après exécution :
--   select count(*) from etude;  -> 15
