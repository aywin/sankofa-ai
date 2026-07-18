-- Diagnostic : à exécuter dans le SQL Editor de Supabase, coller le résultat.
-- Ça teste directement en SQL pur (sans passer par l'API REST / JS) si la
-- comparaison vectorielle fonctionne pour un vecteur "quelconque".

select
  u.id,
  p.nom_local,
  m.nom as maladie_nom,
  1 - (u.embedding <=> (select array_agg(0.01::real)::vector(768) from generate_series(1,768))) as similarity
from usages u
join plantes p on p.id = u.plante_id
join maladies m on m.id = u.maladie_id
order by similarity desc
limit 5;
