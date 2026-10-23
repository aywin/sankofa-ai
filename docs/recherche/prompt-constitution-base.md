# Prompt de recherche : enrichir la base de Lafi

À donner tel quel à **Claude (Cowork)** et à **ChatGPT (mode agent)**, chacun avec un lot différent (voir la répartition en bas). Les fichiers produits sont ensuite importés et vérifiés par un script avant d'entrer dans la base.

---

## Le prompt

Tu travailles pour Lafi, une plateforme burkinabè qui documente les soins traditionnels locaux et les rend accessibles. Une personne y demande quel remède utiliser pour un mal, comment le préparer, avec quelles précautions et sur quelles sources. Lafi distingue toujours deux choses : **ce que rapportent les traditions** et **ce que dit la science**. Il ne les fusionne jamais.

Ta mission : faire une recherche documentaire en ligne sur le **lot qui t'est attribué** (plus bas), et produire des fichiers CSV prêts à importer. Tu travailles comme un documentaliste rigoureux, pas comme un rédacteur.

### Règles absolues

1. **Rien sans source.** Chaque ligne cite au moins une source vérifiable : DOI, URL d'un article, d'un ouvrage ou d'une base. Pas de source, pas de ligne. N'invente jamais un DOI, un titre, un auteur ou une année : si tu n'as pas pu ouvrir la source, ne la cite pas.
2. **Séparer tradition et science.** Un usage traditionnel rapporté par une enquête ethnobotanique n'est pas une preuve d'efficacité. Une étude in vitro n'est pas une preuve clinique.
3. **La sécurité avant tout.** Pour chaque plante, cherche activement la toxicité, les contre-indications (grossesse, allaitement, enfants, maladies du foie ou des reins), les interactions avec des médicaments et les confusions possibles avec une plante toxique. Une plante dangereuse (par exemple Securidaca longepedunculata ou Calotropis procera) se documente, mais avec `contre_indication_forte = oui`.
4. **Jamais de dose sous forme de consigne.** Décris la pratique rapportée (« décoction de feuilles séchées, bue en plusieurs prises dans la journée »), avec sa source. N'écris jamais « prendre 2 tasses par jour ».
5. **Le Burkina et l'Afrique de l'Ouest d'abord.** Privilégie les usages rapportés au Burkina Faso, puis au Mali, au Niger, en Côte d'Ivoire, au Ghana, au Sénégal. Indique toujours le pays ou la région de l'usage.
6. **Dis tes doutes.** Si deux sources se contredisent, garde les deux et note-le. Si un nom local peut désigner plusieurs espèces, signale-le.
7. **Style** : français simple, phrases courtes, aucun tiret long (—).

### Sources à privilégier

- **Taxonomie** : Plants of the World Online (Kew, POWO), World Flora Online. Le nom scientifique accepté, l'auteur et la famille viennent de là.
- **Usages traditionnels** :
  - Nacoulma O.G. (1996), *Plantes médicinales et pratiques médicales traditionnelles au Burkina Faso*, thèse, Université de Ouagadougou ;
  - la Pharmacopée de l'Afrique de l'Ouest (OOAS / WAHO) ;
  - PROTA4U (Plant Resources of Tropical Africa) ;
  - les enquêtes ethnobotaniques publiées sur le Burkina (Journal of Ethnopharmacology, Journal of Ethnobiology and Ethnomedicine, revues de l'IRSS et du CNRST, African Journal of Traditional, Complementary and Alternative Medicines).
- **Noms locaux** : enquêtes ethnobotaniques, PROTA4U, flores locales (Arbonnier, *Arbres, arbustes et lianes des zones sèches d'Afrique de l'Ouest*). Précise toujours la langue : mooré, dioula (bambara), fulfuldé, gourmantché, bissa, dagara, lobiri, san, gourounsi, français local.
- **Science** : PubMed, Europe PMC, Google Scholar. Revues systématiques et essais cliniques d'abord, puis études chez l'animal, puis in vitro.
- **Composés** : NANPDB et ANPD (bases africaines de produits naturels), PubChem, articles de phytochimie.
- **Photos** : uniquement Wikimedia Commons ou d'autres sources sous licence libre (CC BY, CC BY-SA, CC0, domaine public), avec l'auteur et la licence exacts.

### Ce que tu dois produire

Un dossier contenant les 7 fichiers ci-dessous, encodés en UTF-8, avec le séparateur `;`. Les liens entre fichiers se font par le **nom scientifique** et par le **nom de l'indication**, jamais par un identifiant.

**1. `taxons.csv`** : une ligne par plante.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Nom accepté (POWO), sans l'auteur. Ex. `Guiera senegalensis` |
| autorite | Ex. `J.F.Gmel.` |
| famille | Ex. `Combretaceae` |
| description | 2 ou 3 phrases simples : à quoi elle ressemble, où elle pousse |
| habitat_region | Zones du Burkina où on la trouve (sahélienne, soudano-sahélienne, soudanienne), et si elle est vendue sur les marchés |
| precautions | Précautions générales connues, en phrases simples. Vide si aucune n'est trouvée, mais alors le dire dans le rapport |
| toxicite_connue | `oui` ou `non`, plus une phrase |
| sources | URL ou DOI, séparés par ` | ` |

**2. `noms_vernaculaires.csv`** : une ligne par nom.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| libelle | Le nom tel qu'on le dit. Ex. `wilinwiiga` |
| langue | mooré, dioula, fulfuldé, gourmantché, bissa, dagara, français local… |
| region | Région ou ville, si la source la précise |
| est_principal | `oui` pour le nom le plus courant au Burkina (un seul par plante) |
| source | URL ou DOI |

**3. `indications.csv`** : une ligne par mal, s'il n'est pas déjà dans la liste existante (voir plus bas).

| Colonne | Contenu |
|---|---|
| nom | Ex. `Drépanocytose` |
| categorie | infectieux, digestif, respiratoire, cardiovasculaire, peau, douleur, sommeil, femme et grossesse, enfant, métabolique, sang, autre |
| symptomes | Comment les gens le décrivent, en mots simples |
| description | 1 ou 2 phrases |
| signes_de_gravite | Les signes qui imposent d'aller au centre de santé |

**4. `usages.csv`** : le cœur du travail. Une ligne par combinaison plante + partie + préparation + mal.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| partie | feuille, écorce, racine, fruit, graine, fleur, calice, tige, plante entière, gomme, sève |
| mode | decoction, infusion, maceration, poudre, cataplasme, application_directe, autre |
| solvant | eau, eau chaude, lait, beurre de karité, alcool, autre |
| preparation_description | Comment c'est préparé et utilisé, d'après la source, en phrases simples, sans consigne de dose |
| indication | Nom du mal (liste existante ou indications.csv) |
| precautions_specifiques | Précautions propres à cet usage |
| contre_indication_forte | `oui` ou `non` |
| pays_region_usage | Ex. `Burkina Faso, Plateau central` |
| nombre_sources_tradition | Nombre d'enquêtes indépendantes qui rapportent cet usage (deux enquêtes du même auteur comptent pour une) |
| qualite_preuve_scientifique | elevee, moderee, faible, tres_faible, ou vide (voir la règle plus bas) |
| resume_science | 1 ou 2 phrases : ce que disent les études, honnêtement |
| sources_tradition | URL ou DOI des enquêtes ethnobotaniques |

**5. `etudes.csv`** : une ligne par étude scientifique.

| Colonne | Contenu |
|---|---|
| nom_scientifique, indication | Lien vers l'usage |
| titre | Titre exact, dans sa langue d'origine |
| doi | Si disponible |
| url | Lien vers l'article |
| annee | Année de publication |
| type | revue_systematique, essai_clinique_humain, etude_experimentale_humaine, preclinique_animal, preclinique_in_vitro, revue_narrative |
| resume | 2 phrases maximum : ce qui a été testé, ce qui a été trouvé |

**6. `composes.csv`** : les principaux composés identifiés.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| nom | Nom du composé |
| partie | Partie de la plante analysée |
| concentration | Si la source la donne, sinon vide |
| methode_identification | Ex. HPLC, GC-MS |
| source_base | NANPDB, ANPD, PubChem, ou article |
| source | URL ou DOI |

**7. `medias.csv`** : jusqu'à 3 photos par plante.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| url | Lien direct vers l'image (fichier, pas la page) |
| label | Ce qu'on voit : `Feuilles`, `Arbre entier`, `Fruits sur le marché` |
| partie | Partie montrée, si c'est le cas |
| credit_auteur | Auteur exact |
| licence | Ex. `CC BY-SA 4.0` |
| source_url | Page Wikimedia de l'image |

Ajoute un **`rapport.md`** court contenant :
- ce que tu as couvert ;
- ce que tu n'as pas trouvé ;
- les contradictions entre sources ;
- les noms locaux ambigus ;
- les plantes à risque ;
- la liste complète des sources consultées.

### Règle pour la qualité de preuve scientifique (inspirée de GRADE)

- `elevee` : revue systématique ou plusieurs essais cliniques chez l'humain, cohérents, sur cet usage précis.
- `moderee` : au moins un essai clinique chez l'humain bien conduit, ou une revue systématique avec des limites.
- `faible` : petites études chez l'humain, ou plusieurs études animales concordantes.
- `tres_faible` : seulement des études in vitro ou animales isolées.
- vide : aucune étude trouvée sur cet usage.

### Ce que Lafi a déjà (à enrichir, pas à dupliquer)

**Plantes** : Citrus limon, Adansonia digitata, Tamarindus indica, Aloe vera, Cymbopogon citratus, Parkia biglobosa, Combretum micranthum, Azadirachta indica, Hibiscus sabdariffa, Psidium guajava, Khaya senegalensis, Moringa oleifera, Carica papaya, Vernonia amygdalina, Vitellaria paradoxa.

**Maux** : paludisme, fièvre typhoïde, diarrhée, toux et affections respiratoires, maux de tête, hypertension, plaies et infections cutanées, insomnie.

**Le plus gros manque** : les noms locaux. Aucun n'a de langue renseignée. Pour ces 15 plantes, trouve en priorité les noms en mooré, en dioula et en fulfuldé, avec leur source.

---

## Répartition des lots

Donne **le lot A à Claude** et **le lot B à ChatGPT**. Ensuite, donne à chacun les fichiers de l'autre, avec la consigne : « Vérifie chaque ligne de ces fichiers : la source existe-t-elle, dit-elle bien ça ? Liste les erreurs. » Les deux assistants se contrôlent ainsi mutuellement.

**Lot A : compléter l'existant, et les maux du quotidien**
1. Pour les 15 plantes existantes : noms locaux avec leur langue, toxicité, photos manquantes, nouveaux usages.
2. Nouveaux usages pour : diarrhée, maux de ventre, vers intestinaux, toux, rhume, plaies, brûlures, dermatoses et gale, conjonctivite, maux de dents.
3. Plantes à couvrir en priorité : Guiera senegalensis, Lippia multiflora, Ocimum gratissimum, Euphorbia hirta, Annona senegalensis, Ximenia americana, Balanites aegyptiaca, Detarium microcarpum, Ziziphus mauritiana, Piliostigma thonningii.

**Lot B : les maladies importantes au Burkina**
1. Usages pour : paludisme, fièvre, drépanocytose, hypertension, diabète, anémie, ictère et hépatite, ulcère d'estomac, hémorroïdes, infections urinaires, règles douloureuses, rhumatismes.
2. Plantes à couvrir en priorité : Zanthoxylum zanthoxyloides (à la base du FACA), Cochlospermum tinctorium, Sarcocephalus latifolius, Anogeissus leiocarpus, Terminalia macroptera, Pteleopsis suberosa, Mitragyna inermis, Sclerocarya birrea, Trichilia emetica, Momordica charantia, Senna occidentalis, Securidaca longepedunculata (à documenter comme plante à risque).

**Lot C (plus tard) : remèdes d'origine animale, minérale et l'eau**
Seulement ce qui est publié dans des enquêtes ethnographiques ou ethnopharmacologiques, avec les mêmes règles, et une attention particulière aux risques (contamination, métaux lourds, espèces protégées).

---

## Après la recherche

Dépose les fichiers dans `docs/recherche/lot-A/` et `docs/recherche/lot-B/`. Un script d'import vérifiera chaque ligne avant qu'elle n'entre dans la base :
- les liens entre fichiers ;
- les valeurs autorisées ;
- la présence d'une source sur chaque ligne ;
- l'absence de doses à l'impératif et de promesses de guérison ;
- les doublons avec l'existant.

Les usages importés seront marqués « source documentaire », pas « attestation de terrain » : ils viennent de publications, pas de tradipraticiens rencontrés.
