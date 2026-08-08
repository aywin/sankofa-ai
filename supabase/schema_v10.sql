-- ============================================================
-- LAFI — v10 : compose/cible plus flexibles, pour accueillir plusieurs
-- bases sources (CMAUP, LOTUS, COCONUT, étude dédiée…) sans perdre la
-- distinction entre les niveaux de preuve.
--
-- Contexte (retour utilisateur) : "plante contient X", "X agit sur Y"
-- et "X explique l'effet observé de la plante" sont trois affirmations
-- différentes, avec trois niveaux de preuve différents — le modèle ne
-- doit jamais les confondre. Ce patch ajoute les colonnes pour tracer
-- ça, de façon additive (rien n'est cassé pour les lignes existantes).
--
-- À exécuter dans Supabase : Project > SQL Editor > New query.
-- ============================================================

alter table compose add column if not exists source_base text;
comment on column compose.source_base is
  'Base ou méthode qui a établi le lien plante→composé (ex. ''CMAUP'', ''LOTUS'', ''isolement dédié''). Jamais un usage attesté en soi.';

alter table compose add column if not exists localisation_collecte text;
comment on column compose.localisation_collecte is
  'Provenance géographique de l''échantillon analysé, quand connue (COCONUT). Un composé documenté sur un échantillon indien n''est pas une affirmation sur le même taxon récolté au Burkina Faso — le chimiotype varie avec le sol, le climat, la saison.';

alter table cible add column if not exists voie_kegg text;
comment on column cible.voie_kegg is
  'Voie biologique KEGG associée à la cible, quand connue (CMAUP) — permet, à terme, un recouvrement de voie plutôt qu''un recouvrement de cible exacte pour /synergies (deux plantes complémentaires sur une même voie plutôt que redondantes sur une même protéine).';

do $$ begin
  if not exists (select 1 from pg_type where typname = 'niveau_preuve_cible') then
    create type niveau_preuve_cible as enum ('activite_mesuree', 'predite_similarite');
  end if;
end $$;

alter table cible add column if not exists niveau_preuve niveau_preuve_cible not null default 'activite_mesuree';
comment on column cible.niveau_preuve is
  '''activite_mesuree'' : valeur d''activité expérimentale directe (IC50/Ki/EC50 avec référence). ''predite_similarite'' : cible prédite par similarité structurale avec un analogue, jamais mesurée pour ce composé précis — à afficher différemment, jamais mélangée à une donnée mesurée.';

-- Rétroactif : les cibles déjà en base (Caïlcédrat, Quercétine, vitamine
-- C — toutes issues d'une valeur d'activité mesurée avec référence)
-- sont explicitement de niveau 'activite_mesuree'.
update cible set niveau_preuve = 'activite_mesuree' where niveau_preuve is null;

update compose set source_base = 'Isolement dédié (étude ciblée)'
where nom = 'Limonoïde (21β-hydroxybourjotinolone A)' and source_base is null;

update compose set source_base = 'CMAUP (bidd.group/CMAUP)'
where nom in ('Quercétine', 'Acide ascorbique (vitamine C)') and source_base is null;
