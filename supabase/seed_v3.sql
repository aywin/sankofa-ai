-- ============================================================
-- LAFI — v3 : sources d'exemple (illustratives, à remplacer par de
-- vraies sources avant une démo/production).
-- À exécuter APRÈS schema_v3.sql, dans le même SQL Editor Supabase.
-- Ne couvre pas les 24 usages — juste de quoi vérifier que le
-- comptage et le score de confiance (prompt 5) fonctionnent sur des
-- cas avec 0, 1 et plusieurs sources.
-- ============================================================

insert into sources (usage_id, type, label, reference_url)
select u.id, v.type, v.label, v.reference_url
from (values
  ('Neem (Margousier)', 'Paludisme', 'tradipraticien', 'Tradipraticien, région du Sahel', null),
  ('Neem (Margousier)', 'Paludisme', 'tradipraticien', 'Tradipraticien, région des Hauts-Bassins', null),
  ('Neem (Margousier)', 'Paludisme', 'scientifique', 'Journal of Ethnopharmacology (2019) — activité antipaludique in vitro', 'https://doi.org/10.1016/j.jep.2019'),
  ('Papayer', 'Paludisme', 'tradipraticien', 'Tradipraticien, région du Centre', null),
  ('Caïlcédrat', 'Paludisme', 'scientifique', 'Malaria Journal (2015) — activité antiplasmodiale de l''écorce', 'https://doi.org/10.1186/s12936-015'),
  ('Goyavier', 'Diarrhée', 'tradipraticien', 'Tradipraticien, région du Sud-Ouest', null),
  ('Goyavier', 'Diarrhée', 'tradipraticien', 'Tradipraticien, région du Centre-Est', null),
  ('Goyavier', 'Diarrhée', 'scientifique', 'Journal of Ethnopharmacology (2011) — effet antidiarrhéique des feuilles', 'https://doi.org/10.1016/j.jep.2011'),
  ('Bissap (Oseille de Guinée)', 'Hypertension', 'tradipraticien', 'Tradipraticien, région du Sahel', null),
  ('Bissap (Oseille de Guinée)', 'Hypertension', 'scientifique', 'Journal of Nutrition (2010) — effet sur la tension artérielle', 'https://doi.org/10.3945/jn.2009'),
  ('Bissap (Oseille de Guinée)', 'Hypertension', 'institution', 'Pharmacopée traditionnelle du Burkina Faso', null),
  ('Karité', 'Plaies et infections cutanées', 'tradipraticien', 'Tradipraticien, région des Hauts-Bassins', null)
) as v(plante_nom, maladie_nom, type, label, reference_url)
join plantes pl on pl.nom_local = v.plante_nom
join maladies ma on ma.nom = v.maladie_nom
join usages u on u.plante_id = pl.id and u.maladie_id = ma.id;
