# Prompt de recherche documentaire Lafi

> **Complété le 23/10/2026** :
> 1. le tableau de correspondance des régions (découpage 2025) est rempli, à partir de la presse officielle. Le texte du décret reste à vérifier si on en a besoin ;
> 2. le lien sur les 18 produits homologués (août 2026) est ajouté ;
> 3. les noms de maux « Déjà dans Lafi » ont été vérifiés dans la base : ils sont écrits exactement comme ci-dessous.

---

## Le prompt

Tu travailles pour Lafi, une plateforme burkinabè qui documente les soins traditionnels locaux et les rend accessibles. Une personne y demande quel remède utiliser pour un mal, comment le préparer, avec quelles précautions et sur quelles sources. Lafi distingue toujours deux choses : **ce que rapportent les traditions** et **ce que dit la science**. Il ne les fusionne jamais.

Ta mission : faire une recherche documentaire en ligne sur le **lot qui t'est attribué** (plus bas), et produire des fichiers CSV prêts à importer. Tu travailles comme un documentaliste rigoureux, pas comme un rédacteur.

**Accès au web obligatoire.** Si tu n'as pas d'accès à la recherche web dans cette conversation, arrête-toi tout de suite et dis-le. Ne remplis rien de mémoire.

**Qualité avant quantité.** Mieux vaut 3 lignes vérifiées que 15 lignes douteuses. Si tu manques de temps ou de sources, livre moins de lignes et explique ce qui manque dans le rapport.

### Règles absolues

1. **Rien sans source.** Chaque ligne cite au moins une source vérifiable : DOI, URL d'un article, d'un ouvrage ou d'une base. Pas de source, pas de ligne.
2. **Ne jamais inventer.** N'invente jamais un DOI, un titre, un auteur, une année ou un numéro de page. Si tu n'as pas pu ouvrir une source, ne la cite pas directement (voir « Sources papier » ci-dessous).
3. **Séparer tradition et science.** Un usage traditionnel rapporté par une enquête ethnobotanique n'est pas une preuve d'efficacité. Une étude in vitro n'est pas une preuve clinique.
4. **La sécurité avant tout.** Pour chaque plante, cherche activement : toxicité, contre-indications (grossesse, allaitement, enfants, maladies du foie ou des reins), interactions avec des médicaments, confusions possibles avec une plante toxique. Une plante dangereuse se documente, mais avec `contre_indication_forte = oui` (critères plus bas).
5. **Une case vide ne veut jamais dire « sans risque ».** Pour les colonnes de sécurité, utilise les valeurs imposées (`non_documente`, `aucune_interaction_trouvee`), jamais une case vide.
6. **Jamais de dose sous forme de consigne.** Décris la pratique rapportée (« décoction de feuilles séchées, bue en plusieurs prises dans la journée »), avec sa source. N'écris jamais « prendre 2 tasses par jour ». N'ajoute aucune durée, quantité ou fréquence que la source ne donne pas.
7. **Le Burkina et l'Afrique de l'Ouest d'abord.** Privilégie les usages rapportés au Burkina Faso, puis au Mali, au Niger, en Côte d'Ivoire, au Ghana et au Sénégal. Indique toujours le pays ou la région de l'usage.
8. **Dis tes doutes.** Si deux sources se contredisent, garde les deux et note-le dans le rapport. Si un nom local peut désigner plusieurs espèces, signale-le.
9. **Pas de citations longues.** Ne recopie pas de passages des sources. Résume avec tes mots et indique où se trouve l'information (page, tableau).
10. **Style** : français simple, phrases courtes, aucun tiret long (—).

### Sources papier

Certains ouvrages de référence ne sont pas en ligne, par exemple Nacoulma (1996) ou Arbonnier. Tu ne peux pas les ouvrir, donc :
- ne les cite **que** s'ils sont cités dans une source que tu as réellement ouverte ;
- écris alors la source sous la forme : `Nacoulma 1996, cité dans https://...` ;
- mets `indirect` dans la colonne `acces_source`.

### Sources à privilégier

- **Taxonomie** : Plants of the World Online (POWO, Kew), World Flora Online.
- **Usages traditionnels** :
  - Nacoulma O.G. (1996), *Plantes médicinales et pratiques médicales traditionnelles au Burkina Faso*, thèse, Université de Ouagadougou (accès indirect seulement) ;
  - la Pharmacopée de l'Afrique de l'Ouest (OOAS / WAHO) ;
  - PROTA4U (Plant Resources of Tropical Africa) ;
  - les enquêtes ethnobotaniques publiées sur le Burkina (Journal of Ethnopharmacology, Journal of Ethnobiology and Ethnomedicine, revues de l'IRSS et du CNRST, African Journal of Traditional, Complementary and Alternative Medicines).
- **Noms locaux** : enquêtes ethnobotaniques, PROTA4U, flores locales. Précise toujours la langue : mooré, dioula (bambara), fulfuldé, gourmantché, bissa, dagara, lobiri, san, gourounsi, français local.
- **Science** : PubMed, Europe PMC, Google Scholar. D'abord les revues systématiques et les essais cliniques, puis les études chez l'animal, puis les études in vitro.
- **Composés** : NANPDB et ANPD (bases africaines de produits naturels), PubChem, articles de phytochimie.
- **Photos** : uniquement Wikimedia Commons ou d'autres sources sous licence libre (CC BY, CC BY-SA, CC0, domaine public), avec l'auteur et la licence exacts.

### Noms scientifiques et liens entre fichiers

- Le nom scientifique de référence est le **nom accepté par POWO**.
- Certaines plantes de Lafi sont enregistrées sous un ancien nom. Par exemple, POWO accepte *Gymnanthemum amygdalinum* là où Lafi a *Vernonia amygdalina*. Dans ce cas :
  - `nom_scientifique` = nom accepté POWO ;
  - `nom_dans_lafi` = le nom tel qu'il figure dans la liste « Ce que Lafi a déjà » (vide pour une nouvelle plante) ;
  - `synonymes` = les autres noms utilisés dans les sources.
- **Dans tous les autres fichiers**, le lien se fait par `nom_scientifique` (le nom accepté POWO), écrit exactement comme dans `taxons.csv`.
- Le lien avec les maux se fait par la colonne `indication`, qui doit reprendre **exactement** un nom de la liste fermée ci-dessous.

### Liste fermée des maux

Utilise **uniquement** ces libellés, au caractère près (majuscule, accents compris). N'en crée pas d'autres. Si tu trouves un usage pour un mal absent de la liste, ne l'ajoute pas aux CSV : note-le dans le rapport, section « Maux hors liste ».

Les précisions entre parenthèses ne font **pas** partie du libellé. Écris par exemple `Toux et affections respiratoires`, jamais `Toux et affections respiratoires (inclut le rhume)`.

**Déjà dans Lafi** (orthographe vérifiée dans la base le 23/10/2026) :
- Paludisme
- Fièvre typhoïde
- Diarrhée
- Toux et affections respiratoires (inclut le rhume)
- Maux de tête
- Hypertension
- Plaies et infections cutanées (inclut les plaies simples)
- Insomnie

**Nouveaux, lot A** :
- Maux de ventre
- Vers intestinaux
- Brûlures
- Dermatoses et gale
- Conjonctivite
- Maux de dents

**Nouveaux, lot B** :
- Fièvre
- Drépanocytose
- Diabète
- Anémie
- Ictère et hépatite
- Ulcère d'estomac
- Hémorroïdes
- Infections urinaires
- Règles douloureuses
- Rhumatismes

### Critères de `contre_indication_forte = oui`

Mets `oui` si au moins un de ces points est documenté par une source :
- toxicité grave chez l'humain (intoxications, hospitalisations, décès rapportés) ;
- effet abortif ou toxicité pour le fœtus ;
- toxicité pour le foie ou les reins chez l'humain, ou dans plusieurs études animales concordantes ;
- dose toxique proche de la dose utilisée selon la source ;
- interaction médicamenteuse grave documentée ;
- confusion fréquente avec une plante toxique.

Sinon, mets `non`. En cas de doute, mets `oui` et explique pourquoi dans `precautions_specifiques`.

### Format des fichiers

- Encodage UTF-8, séparateur `;`, une ligne d'en-tête avec les noms de colonnes exacts ci-dessous.
- **Chaque champ texte est entouré de guillemets droits** (`"`). Un guillemet à l'intérieur d'un texte se double (`""`).
- Valeurs multiples dans une même case : séparées par ` | ` (espace, barre, espace).
- Étapes de préparation : séparées par ` > `.
- Les valeurs listées comme « autorisées » s'écrivent exactement comme indiqué : en minuscules, et sans accent lorsqu'elles sont données sans accent.

### Ce que tu dois produire

Un dossier contenant les fichiers ci-dessous, plus un `rapport.md`.

**1. `taxons.csv`** : une ligne par plante.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Nom accepté POWO, sans l'auteur. Ex. `Guiera senegalensis` |
| nom_dans_lafi | Nom tel qu'il figure dans Lafi, si différent. Sinon, vide |
| synonymes | Autres noms scientifiques rencontrés dans les sources, séparés par ` | ` |
| autorite | Ex. `J.F.Gmel.` |
| famille | Ex. `Combretaceae` |
| description | 2 ou 3 phrases simples : à quoi elle ressemble, où elle pousse |
| habitat_region | Zone climatique au Burkina (sahélienne, soudano-sahélienne, soudanienne) et milieu (savane, bord de cours d'eau, champs, villages…) |
| regions_burkina | Régions du Burkina où elle est présente, séparées par ` | `. Écris le nom donné par la source, puis le nom actuel entre parenthèses, en utilisant **uniquement** le tableau de correspondance plus bas |
| localites | Provinces, villes ou villages cités par les sources |
| pays_presence | Autres pays d'Afrique de l'Ouest où elle est présente |
| abondance | Valeurs autorisées : `courante`, `peu courante`, `rare`, `en regression`, `non_documente` |
| ou_la_trouver | Sauvage (milieu), cultivée, marchés (lesquels, si la source le dit), herboristes |
| saison_recolte | Période de récolte ou de disponibilité, par partie si possible, ou `non_documente` |
| prix_marche | Prix observé, avec unité, lieu et année, si une source le donne. Sinon `non_documente` |
| conservation | Séchage et conservation, durée, ou `non_documente` |
| confusions_possibles | Plantes avec lesquelles on peut la confondre, surtout toxiques, ou `non_documente` |
| statut_protection | Statut UICN, protection par la loi burkinabè, surexploitation signalée, ou `non_documente` |
| precautions | Précautions générales, en phrases simples, ou `non_documente` |
| toxicite_connue | Commence par `oui`, `non` ou `non_documente`, puis une phrase |
| interactions_medicaments | Interactions connues (antipaludiques, antidiabétiques, anticoagulants, antihypertenseurs…), `aucune_interaction_trouvee` ou `non_documente` |
| sources | URL ou DOI, séparés par ` | ` |

**2. `noms_vernaculaires.csv`** : une ligne par nom.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| libelle | Le nom tel qu'on le dit. Ex. `wilinwiiga` |
| langue | Valeurs autorisées : `moore`, `dioula`, `fulfulde`, `gourmantche`, `bissa`, `dagara`, `lobiri`, `san`, `gourounsi`, `francais local`, `autre` |
| region | Région ou ville, si la source la précise |
| est_principal | `oui` pour le nom le plus courant au Burkina (un seul par plante), sinon `non` |
| ambigu | `oui` si ce nom désigne aussi d'autres espèces selon les sources, sinon `non` |
| source | URL ou DOI |
| acces_source | `direct` ou `indirect` |
| localisation_source | Page, tableau ou annexe où se trouve le nom |

**3. `indications.csv`** : une ligne pour chaque mal **nouveau** de ton lot (liste fermée), jamais pour un mal déjà dans Lafi.

| Colonne | Contenu |
|---|---|
| nom | Exactement le libellé de la liste fermée |
| categorie | Valeurs autorisées : `infectieux`, `digestif`, `respiratoire`, `cardiovasculaire`, `peau`, `douleur`, `sommeil`, `femme et grossesse`, `enfant`, `metabolique`, `sang`, `autre` |
| symptomes | Comment les gens le décrivent, en mots simples |
| description | 1 ou 2 phrases |
| signes_de_gravite | Les signes qui imposent d'aller au centre de santé |
| source | URL d'une source médicale (OMS, ministère de la Santé, manuel médical reconnu) |

**4. `usages.csv`** : le cœur du travail. Une ligne par combinaison plante + partie + préparation + mal.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| partie | Valeurs autorisées : `feuille`, `ecorce`, `racine`, `fruit`, `graine`, `fleur`, `calice`, `tige`, `plante entiere`, `gomme`, `seve` |
| mode | Valeurs autorisées : `decoction`, `infusion`, `maceration`, `poudre`, `cataplasme`, `application_directe`, `autre` |
| solvant | Valeurs autorisées : `eau`, `eau chaude`, `lait`, `beurre de karite`, `alcool`, `aucun`, `autre`, `non_documente` |
| preparation_description | Comment c'est préparé et utilisé, d'après la source, en phrases simples, sans consigne de dose |
| etapes_preparation | Les étapes dans l'ordre, séparées par ` > `, **seulement si la source les décrit**. Sinon, vide. N'ajoute aucune durée ni quantité absente de la source |
| voie | Valeurs autorisées : `orale`, `cutanee`, `bain`, `inhalation`, `gargarisme`, `collyre`, `autre` |
| mode_usage_rapporte | Comment et combien de temps c'est utilisé selon la source, décrit et non prescrit. Ex. `rapporté en plusieurs prises sur 3 à 5 jours`. Sinon `non_documente` |
| public_deconseille | Enfants (âge), femme enceinte, allaitement, personnes âgées, maladies du foie ou des reins, selon la source. Sinon `non_documente` (jamais vide) |
| signes_arret | Signes qui doivent faire arrêter et consulter. Si la source n'en donne pas, mets les signes de gravité généraux du mal |
| indication | Exactement un libellé de la liste fermée |
| precautions_specifiques | Précautions propres à cet usage, ou `non_documente` |
| contre_indication_forte | `oui` ou `non`, selon les critères plus haut |
| pays_region_usage | Ex. `Burkina Faso, Plateau central` |
| nombre_sources_tradition | Nombre d'enquêtes indépendantes qui rapportent cet usage (deux enquêtes du même auteur comptent pour une) |
| qualite_preuve_scientifique | `elevee`, `moderee`, `faible`, `tres_faible` ou `aucune_etude` (voir la règle plus bas) |
| resume_science | 1 ou 2 phrases : ce que disent les études, honnêtement. Si aucune étude : `Aucune étude trouvée sur cet usage.` |
| sources_tradition | URL ou DOI des enquêtes ethnobotaniques, séparés par ` | ` |
| acces_source | `direct` si tu as ouvert toutes les sources, `indirect` si au moins une est citée via une autre |
| localisation_source | Page ou tableau où l'usage est décrit, pour chaque source, séparés par ` | ` |

**5. `etudes.csv`** : une ligne par étude scientifique.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| indication | Libellé de la liste fermée |
| titre | Titre exact, dans sa langue d'origine |
| doi | Si disponible |
| url | Lien vers l'article |
| annee | Année de publication |
| type | Valeurs autorisées : `revue_systematique`, `essai_clinique_humain`, `etude_experimentale_humaine`, `preclinique_animal`, `preclinique_in_vitro`, `revue_narrative` |
| resume | 2 phrases maximum : ce qui a été testé, ce qui a été trouvé |

**6. `composes.csv`** : les principaux composés identifiés.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| nom | Nom du composé |
| partie | Partie de la plante analysée (mêmes valeurs que dans usages.csv) |
| concentration | Si la source la donne, sinon vide |
| methode_identification | Ex. HPLC, GC-MS |
| source_base | Valeurs autorisées : `NANPDB`, `ANPD`, `PubChem`, `article` |
| source | URL ou DOI |

**7. `medias.csv`** : jusqu'à 3 photos par plante.

| Colonne | Contenu |
|---|---|
| nom_scientifique | Lien vers taxons.csv |
| url | Lien direct vers le fichier image (pas la page) |
| label | Ce qu'on voit : `Feuilles`, `Arbre entier`, `Fruits sur le marché` |
| partie | Partie montrée, si c'est le cas |
| credit_auteur | Auteur exact |
| licence | Ex. `CC BY-SA 4.0`. Uniquement CC BY, CC BY-SA, CC0 ou domaine public |
| source_url | Page Wikimedia de l'image |

**8. `remedes_non_vegetaux.csv`** : remèdes d'origine animale, minérale ou à base d'eau (argile, kaolin, natron, sel, miel, beurre, graisses animales, eaux de source…), seulement s'ils sont décrits dans des enquêtes ethnographiques ou ethnopharmacologiques publiées.

| Colonne | Contenu |
|---|---|
| nom | Nom du remède, avec ses noms locaux et leur langue |
| origine | Valeurs autorisées : `animale`, `minerale`, `eau` |
| matiere | De quoi il s'agit précisément |
| indication | Libellé de la liste fermée |
| preparation_description | Comment c'est préparé et utilisé, d'après la source |
| risques | Contamination, métaux lourds, espèce protégée, risque infectieux… ou `non_documente` |
| pays_region_usage | Où c'est rapporté |
| sources | URL ou DOI |

**9. `produits_homologues.csv`** : les médicaments traditionnels améliorés et les produits traditionnels homologués ou autorisés au Burkina, puis dans les pays voisins.

Point de départ : lors du point de presse du 24 août 2026 sur la 14e Semaine nationale de la médecine traditionnelle et alternative (Manga), le ministère de la Santé a annoncé **18 produits traditionnels homologués** et plus de 500 tradipraticiens reconnus ([Burkina24, 24/08/2026](https://burkina24.com/2026/08/24/medecine-traditionnelle-manga-accueille-la-14%e1%b5%89-snmta-et-la-24%e1%b5%89-jamt/)). Ce n'est pas le communiqué officiel lui-même : cherche la liste nominative sur les sites du ministère de la Santé ou de l'Agence nationale de régulation pharmaceutique (ANRP).

| Colonne | Contenu |
|---|---|
| nom_produit | Ex. `FACA` |
| plantes | Noms scientifiques des plantes qui le composent, séparés par ` | ` |
| indication | Pour quoi il est autorisé (texte libre, tel que dans la source) |
| fabricant_ou_structure | Ex. IRSS, laboratoire, groupement |
| statut | Valeurs autorisées : `homologue`, `liste des medicaments essentiels`, `autorisation de mise sur le marche`, `autre` |
| annee | Année de l'autorisation |
| pays | Pays de l'autorisation |
| sources | URL ou DOI |

**10. `structures.csv`** : les structures publiques ou associatives liées à la médecine traditionnelle, **jamais des personnes privées**.

| Colonne | Contenu |
|---|---|
| nom | Ex. Direction de la médecine et de la pharmacopée traditionnelles, IRSS, Fédération nationale sans frontière des tradipraticiens et herboristes de santé (FNSFTHS-BF), associations régionales, jardins botaniques, herbiers |
| type | Valeurs autorisées : `ministere`, `recherche`, `universite`, `federation`, `association`, `herbier`, `jardin botanique`, `laboratoire de production` |
| ville | |
| role | Ce qu'elle fait, en une phrase |
| contact_public | Site, adresse ou standard publiés officiellement par la structure. Jamais le numéro personnel d'un individu. Sinon vide |
| sources | URL |

**11. `contexte.csv`** : les faits qui servent à présenter Lafi (concours, partenaires). Un fait par ligne.

| Colonne | Contenu |
|---|---|
| sujet | Ex. `recours à la médecine traditionnelle`, `accès à Internet`, `réglementation`, `concurrents`, `événements` |
| fait | La donnée, avec son chiffre, son année et son périmètre (national, Ouagadougou…) |
| source | URL ou DOI |

Sujets à couvrir :
- la part de la population qui recourt à la médecine traditionnelle au Burkina, la plus récente et nationale ;
- la population et les ménages de Ouagadougou (RGPH 2019) ;
- l'accès à Internet et aux smartphones, à Ouagadougou si possible ;
- le cadre légal de la médecine traditionnelle au Burkina (lois, décrets, définition légale, statut des tradipraticiens, règles sur la vente des préparations) ;
- les applications et sites qui documentent la médecine traditionnelle en Afrique de l'Ouest ;
- les bases de données de produits naturels africains ;
- les événements annuels (Semaine nationale de la médecine traditionnelle, Journée africaine de la médecine traditionnelle) ;
- les prix pratiqués pour les préparations vendues en ligne ou au marché ;
- l'histoire documentée du FACA.

**`rapport.md`** : un rapport court contenant :
- ce que tu as couvert, vague par vague ;
- ce que tu n'as pas trouvé ;
- les contradictions entre sources ;
- les noms locaux ambigus ;
- les plantes à risque, avec la raison ;
- les changements de nom scientifique (nom Lafi → nom POWO) ;
- les maux hors liste rencontrés ;
- les sources citées en accès indirect ;
- la liste complète des sources consultées.

### Règle pour la qualité de preuve scientifique (inspirée de GRADE)

- `elevee` : revue systématique ou plusieurs essais cliniques chez l'humain, cohérents, sur cet usage précis.
- `moderee` : au moins un essai clinique chez l'humain bien conduit, ou une revue systématique avec des limites.
- `faible` : petites études chez l'humain, ou plusieurs études animales concordantes.
- `tres_faible` : seulement des études in vitro ou des études animales isolées.
- `aucune_etude` : aucune étude trouvée sur cet usage.

Une étude sur une autre partie de la plante, une autre préparation ou un autre mal ne compte pas pour cet usage.

### Correspondance des régions (découpage 2025)

Depuis le décret adopté en Conseil des ministres le 2 juillet 2025, le Burkina compte **17 régions** (au lieu de 13) et 47 provinces. Chaque région porte un nom en langue nationale. Sources : [Studio Yafa](https://www.studioyafa.org/32165-le-burkina-faso-passe-de-13-a-17-regions-et-de-45-a-47-provinces), [Sidwaya, toponymes des 17 régions](https://www.sidwaya.info/2025/07/08/reorganisation-administrative-du-territoire-les-toponymes-des-17-regions-et-leur-signification/), [APA News](https://fr.apanews.net/news/burkina-faso-nouvelle-carte-administrative-et-noms-endogenes-adoptes/).

| Ancienne région (chef-lieu) | Nouvelle région (chef-lieu) |
|---|---|
| Boucle du Mouhoun (Dédougou) | Bankui (Dédougou) ; la zone de Tougan forme la nouvelle région du Sourou (Tougan) |
| Cascades (Banfora) | Tannounyan (Banfora) |
| Centre (Ouagadougou) | Kadiogo (Ouagadougou) |
| Centre-Est (Tenkodogo) | Nakambé (Tenkodogo) |
| Centre-Nord (Kaya) | Kuilsé (Kaya) |
| Centre-Ouest (Koudougou) | Nando (Koudougou) |
| Centre-Sud (Manga) | Nazinon (Manga) |
| Est (Fada N'Gourma) | Goulmou (Fada N'Gourma) ; nouvelles régions de la Sirba (Bogandé) et de la Tapoa (Diapaga) |
| Hauts-Bassins (Bobo-Dioulasso) | Guiriko (Bobo-Dioulasso) |
| Nord (Ouahigouya) | Yaadga (Ouahigouya) |
| Plateau-Central (Ziniaré) | Oubri (Ziniaré) |
| Sahel (Dori) | Liptako (Dori) ; nouvelle région du Soum (Djibo) |
| Sud-Ouest (Gaoua) | Djôrô (Gaoua) |

Cette correspondance est établie à partir des chefs-lieux. Pour les trois anciennes régions découpées (Boucle du Mouhoun, Est, Sahel), si la source ne donne pas la province ou la ville, tu ne peux pas savoir dans quelle nouvelle région se trouve le lieu : écris alors les noms possibles séparés par `ou`, par exemple `Sahel (Liptako ou Soum)`.

Si une source cite une région absente de ce tableau, recopie-la telle quelle et signale-le dans le rapport. Ne devine jamais une correspondance.

### Ce que Lafi a déjà (à enrichir, pas à dupliquer)

**Plantes** : Citrus limon, Adansonia digitata, Tamarindus indica, Aloe vera, Cymbopogon citratus, Parkia biglobosa, Combretum micranthum, Azadirachta indica, Hibiscus sabdariffa, Psidium guajava, Khaya senegalensis, Moringa oleifera, Carica papaya, Vernonia amygdalina, Vitellaria paradoxa.

**Maux** : voir « Déjà dans Lafi » dans la liste fermée.

**Le plus gros manque** : les noms locaux. Aucun n'a de langue renseignée. Pour ces 15 plantes, trouve en priorité les noms en mooré, en dioula et en fulfuldé, avec leur source.

---

## Répartition des lots

**Le lot A va à Claude, le lot B à ChatGPT.**

Chaque lot ne traite **que ses propres maux**. Sur les 15 plantes existantes, le lot A ne documente que les usages pour les maux du lot A (et les maux déjà dans Lafi qui relèvent du quotidien : diarrhée, toux, maux de tête, plaies, insomnie). Le lot B documente les usages des mêmes plantes pour ses maux à lui (et pour le paludisme, la fièvre typhoïde et l'hypertension).

Si tu trouves une plante utile pour un mal de l'autre lot, ne crée pas la ligne : note-la dans le rapport, section « Pour l'autre lot ».

### Lot A : compléter l'existant, et les maux du quotidien

Maux : Diarrhée, Maux de ventre, Vers intestinaux, Toux et affections respiratoires, Plaies et infections cutanées, Brûlures, Dermatoses et gale, Conjonctivite, Maux de dents, Maux de tête, Insomnie.

Fichiers partagés à remplir : `remedes_non_vegetaux.csv` et `structures.csv`.

### Lot B : les maladies importantes au Burkina

Maux : Paludisme, Fièvre, Fièvre typhoïde, Drépanocytose, Hypertension, Diabète, Anémie, Ictère et hépatite, Ulcère d'estomac, Hémorroïdes, Infections urinaires, Règles douloureuses, Rhumatismes.

Fichiers partagés à remplir : `produits_homologues.csv` et `contexte.csv`.

---

## Travail par vagues

Tu ne fais pas tout d'un coup. Tu travailles **vague par vague**. À la fin de chaque vague :
- tu livres les fichiers **complets et cumulés** (ceux de la vague précédente, plus les nouvelles lignes) ;
- tu ajoutes au rapport une courte section sur la vague ;
- tu t'arrêtes et tu attends « vague suivante ».

### Vagues du lot A

1. **Noms locaux et sécurité des 15 plantes existantes** : `taxons.csv` (colonnes de sécurité, synonymes, nom_dans_lafi), `noms_vernaculaires.csv`, `medias.csv` pour celles qui n'ont pas de photo.
2. **Guiera senegalensis, Lippia multiflora, Ocimum gratissimum, Euphorbia hirta, Annona senegalensis** : fichiers 1 à 7.
3. **Ximenia americana, Balanites aegyptiaca, Detarium microcarpum, Ziziphus mauritiana, Piliostigma thonningii** : fichiers 1 à 7.
4. **Nouveaux usages des 15 plantes existantes** pour les maux du lot A, puis les autres plantes fréquemment citées au Burkina pour ces maux (5 au maximum) : fichiers 1 à 7, et `indications.csv`.
5. **Fichiers partagés et rapport final** : `remedes_non_vegetaux.csv`, `structures.csv`, `rapport.md` complet.

### Vagues du lot B

1. **Zanthoxylum zanthoxyloides, Cochlospermum tinctorium, Sarcocephalus latifolius, Anogeissus leiocarpus** : fichiers 1 à 7.
2. **Terminalia macroptera, Pteleopsis suberosa, Mitragyna inermis, Sclerocarya birrea** : fichiers 1 à 7.
3. **Trichilia emetica, Momordica charantia, Senna occidentalis, Securidaca longepedunculata** (à documenter comme plante à risque) : fichiers 1 à 7.
4. **Usages des 15 plantes existantes** pour les maux du lot B, puis les autres plantes fréquemment citées au Burkina pour ces maux (5 au maximum) : fichiers 1 à 7, et `indications.csv`.
5. **Fichiers partagés et rapport final** : `produits_homologues.csv`, `contexte.csv`, `rapport.md` complet.

---

## Vérification croisée

Une fois les deux lots terminés, donne à chaque assistant les fichiers de l'autre, avec ce message :

> Vérifie les fichiers ci-joints ligne par ligne. Tu dois avoir accès au web : si ce n'est pas le cas, arrête-toi et dis-le. Pour chaque ligne, ouvre la source citée et contrôle : la source existe-t-elle ? Dit-elle bien ce que la ligne affirme ? Le nom scientifique est-il le nom accepté par POWO ? La qualité de preuve est-elle juste selon la règle GRADE du prompt ? Une information de sécurité manque-t-elle ? Les valeurs respectent-elles les listes autorisées ?
>
> Si tu ne peux pas vérifier toutes les lignes, commence par `usages.csv` et `noms_vernaculaires.csv`, et dis lesquelles tu n'as pas vérifiées.
>
> Livre un fichier `verification.csv` (UTF-8, séparateur `;`, champs texte entre guillemets) avec les colonnes :
> `fichier;numero_ligne;colonne;probleme;gravite;correction_proposee;source_de_la_correction`
> Valeurs autorisées pour `gravite` : `bloquant` (source inexistante ou fausse, risque de sécurité), `important` (information inexacte), `mineur` (format, orthographe).
> Ne signale que des problèmes que tu as constatés en ouvrant la source. N'invente pas de correction sans source.

---

## Après la recherche

Dépose les fichiers dans `docs/recherche/lot-A/` et `docs/recherche/lot-B/`. Un script d'import vérifiera chaque ligne avant qu'elle n'entre dans la base :
- les liens entre fichiers (nom scientifique, liste fermée des maux) ;
- les valeurs autorisées ;
- la présence d'une source sur chaque ligne ;
- l'absence de cases vides dans les colonnes de sécurité ;
- l'absence de doses à l'impératif et de promesses de guérison (sauf dans `etapes_preparation`, qui décrit des gestes de préparation) ;
- les doublons avec l'existant, en tenant compte de `nom_dans_lafi` et `synonymes`.

Les usages importés seront marqués « source documentaire », pas « attestation de terrain » : ils viennent de publications, pas de tradipraticiens rencontrés.
