-- ============================================================
-- LAFI — 0003 : réduction, ville et plante d'origine des produits
--
-- Ces colonnes avaient été ajoutées après coup DANS 0001_boutique.sql ;
-- une base où 0001 était déjà appliquée ne les a donc jamais reçues
-- ("create table if not exists" ne modifie pas une table existante), et la
-- page d'une boutique tombait en erreur. Cette migration les ajoute.
-- Idempotente : sans effet sur une base qui les a déjà.
--
-- Règle pour la suite : on ne modifie jamais une migration déjà livrée ;
-- on en écrit une nouvelle.
-- ============================================================

alter table produit add column if not exists prix_reduit numeric(12, 2);
alter table produit add column if not exists ville text;
alter table produit add column if not exists plante_origine_libre text;

alter table produit drop constraint if exists produit_prix_reduit_check;
alter table produit add constraint produit_prix_reduit_check
  check (prix_reduit is null or (prix_reduit >= 100 and prix_reduit < prix and prix_reduit = round(prix_reduit)));
alter table produit drop constraint if exists produit_ville_check;
alter table produit add constraint produit_ville_check
  check (ville is null or length(ville) <= 80);
alter table produit drop constraint if exists produit_plante_origine_libre_check;
alter table produit add constraint produit_plante_origine_libre_check
  check (plante_origine_libre is null or length(plante_origine_libre) <= 120);

-- Recharge le cache de schéma de l'API (sinon "column does not exist"
-- peut persister quelques instants).
notify pgrst, 'reload schema';
