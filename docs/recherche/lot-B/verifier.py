import csv
import json
import re
from pathlib import Path

P = Path(__file__).resolve().parent
names = ['taxons', 'noms_vernaculaires', 'indications', 'usages', 'etudes', 'composes', 'medias', 'remedes_non_vegetaux', 'produits_homologues', 'structures', 'contexte']
data = {}
for name in names:
    with (P / (name + '.csv')).open(encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        data[name] = list(reader)
        assert reader.fieldnames and len(set(reader.fieldnames)) == len(reader.fieldnames)
        for row in data[name]:
            assert None not in row and None not in row.values(), (name, row)
taxa = {r['nom_scientifique'] for r in data['taxons']}
existing = {'paludisme', 'fièvre typhoïde', 'diarrhée', 'toux et affections respiratoires', 'maux de tête', 'hypertension', 'plaies et infections cutanées', 'insomnie'}
indications = existing | {r['nom'] for r in data['indications']}
assert len(taxa) == len(data['taxons'])
assert not existing & {r['nom'] for r in data['indications']}
source_columns = {'taxons': 'sources', 'noms_vernaculaires': 'source', 'indications': 'description', 'usages': 'sources_tradition', 'etudes': 'url', 'composes': 'source', 'medias': 'source_url', 'remedes_non_vegetaux': 'sources', 'produits_homologues': 'sources', 'structures': 'sources', 'contexte': 'source'}
for table, rows in data.items():
    seen = set()
    for row in rows:
        assert 'https://' in row[source_columns[table]], (table, 'source absente')
        key = tuple(row.values())
        assert key not in seen, (table, 'doublon exact')
        seen.add(key)
        if 'nom_scientifique' in row:
            assert row['nom_scientifique'] in taxa
        if 'indication' in row:
            assert row['indication'] in indications, (table, row['indication'])
        assert '—' not in ' '.join(row.values())
        assert not re.search(r'\b(prendre|buvez|prenez|avaler)\s+\d', ' '.join(row.values()), re.I)
for row in data['usages']:
    assert row['mode'] in {'decoction','infusion','maceration','poudre','cataplasme','application_directe','autre'}
    assert row['voie'] in {'orale','cutanée','bain','inhalation','gargarisme','collyre','autre'}
    assert row['contre_indication_forte'] in {'oui','non'}
    assert row['qualite_preuve_scientifique'] in {'','elevee','moderee','faible','tres_faible'}
    assert int(row['nombre_sources_tradition']) >= 1
for row in data['etudes']:
    assert row['type'] in {'revue_systematique','essai_clinique_humain','etude_experimentale_humaine','preclinique_animal','preclinique_in_vitro','revue_narrative'}
for row in data['taxons']:
    assert row['toxicite_connue'].startswith(('oui :','non :'))
for row in data['noms_vernaculaires']:
    assert row['est_principal'] in {'oui','non'}
counts = {name:len(rows) for name,rows in data.items()}
result = {'date':'2026-10-23','controles_structurels':'réussis','validation_clinique':'non réalisée','corpus':'partiel','lignes':counts}
(P / 'controle.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
