-- ============================================================
-- LAFI IA — Données de seed v1
-- À exécuter APRÈS schema.sql, dans le même SQL Editor Supabase.
-- 8 maladies, 15 plantes, 24 usages.
-- Les embeddings (colonne "embedding") restent NULL ici : ils sont
-- générés ensuite par le script d'ingestion (prompt 3) qui appelle
-- l'API Gemini pour chaque ligne de "usages".
-- ============================================================

insert into maladies (nom, symptomes, description) values
('Paludisme', 'fièvre élevée, frissons, maux de tête, courbatures, sueurs', 'Maladie parasitaire transmise par piqûre de moustique anophèle.'),
('Fièvre typhoïde', 'fièvre progressive, douleurs abdominales, fatigue intense, maux de tête', 'Infection bactérienne liée à l''eau ou aux aliments contaminés.'),
('Diarrhée', 'selles liquides fréquentes, crampes abdominales, déshydratation', 'Trouble digestif aigu, souvent d''origine infectieuse.'),
('Toux et affections respiratoires', 'toux sèche ou grasse, gorge irritée, essoufflement léger', 'Affection courante des voies respiratoires hautes.'),
('Maux de tête', 'douleur crânienne, sensibilité à la lumière, tension', 'Céphalées courantes, souvent liées à la fatigue ou au stress.'),
('Hypertension', 'maux de tête, vertiges, fatigue, palpitations', 'Tension artérielle élevée de façon chronique.'),
('Plaies et infections cutanées', 'rougeur, gonflement, douleur locale, suintement', 'Lésions de la peau à risque d''infection.'),
('Insomnie', 'difficulté à s''endormir, réveils nocturnes, fatigue diurne', 'Trouble du sommeil chronique ou occasionnel.');

insert into plantes (nom_local, nom_scientifique, description, precautions) values
('Moringa', 'Moringa oleifera', 'Arbre aux feuilles très nutritives, largement utilisé en Afrique de l''Ouest.', 'Éviter les fortes doses chez la femme enceinte.'),
('Neem (Margousier)', 'Azadirachta indica', 'Arbre aux feuilles amères réputées pour leurs propriétés antipaludiques et antiseptiques.', 'Déconseillé en usage prolongé et chez la femme enceinte.'),
('Tamarin', 'Tamarindus indica', 'Arbre dont la pulpe du fruit est utilisée en décoction contre la fièvre et les troubles digestifs.', 'Peu de contre-indications aux doses traditionnelles.'),
('Kinkeliba', 'Combretum micranthum', 'Arbuste dont les feuilles sont infusées, très utilisé pour le foie et la digestion.', 'Éviter un usage quotidien prolongé sans pause.'),
('Baobab', 'Adansonia digitata', 'Arbre emblématique du Sahel, pulpe riche en vitamine C utilisée contre la fièvre et la fatigue.', 'Généralement bien toléré.'),
('Karité', 'Vitellaria paradoxa', 'Arbre dont le beurre est utilisé en application cutanée pour les plaies et irritations.', 'Usage externe uniquement.'),
('Papayer', 'Carica papaya', 'Feuilles utilisées traditionnellement contre le paludisme et les troubles digestifs.', 'Graines déconseillées chez la femme enceinte.'),
('Goyavier', 'Psidium guajava', 'Jeunes feuilles en décoction utilisées contre la diarrhée.', 'Peu de contre-indications connues.'),
('Citronnelle', 'Cymbopogon citratus', 'Plante aromatique infusée contre la fièvre, les maux de tête et pour favoriser le sommeil.', 'Bien tolérée en infusion.'),
('Aloe vera', 'Aloe vera', 'Gel de la plante utilisé en application locale pour les plaies et irritations cutanées.', 'Éviter l''ingestion sans encadrement.'),
('Bissap (Oseille de Guinée)', 'Hibiscus sabdariffa', 'Calices utilisés en infusion, traditionnellement associés à la régulation de la tension artérielle.', 'Prudence en cas de tension déjà basse.'),
('Néré', 'Parkia biglobosa', 'Écorce utilisée en décoction contre la fièvre et les infections.', 'Respecter les doses traditionnelles.'),
('Caïlcédrat', 'Khaya senegalensis', 'Écorce très amère utilisée traditionnellement contre le paludisme et la fièvre.', 'Goût très amer, doses traditionnelles à respecter.'),
('Citron', 'Citrus limon', 'Fruit utilisé en jus ou infusion contre la toux et les maux de gorge.', 'Bien toléré en usage courant.'),
('Vernonia (Ndolé)', 'Vernonia amygdalina', 'Feuilles amères utilisées traditionnellement pour la digestion et la fièvre.', 'Goût très amer, à doser prudemment.');

insert into usages (plante_id, maladie_id, preparation, posologie, niveau_de_preuve, contenu_pour_recherche)
select
  pl.id,
  ma.id,
  v.preparation,
  v.posologie,
  v.niveau_de_preuve,
  ma.nom || ' : ' || ma.symptomes || '. Usage traditionnel de ' || pl.nom_local ||
    coalesce(' (' || pl.nom_scientifique || ')', '') || ' — ' || v.preparation
from (values
  ('Neem (Margousier)',          'Paludisme',                        'Décoction des feuilles séchées dans de l''eau bouillante pendant 15 minutes.', '1 tasse, 2 fois par jour pendant 3 jours.', 'les_deux'),
  ('Papayer',                    'Paludisme',                        'Décoction des feuilles fraîches de papayer.', '1 tasse par jour pendant 5 jours.', 'traditionnel'),
  ('Caïlcédrat',                 'Paludisme',                        'Décoction de l''écorce séchée et pilée.', '1 tasse, 2 fois par jour.', 'traditionnel'),
  ('Néré',                       'Paludisme',                        'Décoction de l''écorce de néré.', '1 tasse par jour.', 'traditionnel'),
  ('Tamarin',                    'Fièvre typhoïde',                  'Décoction de la pulpe de tamarin dans l''eau.', '2 tasses par jour.', 'traditionnel'),
  ('Baobab',                     'Fièvre typhoïde',                  'Infusion de la pulpe de baobab (pain de singe).', '1 verre par jour.', 'les_deux'),
  ('Néré',                       'Fièvre typhoïde',                  'Décoction de l''écorce de néré.', '1 tasse, 2 fois par jour.', 'traditionnel'),
  ('Goyavier',                   'Diarrhée',                         'Décoction des jeunes feuilles de goyavier.', '1 tasse après chaque selle liquide.', 'les_deux'),
  ('Kinkeliba',                  'Diarrhée',                         'Infusion des feuilles séchées de kinkeliba.', '1 tasse, 2 fois par jour.', 'traditionnel'),
  ('Tamarin',                    'Diarrhée',                         'Jus dilué de pulpe de tamarin.', '1 verre par jour.', 'traditionnel'),
  ('Vernonia (Ndolé)',           'Diarrhée',                         'Décoction des feuilles amères de vernonia.', '1 petite tasse, 2 fois par jour.', 'traditionnel'),
  ('Citron',                     'Toux et affections respiratoires', 'Jus de citron chaud additionné de miel.', '1 verre, 2 fois par jour.', 'les_deux'),
  ('Citronnelle',                'Toux et affections respiratoires', 'Infusion des feuilles de citronnelle.', '2 à 3 tasses par jour.', 'traditionnel'),
  ('Moringa',                    'Toux et affections respiratoires', 'Infusion des feuilles séchées de moringa.', '1 tasse par jour.', 'traditionnel'),
  ('Citronnelle',                'Maux de tête',                     'Infusion de feuilles de citronnelle.', '1 tasse en cas de douleur.', 'traditionnel'),
  ('Moringa',                    'Maux de tête',                     'Infusion des feuilles de moringa.', '1 tasse par jour.', 'traditionnel'),
  ('Bissap (Oseille de Guinée)', 'Hypertension',                     'Infusion des calices séchés d''hibiscus.', '1 à 2 tasses par jour.', 'les_deux'),
  ('Moringa',                    'Hypertension',                     'Poudre de feuilles de moringa diluée dans l''eau.', '1 cuillère par jour.', 'les_deux'),
  ('Kinkeliba',                  'Hypertension',                     'Infusion des feuilles de kinkeliba.', '1 tasse par jour.', 'traditionnel'),
  ('Karité',                     'Plaies et infections cutanées',    'Application locale de beurre de karité pur sur la zone nettoyée.', '2 fois par jour jusqu''à cicatrisation.', 'les_deux'),
  ('Aloe vera',                  'Plaies et infections cutanées',    'Application du gel frais extrait de la feuille.', '2 à 3 fois par jour.', 'les_deux'),
  ('Neem (Margousier)',          'Plaies et infections cutanées',    'Lavage de la plaie avec une décoction tiède de feuilles de neem.', '2 fois par jour.', 'traditionnel'),
  ('Citronnelle',                'Insomnie',                         'Infusion de feuilles de citronnelle prise le soir.', '1 tasse avant le coucher.', 'traditionnel'),
  ('Bissap (Oseille de Guinée)', 'Insomnie',                         'Infusion légère de calices d''hibiscus en soirée.', '1 tasse avant le coucher.', 'traditionnel')
) as v(plante_nom, maladie_nom, preparation, posologie, niveau_de_preuve)
join plantes pl on pl.nom_local = v.plante_nom
join maladies ma on ma.nom = v.maladie_nom;
