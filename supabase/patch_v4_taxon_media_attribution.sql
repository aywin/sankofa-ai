-- ============================================================
-- LAFI — v4 : patch de rattrapage pour taxon_media.
--
-- À exécuter UNIQUEMENT si schema_v4.sql a déjà été exécuté AVANT
-- l'ajout des colonnes d'attribution (credit_auteur/licence/source_url)
-- à la définition de taxon_media dans ce fichier. Si tu exécutes
-- schema_v4.sql pour la première fois maintenant, ignore ce patch : les
-- colonnes sont déjà dans le CREATE TABLE.
--
-- Sans danger à exécuter : taxon_media est vide tant que
-- seed_v4_media.sql n'a pas encore tourné, donc l'ajout de colonnes
-- NOT NULL ne peut pas violer de contrainte sur des lignes existantes.
-- ============================================================

alter table taxon_media
  add column if not exists credit_auteur text not null,
  add column if not exists licence text not null,
  add column if not exists source_url text not null;

-- Enchaîner avec seed_v4_media.sql juste après ce patch.
