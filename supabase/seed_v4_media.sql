-- ============================================================
-- LAFI — v4 : galerie photo pour 6 des 8 couples pilotes.
-- À exécuter APRÈS schema_v4.sql, migrate_v4_legacy.sql et
-- seed_v4_pilotes.sql.
--
-- Toutes les images viennent de Wikimedia Commons, vérifiées une par une
-- (URL directe, auteur, licence lus sur la page "File:" du fichier —
-- aucune n'est devinée). Deux sont CC0 (aucune attribution légalement
-- requise, créditées quand même par courtoisie), les autres CC-BY(-SA)
-- (attribution obligatoire — voir PlantGallery.tsx qui l'affiche).
--
-- Couverture : Neem, Bissap, Papayer, Karité (2 vues), Goyavier et
-- Vernonia (1 vue, faute d'avoir trouvé un second candidat fiable en
-- v4). Caïlcédrat et Moringa : 1 vue chacun. Aucune image pour
-- Vernonia/Goyavier "plante entière" ni pour Caïlcédrat/Moringa
-- "partie utilisée" — à compléter plus tard plutôt que de forcer un
-- candidat douteux.
-- ============================================================

insert into taxon_media (taxon_id, partie_id, url, label, credit_auteur, licence, source_url)
select t.id, p.id, v.url, v.label, v.credit_auteur, v.licence, v.source_url
from (values
  ('neem-margousier', 'feuille', 'https://upload.wikimedia.org/wikipedia/commons/4/45/Azadirachta_indica%2C_leaves_%26_fruits.JPG', 'Feuilles et fruits', 'Kevinsooryan', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Azadirachta_indica,_leaves_%26_fruits.JPG'),
  ('neem-margousier', 'feuille', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Neem_%28Azadirachta_indica%29_leaves_%26_flowers_in_Kolkata_W_IMG_6199.jpg', 'Feuilles et fleurs', 'J.M.Garg', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Neem_(Azadirachta_indica)_leaves_%26_flowers_in_Kolkata_W_IMG_6199.jpg'),

  ('bissap-oseille-de-guinee', null, 'https://upload.wikimedia.org/wikipedia/commons/7/72/Hibiscus_sabdariffa_1.jpg', 'Plante entière', 'Franz Xaver', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Hibiscus_sabdariffa_1.jpg'),
  ('bissap-oseille-de-guinee', 'calice', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hibiscus_sabdariffa_dried.jpg', 'Calices séchés (partie utilisée)', 'Popperipopp', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Hibiscus_sabdariffa_dried.jpg'),

  ('goyavier', 'fruit', 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Psidium_guajava_fruit.jpg', 'Fruit', 'A-giâu', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Psidium_guajava_fruit.jpg'),

  ('cailcedrat', 'écorce', 'https://upload.wikimedia.org/wikipedia/commons/6/60/Khaya_senegalensis_bark_03.JPG', 'Écorce (partie utilisée)', 'Forestowlet', 'CC0 1.0', 'https://commons.wikimedia.org/wiki/File:Khaya_senegalensis_bark_03.JPG'),

  ('moringa', null, 'https://upload.wikimedia.org/wikipedia/commons/2/21/The_tree_and_seedpods_of_Moringa_oleifera.JPG', 'Arbre et gousses', 'Prof. Chen Hualin', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:The_tree_and_seedpods_of_Moringa_oleifera.JPG'),

  ('papayer', null, 'https://upload.wikimedia.org/wikipedia/commons/d/de/Carica_papaya_tree.jpg', 'Arbre entier', 'VARSHA KRISHNARAJ', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Carica_papaya_tree.jpg'),
  ('papayer', 'feuille', 'https://upload.wikimedia.org/wikipedia/commons/1/19/Carica_papaya_young_leaf.jpg', 'Jeune feuille (partie utilisée)', 'JDP90', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Carica_papaya_young_leaf.jpg'),

  ('vernonia-ndole', 'feuille', 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Vernonia_amygdalina_06.jpg', 'Feuilles (partie utilisée)', 'Forestowlet', 'CC0 1.0', 'https://commons.wikimedia.org/wiki/File:Vernonia_amygdalina_06.jpg'),

  ('karite', null, 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Vitellaria_paradoxa_MS_6563.JPG', 'Arbre entier', 'Marco Schmidt', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Vitellaria_paradoxa_MS_6563.JPG'),
  ('karite', 'fruit', 'https://upload.wikimedia.org/wikipedia/commons/7/75/Vitellaria_paradoxa_MS_3765.jpg', 'Fruit (contient la graine utilisée pour le beurre)', 'Marco Schmidt', 'CC BY-SA 2.5', 'https://commons.wikimedia.org/wiki/File:Vitellaria_paradoxa_MS_3765.jpg')
) as v(taxon_slug, partie_nom, url, label, credit_auteur, licence, source_url)
join taxon t on t.slug = v.taxon_slug
left join partie p on p.nom = v.partie_nom
where not exists (select 1 from taxon_media m where m.url = v.url);

-- Vérification attendue après exécution :
--   select count(*) from taxon_media;  -> 12
--   select t.slug, count(*) from taxon_media m join taxon t on t.id = m.taxon_id group by t.slug order by t.slug;
