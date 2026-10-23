"""Contrôle reproductible : python verifier.py (aucune dépendance externe)."""
import csv,json,collections,unicodedata
from pathlib import Path
p=Path(__file__).resolve().parent
s=json.loads((p/'schema.json').read_text()); errors=[];data={}
for name,cols in s['colonnes'].items():
 with (p/(name+'.csv')).open(encoding='utf-8',newline='') as f:
  rd=csv.DictReader(f,delimiter=';'); rows=list(rd)
  if rd.fieldnames!=cols:errors.append(name+': colonnes différentes du schéma')
  data[name]=rows
 for i,r in enumerate(rows,2):
  if None in r:errors.append(f'{name}:{i}: nombre de cellules incorrect')
  for k,allowed in s['valeurs_autorisees'].items():
   if k in r and not (name=='medias' and k=='partie' and not r[k]) and r[k] not in allowed:errors.append(f'{name}:{i}: {k}={r[k]}')
  if 'indication' in r and r['indication'] not in s['indications_fermees']:errors.append(f'{name}:{i}: indication hors liste')
for r in data['indications']:
 if r['nom'] not in s['indications_fermees']:errors.append('indication hors liste : '+r['nom'])
checks={'taxons':['precautions','toxicite_connue','interactions_medicaments','confusions_possibles','statut_protection'],'usages':['public_deconseille','signes_arret','precautions_specifiques','contre_indication_forte','qualite_preuve_scientifique','resume_science']}
for name,cols in checks.items():
 for i,r in enumerate(data[name],2):
  for col in cols:
   if not r[col].strip():errors.append(f'{name}:{i}: sécurité/preuve vide : {col}')
taxa=[r['nom_scientifique'] for r in data['taxons']]
if len(set(taxa))!=len(taxa):errors.append('taxons dupliqués')
for name in ['noms_vernaculaires','usages','etudes','composes','medias']:
 for r in data[name]:
  if r['nom_scientifique'] not in taxa:errors.append(name+': taxon absent '+r['nom_scientifique'])
for name,field in [('noms_vernaculaires','source'),('usages','sources_tradition'),('indications','source')]:
 for r in data[name]:
  if 'https://' not in r[field] and 'http://' not in r[field]:errors.append(name+': source absente')
keys=['nom_scientifique','partie','mode','indication'];counter=collections.Counter(tuple(r[k].casefold().strip() for k in keys) for r in data['usages']);dups=sum(n-1 for n in counter.values() if n>1)
if dups:errors.append('doublons usages : '+str(dups))
coverage=collections.Counter(r['indication'] for r in data['usages'])
for disease in ['Règles douloureuses','Anémie','Infections urinaires','Diabète','Drépanocytose']:
 if not coverage[disease]:errors.append('couverture manquante : '+disease)
result={'statut':'ok' if not errors else 'echec','erreurs':errors,'lignes':{k:len(v) for k,v in data.items()},'cle_doublons':keys,'doublons_usages':dups,'couverture_usages':dict(coverage)}
(p/'controle.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
