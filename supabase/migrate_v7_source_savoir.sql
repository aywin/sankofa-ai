-- ============================================================
-- LAFI — v7 : structures illustratives (P3) + rattachement des
-- attestations existantes (P1). À exécuter APRÈS schema_v7.sql.
--
-- Aucun nom ci-dessous ne doit pouvoir être confondu avec une structure
-- réelle (Fédération des tradipraticiens, ordre professionnel, etc.) —
-- noms clairement génériques, non institutionnels, voir lafi-best.md P3.
-- ============================================================

insert into source_savoir (type, nom_affichage, role, localisation, statut_verite, notice)
select v.type, v.nom_affichage, v.role, v.localisation, 'illustratif', v.notice
from (values
  (
    'structure',
    'Corpus documentaire initial (illustration)',
    'Regroupement illustratif du savoir documentaire de départ',
    null,
    'Structure d''illustration — Lafi travaillera avec des organisations réelles de tradipraticiens ; les partenariats ne sont pas encore établis. Ce nom ne désigne aucune organisation existante.'
  ),
  (
    'structure',
    'Groupement de praticiens du Plateau central (illustration)',
    'Représente le type de structure régionale que Lafi visera',
    'Illustratif — aucune région réelle associée',
    'Structure d''illustration — Lafi travaillera avec des organisations réelles de tradipraticiens ; les partenariats ne sont pas encore établis. Ce nom ne désigne aucune organisation existante.'
  )
) as v(type, nom_affichage, role, localisation, notice)
where not exists (select 1 from source_savoir s where s.nom_affichage = v.nom_affichage);

-- Rattache les 16 attestations "corpus documentaire initial" (aucune
-- info régionale) à la structure illustrative générique.
update attestation a
set source_savoir_id = (
  select id from source_savoir where nom_affichage = 'Corpus documentaire initial (illustration)'
)
from lignee l
where a.lignee_id = l.id
  and l.nom = 'Corpus documentaire initial (non tracé)'
  and a.source_savoir_id is null;

-- Rattache les 7 attestations pilotes à régions (Neem, Bissap, Goyavier,
-- Papayer, Karité — voir seed_v4_pilotes.sql) à la structure illustrative
-- régionale. L'information de région réelle reste sur attestation.region,
-- inchangée : seule la source (qui l'atteste) devient explicitement
-- illustrative.
update attestation a
set source_savoir_id = (
  select id from source_savoir where nom_affichage = 'Groupement de praticiens du Plateau central (illustration)'
)
where a.source_savoir_id is null;

-- Le trigger attestation_verrouiller_comptage (schema_v7.sql) a déjà mis
-- compte_dans_les_scores à false sur toutes les lignes ci-dessus au
-- moment de l'UPDATE — rien d'autre à faire ici.

-- Vérification attendue après exécution :
--   select count(*) from attestation where compte_dans_les_scores = false;  -> 23 (toutes, aucune donnée réelle collectée à ce jour)
--   select count(*) from attestation where source_savoir_id is null;        -> 0
