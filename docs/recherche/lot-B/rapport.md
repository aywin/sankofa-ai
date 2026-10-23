# Lafi, lot B : corpus documentaire vérifié au 23 octobre 2026

## Périmètre et état du livrable

Ce dossier contient les 11 CSV demandés, en UTF-8 et séparés par un point-virgule. Il s’agit d’un corpus documentaire partiel, pas d’une attestation de terrain ni d’un catalogue thérapeutique validé. Les lignes sont sourcées. Les champs inconnus restent vides. Les fichiers remedes_non_vegetaux.csv et structures.csv ne contiennent que leurs en-têtes, car ils relèvent du lot A.

Les 12 plantes prioritaires sont présentes dans taxons.csv. Cassia sieberiana et Cochlospermum planchonii ont été ajoutées car les enquêtes burkinabè les citent fréquemment contre le paludisme. Les recettes suffisamment précises portent surtout sur le paludisme, les douleurs articulaires, les hémorroïdes et les affections du foie. Le diabète est couvert par des études et des mentions traditionnelles gardées hors import lorsque la recette manque. Ne pas attribuer la recette d’une indication à une autre.

## Ce qui manque

La couverture des 12 indications n’est pas complète : règles douloureuses sans recette vérifiée, anémie et infections urinaires sans préparation individuelle suffisamment établie. Les usages hépatiques ne sont pas transformés en diagnostics d’hépatite virale ou d’ictère. Aucune preuve clinique d’éradication du paludisme par les préparations recensées n’est établie ici.

Les données sur les régions administratives de présence, leur correspondance exacte avec le découpage de 2025, les prix de plantes sur les marchés, la durée de conservation et les confusions botaniques sont insuffisantes. regions_burkina est donc laissé vide, plutôt que d’inférer une présence à partir du domicile d’un informateur. Les biographies de plantes ne remplacent pas une clé d’identification.

Deux photos ont une attribution et un lien direct vérifiés. Les autres plantes restent sans photo. Les noms fulfuldé ne sont vérifiés ici que pour Cochlospermum tinctorium. Aucun nom n’a été démontré comme le plus courant au niveau national : est_principal reste non pour tous. Le lot A et sa vérification croisée par Claude n’ont pas été fournis.

Le chiffre récent national de recours à la médecine traditionnelle est une déclaration institutionnelle, pas une enquête nationale de prévalence retrouvée. Pas de mesure récente fiable de possession de smartphones à Ouagadougou. L’accès des ménages à Internet au RGPH 2019 ne doit pas être confondu avec les abonnements SIM. Les lois sont décrites comme textes historiques consultés, sans garantie d’état consolidé en 2026. Pas de registre nominatif complet des AMM en vigueur ni de fabricant établi pour chaque produit. Aucun concurrent commercial n’est déclaré actif sans vérification.

## Taxonomie et correspondances

| Nom du prompt ou de publication | Nom accepté utilisé dans les CSV |
|---|---|
| Sarcocephalus latifolius | Nauclea latifolia |
| Anogeissus leiocarpus ou Anogeissus leiocarpa | Terminalia leiocarpa |
| Pteleopsis suberosa | Terminalia engleri |

POWO classe les deux Cochlospermum en Bixaceae. Les anciennes sources emploient Cochlospermaceae. La composition historique du FACA emploie Fagara zanthoxyloides, rapproché ici de Zanthoxylum zanthoxyloides. Calotropis procera ne fait pas l’objet d’une recette dans ce lot. Le médicament industriel ne doit pas être assimilé à un mélange domestique de ses deux plantes.

## Risques et conventions de sécurité

Senna occidentalis : intoxications humaines graves après ingestion de graines. Securidaca longepedunculata : toxicité préclinique, usage domestique sûr non défini. Trichilia emetica : vomissements et diarrhée rapportés. Son usage importé porte contre_indication_forte=oui. Sclerocarya birrea : certains extraits répétés présentent des signaux de toxicité hépatique et rénale chez l’animal. Momordica charantia : grossesse à éviter, interactions hypoglycémiantes possibles, autres interactions seulement précliniques.

Pour les autres taxons, « non : toxicité non établie dans les sources retenues » décrit seulement l’état du corpus. Cela ne signifie jamais « plante non toxique ». Le schéma binaire devrait être remplacé par oui/non/indéterminée avant affichage public. Les contre-indications non renseignées et contre_indication_forte=non ne constituent pas une validation de sécurité.

Les contre-indications doivent être évaluées pour le public, la partie et l’extrait. Pas de contre-indications grossesse, allaitement, enfant, foie ou rein inventées lorsque la source ne les documente pas. Les signes d’arrêt propres à une préparation restent vides faute de données spécifiques. Les signes de gravité généraux sont dans indications.csv. Les notices de médicaments ne sont pas extrapolées à une plante brute.

## Contradictions et ambiguïtés

- Momordica charantia : Cochrane 2012 conclut à des données insuffisantes. Deux méta-analyses de 2024 aboutissent à des conclusions différentes. Les essais n’établissent pas l’efficacité d’une décoction ouest-africaine précise. Aucune note élevée ou modérée n’est donc attribuée à une recette locale.
- L’annonce de plus de 18 médicaments en 2026 et celle de 53 produits approuvés en avril 2026 ont des périmètres non rapprochés. Elles ne permettent pas de reconstituer un registre.
- FACA : les déclarations du producteur sur l’efficacité ne remplacent pas la lecture d’un essai contrôlé. La liste nationale 2023 confirme l’inscription comme MTA, pas une supériorité clinique.
- N’dribala est attribué à C. tinctorium dans une enquête et N’driballa à C. planchonii dans une autre. Ces noms ne doivent pas permettre une identification automatique.
- Le recueil et certaines monographies présentent des conclusions de sécurité plus affirmatives que ne le permettent leurs données. Ces conclusions ne sont pas reprises comme garanties.
- Une photo intitulée Sclerocarya birrea leaves.jpg décrit Afzelia africana. Elle est exclue : https://commons.wikimedia.org/wiki/File:Sclerocarya_birrea_leaves.jpg
- Le tableau 2 de Tibiri 2020 et le texte donnent des chiffres discordants pour les parties d’Anogeissus. Aucun de ces chiffres n’est importé.

## Import et vérification

Le script de contrôle vérifie les colonnes, les sources, les liens vers les taxons et indications, les valeurs autorisées et les doublons exacts. Les indications existantes citées dans le prompt sont réutilisées sans ligne supplémentaire. Les nouvelles indications comportent leurs URL dans description, car le schéma n’a pas de colonne source.

Le compteur nombre_sources_tradition est un minimum vérifié dans ce corpus. Les recettes de l’enquête de 2009 dont le tableau regroupe plusieurs parties et plusieurs modes ne permettent pas de prouver toutes les combinaisons possibles : deux lignes sont signalées pour révision manuelle avant import dans a_verifier_non_import.csv et exclues du CSV final.

La catégorie preclinique_in_vitro peut désigner l’axe résumé d’un article qui comporte aussi des résultats animaux. Les séries de cas d’intoxication restent dans les sources de taxons, car le schéma etudes ne prévoit pas observation_clinique. Le dossier ne contient ni dose à l’impératif ni promesse de guérison. Les étapes manquantes ne sont pas complétées par des habitudes supposées de lavage ou filtration.

Les produits FACA ont plusieurs lignes car elles documentent des statuts et des pays différents. La ligne AMM 2010 concerne le Burkina, la ligne AMM 2023 concerne la Côte d’Ivoire. Le schéma produits_homologues doit ajouter pays_autorisation, numero_amm, date_expiration et date_source pour éviter de perdre cette information. Les années des premières inscriptions non établies restent vides. Les noms de composition de la liste 2023 comportent des graphies anciennes : Acacia albida est conservé comme dans la source. Ne pas imposer un lien vers taxons pour des ingrédients hors lot sans les documenter.

## Comptage final

14 taxons, 18 noms locaux, 8 indications nouvelles, 11 usages, 7 études, 3 composés, 2 médias, 6 lignes de statut produit et 15 faits de contexte. Douze pistes supplémentaires sont hors import.

## Sources utilisées et consultées

Les URL présentes dans les CSV et les compléments sont énumérées ci-dessous. Les notices PubMed peuvent ne donner que le résumé : les résultats ne sont alors décrits qu’à ce niveau. Les documents repérés mais inaccessibles ne servent pas de preuve à une ligne importable.

- https://academicjournals.org/journal/AJPP/article-full-text/2C32A3467615
- https://academicjournals.org/journal/JPP/article-abstract/73B0FEB72644
- https://africa24tv.com/burkina-faso-homologation-de-la-pharmacopee-locale-53-produits-approuves-par-le-gouvernement/
- https://burkina24.com/2026/09/01/medecine-traditionnelle-et-alternative-les-activites-de-la-14e-snmta-lancees-a-manga/
- https://commons.wikimedia.org/wiki/File:Sclerocarya_birrea,_habitus,_Steenbokpan,_a.jpg
- https://commons.wikimedia.org/wiki/File:Zanthoxylum_zanthoxyloides_MS_2106.JPG
- https://ethnobotanyjournal.org/index.php/era/article/download/7973/2273/75805
- https://faolex.fao.org/docs/pdf/Bkf182204.pdf
- https://lefaso.net/spip.php?article131034=
- https://link.springer.com/article/10.1186/1746-4269-1-7
- https://link.springer.com/article/10.1186/s43094-020-00168-1
- https://plantuse.plantnet.org/en/Anogeissus_leiocarpa_(PROTA)
- https://plantuse.plantnet.org/fr/Pteleopsis_suberosa_(PROTA)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11112315/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC3317381/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6020631/
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:111535-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:111537-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1117728-2
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:171202-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:171217-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:293413-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:485224-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:579419-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:692714-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:71162-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:756296-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:757144-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77164564-1
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:909846-1
- https://pubmed.ncbi.nlm.nih.gov/16198079/
- https://pubmed.ncbi.nlm.nih.gov/25724970/
- https://pubmed.ncbi.nlm.nih.gov/38076168/
- https://pubmed.ncbi.nlm.nih.gov/39220825/
- https://pubmed.ncbi.nlm.nih.gov/41243981/
- https://pubmed.ncbi.nlm.nih.gov/7564422/
- https://pubmed.ncbi.nlm.nih.gov/9507900/
- https://upload.wikimedia.org/wikipedia/commons/1/1c/Sclerocarya_birrea%2C_habitus%2C_Steenbokpan%2C_a.jpg
- https://upload.wikimedia.org/wikipedia/commons/7/70/Zanthoxylum_zanthoxyloides_MS_2106.JPG
- https://www.afro.who.int/fr/countries/burkina-faso/news/lorganisation-mondiale-de-la-sante-encourage-les-pays-de-la-region-africaine-promouvoir-des
- https://www.afro.who.int/sites/default/files/2024-02/Liste%20nationale%20des%20m%C3%A9dicaments%20et%20autres%20produits%20essentiels_Burkina_Edition%202023.pdf
- https://www.cochrane.org/fr/evidence/CD007845_momordica-charantia-type-2-diabetes-mellitus
- https://www.ethnopharmacologia.org/prelude2020/pdf/biblio-ht-44-traore.pdf
- https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2023.1200801/full
- https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2020.563751/full
- https://www.ikprress.org/index.php/JOBI/article/view/11116
- https://www.insd.bf/fr/file-download/download/public/2071
- https://www.mskcc.org/cancer-care/integrative-medicine/herbs/bitter-melon
- https://www.researchgate.net/publication/369625579_20_Recueil_de_fiches_ethnobotaniques_plantes_medicinales_du_Burkina_Faso_et_d%27Afrique_de_l%27Ouest_Jean-Pierre_Nicolas
- https://www.scirp.org/pdf/aid2025151_71951131.pdf

- https://www.jvbs.net/publication/vol_3/issue_1/paper_6.pdf
- https://www.nhs.uk/conditions/diabetic-ketoacidosis/
- https://link.springer.com/article/10.1186/1746-4269-1-7

La revue Securidaca signalée sur PubMed a été repérée mais son ouverture n’a fourni qu’une page technique. La preuve retenue dans taxons.csv est l’étude animale de 2021, effectivement ouverte. Les anciennes URL OOAS ont échoué. Le tableau de bord numérique 2024 a été repéré mais son PDF a échoué : ses chiffres ne sont pas importés.
