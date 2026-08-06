-- ============================================================
-- LAFI — v4 : correction du doublon Néré (Parkia biglobosa) créé par un
-- bug de migrate_v4_legacy.sql (le NOT EXISTS ne protège pas contre les
-- doublons générés au sein d'un même INSERT...SELECT quand deux usages
-- partagent le même texte de préparation — ici les deux usages de Néré).
--
-- Sans risque à exécuter même si le doublon n'existe pas (les deux
-- requêtes ne suppriment rien s'il n'y a qu'une ligne par groupe).
-- ============================================================

-- 1. Ne garder qu'un seul claim par (taxon, partie, indication) pour
--    Néré — supprime les claims en trop créés en double. La suppression
--    cascade automatiquement sur leurs attestations (FK ON DELETE
--    CASCADE).
with nere_claims as (
  select c.id,
         row_number() over (
           partition by c.taxon_id, c.partie_id, c.indication_id
           order by c.created_at, c.id
         ) as rn
  from claim c
  join taxon t on t.id = c.taxon_id
  where t.slug = 'nere'
)
delete from claim where id in (select id from nere_claims where rn > 1);

-- 2. Supprimer la ligne "preparation" dupliquée devenue orpheline
--    (même texte, plus référencée par aucun claim après l'étape 1).
delete from preparation
where description_libre = 'Décoction de l''écorce de néré.'
  and id not in (select preparation_id from claim);

-- Vérification attendue après exécution :
--   select count(*) from claim;                                    -> 24
--   select count(*) from claim c join taxon t on t.id = c.taxon_id
--     where t.slug = 'nere';                                       -> 2
--   select count(*) from preparation
--     where description_libre = 'Décoction de l''écorce de néré.';  -> 1
