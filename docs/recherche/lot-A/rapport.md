# Rapport de recherche documentaire Lafi, lot A

## Vague 1 : noms locaux et sécurité des 15 plantes existantes (23/10/2026)

### Ce qui est couvert

- `taxons.csv` : 15 lignes. Nom accepté, synonymes, autorité, famille, colonnes de sécurité (toxicité, interactions, précautions, confusions) pour les 15 plantes de Lafi.
- `noms_vernaculaires.csv` : 56 noms pour 14 plantes sur 15. Mooré pour 12 plantes, dioula pour 13, gourounsi (lyele, nuni) pour 12, plus gourmantché et dagara pour le caïlcédrat.
- `medias.csv` : 1 seule photo (néré). Voir « Ce qui manque ».

Sources principales des noms locaux :
- Nicolas J.-P. (2019), *Recueil de fiches ethnobotaniques des principales plantes médicinales employées au Burkina Faso et en Afrique de l'Ouest*, Jardins du Monde, ISBN 978-2-9543726-4-8. Enquêtes dans le Sanguié et le Boulkiemdé. Donne mooré, lyele et dioula, avec une fiche toxicité par plante. Source ouverte en entier.
- SEDELAN (Koudougou), *Pharmacopée traditionnelle : 59 recettes*. Donne mooré, lyele et nuni.
- Sama et al. (2022), *Medicines* 9(2):10, tableau 2. Noms dioula à Dédougou et Nouna.
- Base PRELUDE (Société française d'ethnopharmacologie), fiche *Khaya senegalensis*.

### Ce qui manque

1. **Le fulfuldé.** Aucun nom fulfuldé burkinabè trouvé dans une source ouverte. Seul « kahi » (caïlcédrat) est documenté, mais au Bénin et en Guinée.
2. **Une source clé est à récupérer.** Le *Guide des plantes médicinales autorisées au Burkina Faso* (Ministère de la Santé, ANRP, 1re édition, avril 2020) donne les noms mooré, dioula **et fulfuldé**, avec les indications et les contre-indications. Le lien anrp.info est mort (domaine à vendre). Je ne l'ai donc pas cité. **Action conseillée : demander le PDF à l'ANRP ou à la DMPT.** Il comblerait le manque fulfuldé d'un coup.
3. **Vernonia amygdalina (Gymnanthemum amygdalinum)** : aucun nom local burkinabè trouvé.
4. **Citrus × limon** : un seul nom (dioula « Lemuru »). Le recueil Nicolas décrit le citron vert, pas le citron.
5. **Photos.** Les pages Wikimedia Commons ne s'ouvrent pas depuis mon outil. La seule photo livrée (soumbala, Marco Schmidt, CC BY-SA 2.5) a été vérifiée via une copie de la page Commons (biologie-seite.de). Le lien `Special:FilePath` est la redirection standard de Commons vers le fichier. Les photos de la base *African Plants* (Senckenberg) sont sous CC BY-NC-SA, donc exclues par la règle Lafi. Je ne sais pas non plus quelles plantes ont déjà une photo dans Lafi : merci de me le dire.
6. **Toxicité non trouvée** : *Parkia biglobosa*, *Khaya senegalensis*, *Citrus × limon*. Pour *Combretum micranthum*, une étude de toxicité animale burkinabè (Ouedraogo et al. 2025) existe, à lire en vague 4.
7. **Abondance, saison de récolte, prix, conservation** : presque tout est `non_documente`.
8. **Noms POWO non ouverts directement** pour 9 espèces (Adansonia, Tamarindus, Aloe, Cymbopogon, Combretum, Azadirachta, Psidium, Moringa, Carica). Leurs noms et autorités viennent de Nicolas 2019 et de PlantUse. Ils sont d'usage courant, mais restent à confirmer lors de la vérification croisée.

### Contradictions entre sources

- *Aloe vera* : Nicolas (2019) écrit l'autorité « L. » et la famille Xanthorrhoeaceae. PlantUse donne « (L.) Burm.f. » et Asphodelaceae. J'ai retenu PlantUse.
- *Hibiscus sabdariffa* : Nicolas (2019) dit la plante sans toxicité. Une revue (Hashmi et al. 2020) signale des effets sur le foie à très fortes doses chez l'animal. Les deux sont gardés.
- Orthographes différentes d'un même nom entre sources : toεεgá / Tuega / Twega (baobab), rã́ndàgà / Randga (kinkéliba), arzεn tί / Arzan-tiiga (moringa), guɔ / Gwo. Gardées toutes les deux.

### Noms locaux ambigus

- **« kinkéliba »** : en français, c'est *Combretum micranthum*. Mais en mooré et en lyele, **kĩnkεlibà désigne *Senna occidentalis*** (faux kinkéliba), une plante **abortive** par voie interne (Nicolas 2019, p. 51). Risque de confusion grave. À afficher clairement dans Lafi.
- **« nasar shimi » / « nasar chimi »** (lyele) : désigne le neem chez Nicolas (p. 13) et le moringa chez Nicolas (p. 40) et chez SEDELAN. Le neem est toxique par voie orale, le moringa non.
- **« kuka »** : caïlcédrat en mooré, mais baobab en haoussa.
- **« wεgda »** (bissap, mooré) est proche de « Wedga » (*Landolphia senegalensis*, SEDELAN) et de « wεdεgà nyegá » (*Saba senegalensis*, Nicolas). Noms différents mais faciles à confondre à l'oral.
- **« vernonia » / « koá safàn »** : désigne *Vernonia colorata* au Burkina selon Nicolas (p. 54), pas *Vernonia amygdalina*. **Question pour l'équipe : quelle espèce Lafi a-t-elle vraiment documentée ?**
- **« citron »** : au Burkina, souvent le citron vert (*Citrus aurantifolia*), pas *Citrus × limon*. Même question.

### Plantes à risque

- **Azadirachta indica (neem)** : l'huile des graines avalée a causé des intoxications graves et des décès chez l'enfant. Usage interne déconseillé aux enfants, femmes enceintes et personnes âgées.
- **Aloe vera** : latex laxatif puissant, hépatites aiguës rapportées après prise orale, contractions utérines. Usage externe du gel bien toléré.
- **Carica papaya** : latex et fruit vert provoquent des contractions de l'utérus. Interaction possible avec la warfarine et les cardiotoniques.
- **Hibiscus sabdariffa** : peut réduire l'absorption de la chloroquine. Important au Burkina, où le bissap est très bu.
- **Tamarindus indica** : augmente l'absorption de l'aspirine et de l'ibuprofène.
- **Moringa oleifera** : interactions possibles avec antidiabétiques et lévothyroxine.

### Changements de nom scientifique (nom Lafi → nom POWO)

- Vernonia amygdalina → *Gymnanthemum amygdalinum* (Delile) Sch.Bip.
- Citrus limon → *Citrus × limon* (L.) Osbeck. Attention : le nom contient le signe « × ». Le script d'import doit l'accepter, ou bien Lafi choisit d'écrire « Citrus x limon ».

### Maux hors liste rencontrés

Aucun usage n'a été saisi dans cette vague. Rencontrés en passant : constipation, gastrites, zona, herpès, asthme, coqueluche, hernie, bilharziose, otite.

### Pour l'autre lot (B)

Le recueil Nicolas (2019) documente des usages pour le paludisme (neem, kinkéliba), l'hypertension (bissap, moringa, papaye mûre), les infections urinaires (bissap, kinkéliba, citronnelle), le diabète (goyavier), l'ictère (tamarinier, papayer) et les rhumatismes (karité, bissap). Source : https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf

### Sources citées en accès indirect

- Tamboura H.H. et al. 1998 (Passoré), cité dans PRELUDE.
- Kerharo J. et Bouquet A. 1950, *Plantes médicinales et toxiques de la Côte-d'Ivoire - Haute-Volta*, cité dans PRELUDE.
- Assogba M.N. 1984 et Keita S.M. et al. 1999, cités dans PRELUDE.
- Mahmoud B.M. et al. 1994 (chloroquine et boisson au citron), cité dans TRAMIL.
- Mustapha A. et al. 1996 et Garba M. et al. 2003 (tamarin et anti-inflammatoires), cités dans TRAMIL et HelloPharmacist.
- Ouedraogo A.S. 1995 (densité du néré), cité dans peopleandplants.org.

### Liste des sources consultées (vague 1)

Noms locaux et usages :
- https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf
- https://www.abcburkina.net/fr/le-burkina-faso/pharmacopee-traditionnelle
- https://doi.org/10.3390/medicines9020010
- https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=3504
- https://bmcvetres.biomedcentral.com/articles/10.1186/1746-6148-7-36/tables/1

Taxonomie :
- https://powo.science.kew.org/taxon/578867-1 (Khaya senegalensis)
- https://powo.science.kew.org/taxon/941491-1 (Parkia biglobosa)
- https://powo.science.kew.org/taxon/326388-2 (Hibiscus sabdariffa)
- https://powo.science.kew.org/taxon/790034-1 et https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77168715-1 (Vitellaria paradoxa)
- https://powo.science.kew.org/taxon/210886-1 (Gymnanthemum amygdalinum)
- https://powo.science.kew.org/taxon/771956-1 (synonymie Citrus × limon)
- https://species.wikimedia.org/wiki/Citrus_%C3%97_limon
- https://uses.plantnet-project.org/en/Aloe_vera

Sécurité :
- https://www.nccih.nih.gov/health/aloevera
- https://ncbi.nlm.nih.gov/books/NBK548634/pdf/Bookshelf_NBK548634.pdf
- https://pmc.ncbi.nlm.nih.gov/articles/PMC3841499/
- https://www.mskcc.org/cancer-care/integrative-medicine/herbs/neem
- https://doi.org/10.5114/fmpcr.2020.98253
- https://drugs.com/npp/hibiscus.html
- https://www.rxlist.com/hibiscus/supplements.htm
- https://pubmed.ncbi.nlm.nih.gov/21480802/
- https://www.rxlist.com/supplements/moringa.htm
- https://li01.tci-thaijo.org/index.php/JBAP/article/view/36683
- https://www.cambridge.org/core/journals/british-journal-of-nutrition/article/papaya-carica-papaya-consumption-is-unsafe-in-pregnancy-fact-or-fable-scientific-evaluation-of-a-common-belief-in-some-parts-of-asia-using-a-rat-model/D07C5CC7993552C35D68A5AB770C19EF
- https://journals.library.ualberta.ca/jpps/index.php/JPPS/article/download/21715/16889/55775
- https://tramil.net/fr/plant/tamarindus-indica
- https://hellopharmacist.com/drug-herbal-interactions/tamarind-with-aspirin
- https://hellopharmacist.com/drug-herbal-interactions/tamarind-with-ibuprofen-oxycodone
- https://doi.org/10.18596/jotcsa.1247620
- https://ajol.info/index.php/jpb/article/view/155496
- https://tjnpr.org/index.php/home/article/view/1412
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12329593/

Répartition et protection :
- https://www.peopleandplants.org/nere
- https://africanplants.senckenberg.de/item/19932
- https://africanplants.senckenberg.de/item/19375

Photo :
- https://commons.wikimedia.org/wiki/File:Parkia_biglobosa_Soumbala.JPG (vérifiée via https://www.biologie-seite.de/Biologie/Datei:Parkia_biglobosa_Soumbala.JPG)

Source repérée mais non ouverte (non citée) :
- Guide des plantes médicinales autorisées au Burkina Faso, ANRP, 2020 (lien anrp.info hors ligne).

## Vague 2 : Guiera senegalensis, Lippia multiflora, Ocimum gratissimum, Euphorbia hirta, Annona senegalensis (23/10/2026)

### Ce qui est couvert

- `taxons.csv` : 5 plantes ajoutées (20 au total). Les 5 noms sont acceptés par POWO, sauf Lippia multiflora (non vérifié, voir plus bas).
- `noms_vernaculaires.csv` : 22 noms ajoutés (78 au total).
- `usages.csv` : 12 usages, tous pour des maux du lot A.
- `etudes.csv` : 3 études. `composes.csv` : 5 composés.
- `indications.csv` : en-tête seulement. Comme prévu par le prompt, les fiches des maux nouveaux (Maux de ventre, Brûlures, etc.) seront remplies en vague 4.
- `medias.csv` : rien de nouveau.

### Ce qui manque

1. **Ocimum gratissimum** : aucun nom burkinabè, aucun usage burkinabè trouvé. Les seuls usages ouest-africains trouvés (Côte d'Ivoire : yeux, maux de tête, gale) ne donnent pas la partie de la plante utilisée. Je n'ai donc pas créé de ligne d'usage. POWO ne cite pas le Burkina dans son aire indigène.
2. **Lippia multiflora** : aucun nom local trouvé. Les usages viennent de Côte d'Ivoire. L'étude burkinabè (Hema et al. 2023) cite des usages en introduction (toux, diarrhée, maux de tête, conjonctivite) sans dire d'où ils viennent : non repris. Le nom accepté POWO n'a pas pu être vérifié (recherche POWO et JSTOR inaccessibles).
3. **Accès bloqué à PubMed Central** (captcha) pendant cette vague. Plusieurs revues utiles n'ont pas pu être lues : revue sur Ocimum gratissimum (PMC8642617), revue sur Euphorbia hirta (PMC3249903), étude de sécurité sur l'écorce de racine d'Annona senegalensis (PMC8437626). À reprendre en vérification croisée.
4. **Études sans titre exact** : TRAMIL cite un essai clinique sur l'acné avec l'huile essentielle d'Ocimum gratissimum (Orafidiya et al. 2002, 126 jeunes) et une étude antidiarrhéique chez l'animal (Offiah et Chikwendu 1999). Je n'ai pas leur titre exact, donc pas de ligne dans `etudes.csv`.
5. **Photos** : Wikimedia Commons toujours inaccessible depuis mon outil.

### Règle GRADE appliquée strictement

Pour Guiera (diarrhée), l'étude chez le rat utilise un extrait au méthanol, pas une décoction dans l'eau. Pour Euphorbia (diarrhée), l'étude utilise la plante entière, alors que la tradition utilise la tige feuillée. Selon la règle du prompt, ces études ne comptent pas pour l'usage : `qualite_preuve_scientifique = aucune_etude`, avec l'étude mentionnée dans `resume_science`. La vérification croisée peut assouplir ce choix si l'équipe le juge trop strict.

### Contradictions et erreurs dans les sources

- **Nicolas 2019, p. 31** : la description botanique de Guiera senegalensis est la copie exacte de celle de Lippia chevalieri (p. 35), qui parle de feuilles aromatiques et d'épis blancs. Elle n'a pas été reprise.
- **Hema et al. 2023** : la partie distillée de Lippia multiflora est décrite tantôt comme « feuilles fraîches », tantôt comme « sommités ». J'ai noté `feuille` dans `composes.csv` ; à confirmer.
- **Euphorbia hirta** : Nicolas (2019) la dit non toxique aux doses thérapeutiques ; Wu et al. (2024) signalent une toxicité de l'extrait brut dans des études plus anciennes, sans détail. Les deux sont gardés.
- **Ocimum gratissimum** : chez la souris, une décoction aqueuse n'est pas toxique jusqu'à 5 g/kg, alors qu'un extrait hydroalcoolique montre des atteintes du foie et des reins (Guerra et al. 2002, cité dans TRAMIL). La préparation compte.

### Noms locaux ambigus

- **Lippia multiflora et Lippia chevalieri** : deux espèces du même genre. Au Burkina, Nicolas (2019) décrit Lippia chevalieri (mooré wιsaó). Les deux sont souvent appelées « thé de savane ». Risque de mélange des données.
- **Ocimum gratissimum et Ocimum americanum** : deux basilics. Le basilic documenté au Burkina par Nicolas (2019) est Ocimum americanum.
- **« Dmekolo »** (Euphorbia hirta, nuni) ressemble à « Damekolo » (nom nuni du mille-pattes, SEDELAN recette n° 39). Pas de confusion d'espèce végétale, mais à noter.

### Plantes à risque

- **Annona senegalensis** : nécrose du foie chez le rat après 28 jours d'extrait d'écorce de tige (Adisa et al. 2019). L'usage documenté ici (brûlures) est cutané.
- **Ocimum gratissimum** : toxicité hépatique et rénale chez la souris pour un extrait hydroalcoolique ; TRAMIL déconseille grossesse, allaitement et enfants de moins de 5 ans.
- **Euphorbia hirta et Guiera senegalensis** : usages chez le nourrisson rapportés par la tradition (coliques, diarrhée), sans donnée de sécurité. Signalé dans `precautions_specifiques`. `contre_indication_forte` reste à `non` car aucun critère n'est documenté.

### Changements de nom scientifique

Aucun pour ces 5 plantes (tous acceptés par POWO, Lippia multiflora non vérifié).

### Maux hors liste rencontrés

Dysenterie (classée sous Diarrhée dans les usages), vomissements, otite, gingivites et affections buccales (Guiera, Euphorbia), asthme, règles douloureuses (Euphorbia, pour le lot B), paludisme (Guiera, Lippia, pour le lot B), constipation, hémorroïdes (Lippia), varicelle et myiase (Ocimum).

### Pour l'autre lot (B)

- Guiera senegalensis : paludisme (Nicolas 2019, p. 31).
- Euphorbia hirta : règles douloureuses (Nicolas 2019, p. 30).
- Lippia multiflora : paludisme, hypertension, hémorroïdes, ulcère (N'Guessan et Yao-Kouamé 2010, p. 1750).
- Ocimum gratissimum : ictère avec urines rouges (Bouquet et Debray 1974, cité dans PRELUDE).

### Sources citées en accès indirect (vague 2)

- Bouquet A. et Debray M. 1974, *Plantes médicinales de la Côte d'Ivoire*, cité dans PRELUDE.
- Saadou M. 1993, *Les plantes médicinales du Niger*, cité dans PRELUDE.
- Guerra et al. 2002 (toxicité d'Ocimum gratissimum), cité dans TRAMIL.

### Sources consultées (vague 2)

- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:20011770-1 (Guiera senegalensis)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:72309-1 (Annona senegalensis)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:452969-1 (Ocimum gratissimum)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:101651-2 (Euphorbia hirta)
- https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf
- https://www.abcburkina.net/fr/le-burkina-faso/pharmacopee-traditionnelle
- https://doi.org/10.3390/medicines9020010
- https://www.m.elewa.org/JABS/2010/29/2.pdf
- https://revuesciences-techniquesburkina.org/index.php/sciences_naturelles_et_appliquee/article/download/1255/1033
- https://ajer.scione.com/cms/abstract.php?id=228
- https://www.em-consulte.com/article/83068/figures/proprietes-psychopharmacologiques-de-l-extrait-bru
- https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=4208
- https://tramil.net/en/plant/ocimum-gratissimum
- https://www.informaticsjournals.com/index.php/jnr/article/view/197
- https://www.frontiersin.org/articles/10.3389/fvets.2024.1451615/full
- https://koreascience.or.kr/article/JAKO201911562301100.pdf (Adisa et al. 2019, DOI 10.5487/TR.2019.35.1.013)
- https://www.phytojournal.com/archives/2016.v5.i2.833/annona-senegalensis-persoon-annonaceae-a-review-of-its-ethnomedicinal-uses-biological-activities-and-phytocompounds

## Vague 3 : Ximenia americana, Balanites aegyptiaca, Detarium microcarpum, Ziziphus mauritiana, Piliostigma thonningii (23/10/2026)

### Ce qui est couvert

- `taxons.csv` : 5 plantes ajoutées (25 au total). Les 5 noms sont acceptés par POWO, et le Burkina figure dans l'aire indigène des 5.
- `noms_vernaculaires.csv` : 26 noms ajoutés (104 au total), dont les deux premiers noms **fulfuldé** de cette vague (Ziziphus : « diabe » au Sénégal, « djâbhi » au Niger) et un nom **lobiri** (Ximenia, Côte d'Ivoire).
- `usages.csv` : 9 usages ajoutés (21 au total).
- `composes.csv` : 6 composés ajoutés (11 au total).
- `etudes.csv` : aucune étude ajoutée. Aucune étude trouvée ne porte sur un usage du lot A de ces plantes.

### Ce qui manque

1. **Ximenia americana** : aucun usage précis pour les maux du lot A. L'article de Soro et al. (2009) cite des usages généraux en Afrique (toux, yeux, maux de dents, diarrhée), sans pays ni préparation. Non repris. L'usage burkinabè trouvé (bilharziose, SEDELAN recette n° 9) est hors liste.
2. **Ziziphus mauritiana** : un seul nom burkinabè (mooré « mugunuga », Passoré). Tous les usages sont en accès indirect via PRELUDE.
3. **Descriptions botaniques** : absentes pour Ximenia, Detarium, Ziziphus et Piliostigma (aucune fiche descriptive ouverte).
4. **Detarium microcarpum** : usages contre la diarrhée (Mali, Niger) et les maux de tête (Mali) cités par Habibou et al. (2022), mais sans préparation précise : non repris.
5. **Piliostigma thonningii** : usage contre la diarrhée au Bénin (Ahomadegbe et al. 2018), mais la préparation traditionnelle n'est pas décrite : non repris. L'usage « plaies » de Sama et al. (2022, Boucle du Mouhoun) mélange plusieurs parties et préparations : non repris.
6. **Balanites aegyptiaca** : Nicolas (2019, p. 14) recommande la pulpe du fruit contre les vers intestinaux, mais c'est une recommandation de l'association, pas un usage traditionnel rapporté. Non repris en usage.

### Contradictions entre sources

- **Famille de Balanites aegyptiaca** : Balanitaceae chez Nicolas (2019), Zygophyllaceae chez POWO. J'ai retenu POWO.
- **Ximenia americana, toxicité** : Agyigra et al. (2017) écrivent « rats » dans le résumé et « souris » dans la conclusion pour le test aigu.
- **Piliostigma thonningii, test sur artémies** : la discussion d'Ahomadegbe et al. (2018) donne des CL50 inférieures à 0,1 mg/ml, alors que le tableau 3 donne 1,73 et 4,29 mg/ml. Le tableau a été retenu.
- **Orthographes SEDELAN** : Kagedga et Kagadga, Dankolo et Dankola (Detarium) selon les recettes.

### Noms locaux ambigus

- **Piliostigma thonningii** apparaît sous son synonyme *Bauhinia thonningii* chez Sama et al. (2022). Le script d'import doit rapprocher les deux noms grâce à la colonne `synonymes`.
- **Detarium microcarpum et Detarium senegalense** : espèce voisine dont certaines formes ont des fruits toxiques (Cavin 2007, cité dans Habibou et al. 2022). À afficher dans Lafi.
- **« tomboron »** désigne Ziziphus mauritiana en socé et en diola (Sénégal).

### Plantes à risque

- **Balanites aegyptiaca** : la décoction d'écorce est utilisée comme abortif en Afrique de l'Ouest (Iwu 1993, cité dans Murthy et al. 2021). L'usage documenté ici (lavage des plaies avec les feuilles) est externe, donc `contre_indication_forte = non`.
- **Ximenia americana** : lésions des reins, des poumons et de la rate chez le rat après 28 jours d'extrait d'écorce à forte dose.
- **Detarium microcarpum** : confusion possible avec les formes toxiques de D. senegalense.

### Changements de nom scientifique

Aucun pour ces 5 plantes.

### Maux hors liste rencontrés

Bilharziose (Ximenia), manque de vitamine C (Detarium), urétrite (Ziziphus), furoncles (Ziziphus), méningite, tuberculose et morsures de serpent (Detarium).

### Pour l'autre lot (B)

- Detarium microcarpum : paludisme, rhumatismes (Habibou et al. 2022, tableau 2).
- Ximenia americana : rhumatismes, fièvre (Soro et al. 2009, usages généraux africains).
- Ziziphus mauritiana : urétrite et usage diurétique (Niger, Adjanohoun et al. 1980, cité dans PRELUDE).

### Sources citées en accès indirect (vague 3)

- Adama 1997 et Kouyaté et Lamien 2011, cités dans Habibou et al. 2022.
- Fernandez de la Pradilla 1981 à 1988, Tamboura et al. 1998, Kerharo et Adam 1964, Thomas 1972, Boury 1962, Adam, Echard et Lescot 1972, Adjanohoun et al. 1980, cités dans PRELUDE (fiche Ziziphus mauritiana).
- Iwu 1993, cité dans Murthy et al. 2021.
- Cavin 2007 et Anhwange et al. 2004, cités dans Habibou et al. 2022.

### Sources consultées (vague 3)

- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:316341-2 (Ximenia americana)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:813589-1 (Balanites aegyptiaca)
- https://powo.science.kew.org/taxon/492282-1 (Detarium microcarpum)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:719349-1 (Ziziphus mauritiana)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:514346-1 (Piliostigma thonningii)
- https://www.abcburkina.net/fr/le-burkina-faso/pharmacopee-traditionnelle
- https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf
- https://doi.org/10.3390/medicines9020010
- https://doi.org/10.1016/j.crvi.2008.08.022 (Soro et al. 2009)
- https://doaj.org/article/bd889f85b6ea4b7f89db8941086e95d2 (Agyigra et al. 2017)
- https://doi.org/10.3390/plants10010032 (Murthy et al. 2021)
- https://www.phytojournal.com/archives/2022/vol11issue2/PartA/11-1-68-241.pdf (Habibou et al. 2022)
- https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=6355
- https://www.phytojournal.com/archives/2018/vol7issue2/PartAP/7-2-316-293.pdf (Ahomadegbe et al. 2018)

## Vague 4 : usages lot A des 15 plantes existantes, 5 plantes en plus, fiches des maux (23/10/2026)

### Ce qui est couvert

- `usages.csv` : 47 usages ajoutés (68 au total).
  - 30 pour 11 des 15 plantes existantes : baobab, aloès, neem, papayer, kinkéliba, citronnelle, bissap, moringa, goyavier, karité, caïlcédrat.
  - 17 pour les 5 plantes ajoutées.
- **5 plantes ajoutées** (30 au total). Critère : plantes citées pour les maux du lot A à la fois par Nicolas (2019) et par SEDELAN, ou par l'une d'elles avec plusieurs recettes :
  - *Diospyros mespiliformis* (7 recettes SEDELAN, plus Nicolas p. 28) ;
  - *Cantinoa americana* (anciennement *Hyptis spicigera*) ;
  - *Mitracarpus hirtus* (anciennement *M. scaber*) ;
  - *Lannea microcarpa* ;
  - *Senegalia macrostachya* (anciennement *Acacia macrostachya*), seule plante trouvée pour les maux de dents.
- `noms_vernaculaires.csv` : 19 noms ajoutés (123 au total).
- `indications.csv` : les 6 maux nouveaux du lot A. Sources : fiches de l'OMS (brûlures, gale, géohelminthiases, santé bucco-dentaire) et Manuels MSD grand public (douleur abdominale, conjonctivite).
- `etudes.csv` : 1 revue systématique ajoutée (aloès et brûlures). C'est la seule ligne d'usage avec une preuve `moderee`.

### Répartition des 68 usages par mal

Plaies 16, Diarrhée 13, Dermatoses et gale 9, Maux de ventre 7, Toux 6, Brûlures 5, Maux de tête 4, Vers intestinaux 4, Conjonctivite 2, Insomnie 1, Maux de dents 1.

### Ce qui manque

1. **Sans usage du lot A trouvé** : *Citrus × limon*, *Tamarindus indica*, *Parkia biglobosa*, *Gymnanthemum amygdalinum*. Les usages trouvés pour ces plantes relèvent du lot B (foie, constipation) ou sont hors liste (zona).
2. **Maux peu couverts** : Maux de dents (1 usage), Insomnie (1), Conjonctivite (2).
3. **Goyavier et diarrhée** : des essais chez l'humain existent, mais PubMed était bloqué. La ligne porte `aucune_etude`, avec une note. **À corriger en vérification croisée.**
4. **Revue sur l'aloès** : je l'ai lue via Epistemonikos (traduction automatique de l'allemand). Le DOI n'a pas pu être relevé.
5. **Préparation non précisée** pour deux usages du baobab (feuilles) et un usage du papayer (graines). Le mode est noté `autre` et le solvant `non_documente`.

### Choix de sécurité à valider par l'équipe

- **Brûlures** : l'OMS conseille de refroidir à l'eau courante et de ne mettre ni pâte ni huile sur une brûlure. Plusieurs recettes traditionnelles font l'inverse (beurre de karité et Annona, lait et Lannea, cataplasmes). Ce conseil de l'OMS est ajouté dans `precautions_specifiques` de toutes les lignes « Brûlures », y compris celle de la vague 2. `contre_indication_forte` reste à `non`, car aucun critère du prompt n'est rempli.
- **Collyres faits à la maison** (Diospyros, Cantinoa) : `contre_indication_forte = oui` par prudence. Risque d'infection ou de lésion de l'œil, aucune donnée de sécurité. C'est la règle « en cas de doute, mettre oui ».
- **Neem par voie orale** (maux de ventre, diarrhée) : `oui`. Toxicité de l'huile chez l'enfant, usage abortif des feuilles et de l'huile rapporté.
- **Graines de papaye** (vers) : `oui`. Effet abortif d'un extrait de graines à forte dose chez l'animal.

### Changements de nom scientifique (nom des sources → nom POWO)

- *Hyptis spicigera* → *Cantinoa americana*. Attention : certaines flores ouest-africaines (Bénin) gardent encore *Hyptis spicigera*.
- *Mitracarpus scaber* → *Mitracarpus hirtus*, espèce introduite d'Amérique selon POWO.
- *Acacia macrostachya* → *Senegalia macrostachya*.

### Contradictions et noms ambigus

- **Mitracarpus hirtus** : Nicolas (2019, p. 38) la dit abondante en Afrique de l'Ouest ; POWO la classe comme introduite. Les deux sont compatibles (plante naturalisée).
- **Orthographes** : gã́akà (Nicolas) et Gâka (SEDELAN) pour *Diospyros*.

### Maux hors liste rencontrés

Asthme (rangé dans « Toux et affections respiratoires »), otite, hémorragies, gingivites, aphtes, poux, foie et jaunisse, constipation, zona.

### Pour l'autre lot (B)

- Neem : paludisme, ulcère gastrique (Nicolas 2019, p. 13).
- Papayer : jaunisse, hypertension (Nicolas 2019, p. 19).
- Kinkéliba : paludisme, foie (Nicolas 2019, p. 24 ; SEDELAN, recettes n° 30 et 42).
- Citronnelle : fièvre, rhumatismes (Nicolas 2019, p. 27).
- Caïlcédrat : paludisme (Ahua et al. 2007, cité dans PRELUDE).

### Sources citées en accès indirect (vague 4)

- Kerharo et Bouquet 1950, Kerharo et Adam 1964, Ahua et al. 2007, cités dans PRELUDE (fiche Khaya senegalensis).

### Sources consultées (vague 4)

- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:322702-1 (Diospyros mespiliformis)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:448409-1 (Hyptis spicigera, synonyme de Cantinoa americana)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:756228-1 (Mitracarpus hirtus)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:69788-1 (Lannea microcarpa)
- https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77131614-1 (Senegalia macrostachya)
- https://www.epistemonikos.org/de/documents/47e054b2548226b6bbeae0432c2aeca250400ae9 (revue systématique aloès et brûlures)
- https://www.who.int/fr/news-room/fact-sheets/detail/burns
- https://www.who.int/fr/news-room/fact-sheets/detail/scabies
- https://www.who.int/fr/news-room/fact-sheets/detail/soil-transmitted-helminth-infections
- https://www.who.int/fr/news-room/fact-sheets/detail/oral-health
- https://www.msdmanuals.com/fr/accueil/troubles-digestifs/urgences-gastro-intestinales/douleur-abdominale-aigu%C3%AB
- https://www.msdmanuals.com/fr/accueil/troubles-oculaires/maladies-de-la-conjonctive-et-de-la-scl%C3%A8re/conjonctivite-infectieuse
- Sources déjà listées : recueil Nicolas 2019, SEDELAN, Sama et al. 2022, PRELUDE (Khaya senegalensis), Natural Medicines (neem, papaye).

## Vague 5 : remèdes non végétaux, structures et synthèse finale (23/10/2026)

### Ce qui est couvert

- `structures.csv` : 9 structures, toutes au Burkina.
  - 1 ministere : Direction de la médecine traditionnelle et alternative (Ministère de la Santé).
  - 1 recherche : IRSS (CNRST), laboratoire de phytomédicaments LR-D/PM.
  - 1 universite : LABIOCA, Université Joseph Ki-Zerbo.
  - 1 herbier : herbier du Laboratoire de biologie et écologie végétales, Université Joseph Ki-Zerbo.
  - 1 federation : FENATRAB.
  - 1 laboratoire de production : Phytofla (Koutoura, Niangoloko).
  - 2 association : Jardins du Monde Burkina Faso, SEDELAN.
  - 1 jardin botanique : jardin pédagogique de Kassou (Koudougou).
- `contact_public` n'est rempli que si la structure publie elle-même ses coordonnées (IRSS, Jardins du Monde, SEDELAN) ou si une adresse postale institutionnelle figure dans un article (LABIOCA). Aucun nom de personne, aucun numéro personnel, aucune adresse e-mail d'auteur.
- `remedes_non_vegetaux.csv` : 2 remèdes seulement, tous deux du **Cameroun** (Nnomo et al. 2009).
  - Argile rouge et miel contre les brûlures (origine minerale).
  - Jaune d'œuf et miel contre les éruptions cutanées (origine animale, rangé sous Dermatoses et gale).

### Ce qui manque

1. **Aucun remède non végétal burkinabè dans la liste fermée.** Les deux remèdes non végétaux trouvés au Burkina (SEDELAN) soignent des maux hors liste : mille-pattes calciné mêlé au beurre de karité contre l'herpès, levure de dolo contre les furoncles. Ils ne sont pas dans le fichier. La levure de dolo pourrait aller sous « Plaies et infections cutanées », mais c'est un champignon : elle n'entre dans aucune des valeurs `animale`, `minerale` ou `eau`. **Question pour l'équipe : faut-il ajouter une valeur `autre` ?**
2. **Les deux lignes viennent d'Afrique centrale.** Je les ai gardées car ce sont les seules trouvées dans une enquête publiée et ouverte. L'équipe peut les retirer si Lafi veut rester en Afrique de l'Ouest.
3. **Remède à l'eau** (`origine = eau`) : aucun trouvé dans une enquête publiée.
4. **Structures sans contact public** : Direction de la médecine traditionnelle, FENATRAB, Phytofla, herbier. Je n'ai trouvé aucune page officielle avec leurs coordonnées.
5. **Centre de médecine traditionnelle et des soins intégrés de Ouagadougou** : annoncé par l'OMS Afrique, sans date d'ouverture confirmée. Non saisi. Source : [OMS Afrique](https://www.afro.who.int/fr/news/concertation-nationale-sur-la-medecine-traditionnelle-au-burkina-faso).

### Plantes et remèdes à risque (vague 5)

- **Argile et miel sur une brûlure** : va à l'encontre du conseil de l'OMS (refroidir à l'eau, ne rien appliquer). La source dit « sans effet secondaire », sans preuve. La contamination de l'argile n'est pas étudiée.
- **Miel** : le prompt n'a pas de colonne âge pour ce fichier. Je n'ai pas ajouté la mise en garde classique sur le miel chez le nourrisson, faute d'une source lue dans cette vague. **À ajouter en vérification croisée avec une source officielle.**

### Maux hors liste rencontrés

Herpès (mille-pattes, SEDELAN), furoncles (levure de dolo, SEDELAN).

### Sources consultées (vague 5)

- [Nnomo et al. 2009, Ethnopharmacologia n° 44 (PDF)](https://www.ethnopharmacologia.org/prelude2020/pdf/biblio-hn-28-nnomo.pdf), p. 60 et 61.
- [OMS, aide-mémoire sur les brûlures](https://www.who.int/fr/news-room/fact-sheets/detail/burns)
- [APA News, 18 médicaments traditionnels homologués](https://fr.apanews.net/health/burkina-18-medicaments-traditionnels-homologues/)
- [IRSS, annonce du cours d'ethnopharmacologie (PDF, CAMES)](https://www.lecames.org/wp-content/uploads/2022/10/Annonce-Cours-ethnopharmacologie_IRSS.pdf)
- [Sidwaya, visite du ministre à Phytofla](https://www.sidwaya.info/souverainete-sanitaire-du-burkina-faso-dr-kargougou-au-laboratoire-phytofla-et-a-la-distillerie-de-la-sn-sosuco/)
- [Tibiri et al. 2020, Frontiers in Pharmacology (affiliations FENATRAB)](https://www.frontiersin.org/articles/10.3389/fphar.2020.563751/full)
- [Sama et al. 2022, Medicines (herbier et LABIOCA)](https://doi.org/10.3390/medicines9020010)
- [Jardins du Monde, recueil Burkina Faso (PDF)](https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf)
- [BurkinaDoc, recettes de plantes médicinales](https://www.burkinadoc.milecole.org/agriculture-durable/article-plantes_medicinales_recettes_burkina-faso_togo_benin/)
- [SEDELAN, pharmacopée traditionnelle](https://www.abcburkina.net/fr/le-burkina-faso/pharmacopee-traditionnelle)
- [OMS Afrique, concertation nationale sur la médecine traditionnelle](https://www.afro.who.int/fr/news/concertation-nationale-sur-la-medecine-traditionnelle-au-burkina-faso)

## Synthèse finale du lot A

### Totaux livrés

| Fichier | Lignes |
|---|---|
| taxons.csv | 30 |
| noms_vernaculaires.csv | 123 |
| usages.csv | 68 |
| etudes.csv | 4 |
| composes.csv | 11 |
| indications.csv | 6 |
| medias.csv | 1 |
| remedes_non_vegetaux.csv | 2 |
| structures.csv | 9 |

### Couverture vague par vague

- **Vague 1** : noms locaux et sécurité des 15 plantes déjà dans Lafi.
- **Vague 2** : 5 plantes ajoutées (Guiera, Lippia multiflora, Ocimum gratissimum, Euphorbia hirta, Annona senegalensis).
- **Vague 3** : 5 plantes ajoutées (Ximenia, Balanites, Detarium, Ziziphus, Piliostigma).
- **Vague 4** : 47 usages du lot A, 5 plantes ajoutées, fiches des 6 maux nouveaux.
- **Vague 5** : remèdes non végétaux, structures, ce rapport.

### Ce qui n'a pas été trouvé (le plus important)

1. **Noms fulfuldé burkinabè** : seulement 3 noms, et pas au Burkina.
2. **Usages du lot A** pour Citrus × limon, Tamarindus indica, Parkia biglobosa, Gymnanthemum amygdalinum, Ocimum gratissimum, Ximenia americana.
3. **Maux peu couverts** : Maux de dents (1 usage), Insomnie (1), Conjonctivite (2).
4. **Preuves scientifiques sur l'usage exact** : une seule ligne `moderee` (aloès et brûlures). Toutes les autres sont `aucune_etude` selon la règle GRADE stricte.
5. **Photos libres** : 1 seule, Wikimedia Commons étant inaccessible depuis mon outil.
6. **Abondance, saison, prix, conservation** : presque tout est `non_documente`.

### Sources clés à récupérer

- **Guide des plantes médicinales autorisées au Burkina Faso** (Ministère de la Santé, ANRP, 2020) : noms mooré, dioula et fulfuldé, indications, contre-indications. Le site anrp.info est hors ligne. À demander à l'ANRP ou à la Direction de la médecine traditionnelle.
- **Pharmacopée des plantes médicinales de l'Afrique de l'Ouest** (OOAS) : PDF signalé sur le site de l'OOAS, non lu dans ce lot. [Lien](https://www.wahooas.org/web-ooas/sites/default/files/2025-05/la-pharmacopee-des-plantes-medicinales-de-lafrique-de-louestok.pdf)
- **Nacoulma (1996)** et **Arbonnier** : utilisés seulement en accès indirect.

### Contradictions à trancher (rappel)

- Famille de l'aloès (Xanthorrhoeaceae ou Asphodelaceae) et de Balanites (Balanitaceae ou Zygophyllaceae) : POWO retenu.
- Toxicité du bissap et d'Euphorbia hirta : sources opposées, les deux gardées.
- Nicolas 2019, p. 31 : description de Guiera copiée sur celle de Lippia chevalieri. Non reprise.
- Ahomadegbe et al. 2018 : CL50 différentes entre la discussion et le tableau. Tableau retenu.

### Noms ambigus à afficher dans Lafi (rappel)

- **kinkéliba / kĩnkεlibà** : Combretum micranthum en français, mais **Senna occidentalis (abortive)** en mooré et en lyele.
- **nasar shimi** : neem (toxique par voie orale) ou moringa selon la source.
- **kuka** : caïlcédrat en mooré, baobab en haoussa.
- **vernonia** et **citron** : l'espèce documentée par Lafi est à confirmer (Vernonia colorata ? citron vert ?).
- **Lippia multiflora / L. chevalieri**, **Ocimum gratissimum / O. americanum**, **Detarium microcarpum / D. senegalense** : espèces voisines faciles à confondre.

### Plantes à risque (rappel)

Neem (huile toxique chez l'enfant, usage abortif), aloès (latex, foie), papayer (latex et graines, utérus), bissap (chloroquine), tamarinier (aspirine, ibuprofène), moringa (antidiabétiques, lévothyroxine), Annona senegalensis (foie, chez le rat), Ocimum gratissimum (foie et reins, chez la souris), Balanites (écorce abortive), Ximenia (reins, chez le rat), Detarium (confusion avec une espèce toxique). Les collyres faits maison, le neem par voie orale et les graines de papaye ont `contre_indication_forte = oui`.

### Changements de nom POWO (rappel)

- Vernonia amygdalina → Gymnanthemum amygdalinum
- Citrus limon → Citrus × limon (attention au signe ×)
- Hyptis spicigera → Cantinoa americana
- Mitracarpus scaber → Mitracarpus hirtus
- Acacia macrostachya → Senegalia macrostachya
- Bauhinia thonningii = Piliostigma thonningii (synonyme)
- Lippia multiflora : statut POWO non vérifié.

### Maux hors liste rencontrés (toutes vagues)

Constipation, gastrite, ulcère, zona, herpès, asthme (rangé sous Toux), coqueluche, hernie, bilharziose, otite, dysenterie (rangée sous Diarrhée), vomissements, gingivites, aphtes, poux, règles douloureuses, paludisme, foie et jaunisse, hémorroïdes, varicelle, myiase, urétrite, furoncles, hémorragies, méningite, tuberculose, morsures de serpent, manque de vitamine C, hypertension, fièvre, rhumatismes.

### Sources indirectes (rappel)

Nacoulma (1996), Arbonnier, Iwu (1993), Cavin (2007), Guerra et al. (2002), Ahua et al. (2007) et les travaux repris par PRELUDE : tous cités sous la forme « X, cité dans URL », avec `acces_source = indirect`.

### Points pour la vérification croisée

1. Goyavier et diarrhée : chercher les essais chez l'humain (PubMed bloqué pendant ce lot).
2. Revues PMC non lues : PMC8642617, PMC3249903, PMC8437626.
3. Statut POWO de Lippia multiflora et des 9 noms non ouverts directement.
4. DOI de la revue sur l'aloès (lue via Epistemonikos).
5. Mise en garde sur le miel chez le nourrisson (remèdes non végétaux).
6. Photos libres pour les 29 plantes sans photo.
7. Règle GRADE : l'équipe peut juger trop stricte l'exclusion des études sur extraits.

### Liste complète des sources (toutes vagues, 88 liens)

Liste tirée automatiquement de tous les fichiers CSV et de ce rapport.

- <https://africanplants.senckenberg.de/item/19375>
- <https://africanplants.senckenberg.de/item/19932>
- <https://ajer.scione.com/cms/abstract.php?id=228>
- <https://ajol.info/index.php/jpb/article/view/155496>
- <https://bmcvetres.biomedcentral.com/articles/10.1186/1746-6148-7-36/tables/1>
- <https://commons.wikimedia.org/wiki/File:Parkia_biglobosa_Soumbala.JPG>
- <https://commons.wikimedia.org/wiki/Special:FilePath/Parkia_biglobosa_Soumbala.JPG>
- <https://doaj.org/article/bd889f85b6ea4b7f89db8941086e95d2>
- <https://doi.org/10.1016/j.crvi.2008.08.022>
- <https://doi.org/10.18311/jnr/2007/197>
- <https://doi.org/10.18596/jotcsa.1247620>
- <https://doi.org/10.3389/fvets.2024.1451615>
- <https://doi.org/10.3390/medicines9020010>
- <https://doi.org/10.3390/plants10010032>
- <https://doi.org/10.5114/fmpcr.2020.98253>
- <https://doi.org/10.5487/TR.2019.35.1.013>
- <https://drugs.com/npp/hibiscus.html>
- <https://fr.apanews.net/health/burkina-18-medicaments-traditionnels-homologues/>
- <https://hellopharmacist.com/drug-herbal-interactions/tamarind-with-aspirin>
- <https://hellopharmacist.com/drug-herbal-interactions/tamarind-with-ibuprofen-oxycodone>
- <https://journals.library.ualberta.ca/jpps/index.php/JPPS/article/download/21715/16889/55775>
- <https://koreascience.or.kr/article/JAKO201911562301100.pdf>
- <https://li01.tci-thaijo.org/index.php/JBAP/article/view/36683>
- <https://ncbi.nlm.nih.gov/books/NBK548634/pdf/Bookshelf_NBK548634.pdf>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC3841499/>
- <https://powo.science.kew.org/taxon/210886-1>
- <https://powo.science.kew.org/taxon/326388-2>
- <https://powo.science.kew.org/taxon/492282-1>
- <https://powo.science.kew.org/taxon/578867-1>
- <https://powo.science.kew.org/taxon/771956-1>
- <https://powo.science.kew.org/taxon/790034-1>
- <https://powo.science.kew.org/taxon/941491-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:101651-2>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:20011770-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:316341-2>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:322702-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:448409-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:452969-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:514346-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:69788-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:719349-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:72309-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:756228-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77131614-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77168715-1>
- <https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:813589-1>
- <https://pubmed.ncbi.nlm.nih.gov/17499928/>
- <https://pubmed.ncbi.nlm.nih.gov/21480802/>
- <https://revuesciences-techniquesburkina.org/index.php/sciences_naturelles_et_appliquee/article/download/1255/1033>
- <https://species.wikimedia.org/wiki/Citrus_%C3%97_limon>
- <https://tjnpr.org/index.php/home/article/view/1412>
- <https://tramil.net/en/plant/ocimum-gratissimum>
- <https://tramil.net/fr/plant/tamarindus-indica>
- <https://uses.plantnet-project.org/en/Aloe_vera>
- <https://www.abcburkina.net/fr/le-burkina-faso/pharmacopee-traditionnelle>
- <https://www.afro.who.int/fr/news/concertation-nationale-sur-la-medecine-traditionnelle-au-burkina-faso>
- <https://www.biologie-seite.de/Biologie/Datei:Parkia_biglobosa_Soumbala.JPG>
- <https://www.burkinadoc.milecole.org/agriculture-durable/article-plantes_medicinales_recettes_burkina-faso_togo_benin/>
- <https://www.cambridge.org/core/journals/british-journal-of-nutrition/article/papaya-carica-papaya-consumption-is-unsafe-in-pregnancy-fact-or-fable-scientific-evaluation-of-a-common-belief-in-some-parts-of-asia-using-a-rat-model/D07C5CC7993552C35D68A5AB770C19EF>
- <https://www.em-consulte.com/article/83068/figures/proprietes-psychopharmacologiques-de-l-extrait-bru>
- <https://www.epistemonikos.org/de/documents/47e054b2548226b6bbeae0432c2aeca250400ae9>
- <https://www.ethnopharmacologia.org/prelude2020/pdf/biblio-hn-28-nnomo.pdf>
- <https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=3504>
- <https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=4208>
- <https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=6355>
- <https://www.frontiersin.org/articles/10.3389/fphar.2020.563751/full>
- <https://www.frontiersin.org/articles/10.3389/fvets.2024.1451615/full>
- <https://www.informaticsjournals.com/index.php/jnr/article/view/197>
- <https://www.jardinsdumonde.org/wp-content/uploads/2026/05/Recueil-Plantes_BurkinaFaso.pdf>
- <https://www.lecames.org/wp-content/uploads/2022/10/Annonce-Cours-ethnopharmacologie_IRSS.pdf>
- <https://www.m.elewa.org/JABS/2010/29/2.pdf>
- <https://www.msdmanuals.com/fr/accueil/troubles-digestifs/urgences-gastro-intestinales/douleur-abdominale-aigu%C3%AB>
- <https://www.msdmanuals.com/fr/accueil/troubles-oculaires/maladies-de-la-conjonctive-et-de-la-scl%C3%A8re/conjonctivite-infectieuse>
- <https://www.mskcc.org/cancer-care/integrative-medicine/herbs/neem>
- <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12329593/>
- <https://www.nccih.nih.gov/health/aloevera>
- <https://www.peopleandplants.org/nere>
- <https://www.phytojournal.com/archives/2016.v5.i2.833/annona-senegalensis-persoon-annonaceae-a-review-of-its-ethnomedicinal-uses-biological-activities-and-phytocompounds>
- <https://www.phytojournal.com/archives/2018/vol7issue2/PartAP/7-2-316-293.pdf>
- <https://www.phytojournal.com/archives/2022/vol11issue2/PartA/11-1-68-241.pdf>
- <https://www.rxlist.com/hibiscus/supplements.htm>
- <https://www.rxlist.com/supplements/moringa.htm>
- <https://www.sidwaya.info/souverainete-sanitaire-du-burkina-faso-dr-kargougou-au-laboratoire-phytofla-et-a-la-distillerie-de-la-sn-sosuco/>
- <https://www.wahooas.org/web-ooas/sites/default/files/2025-05/la-pharmacopee-des-plantes-medicinales-de-lafrique-de-louestok.pdf>
- <https://www.who.int/fr/news-room/fact-sheets/detail/burns>
- <https://www.who.int/fr/news-room/fact-sheets/detail/oral-health>
- <https://www.who.int/fr/news-room/fact-sheets/detail/scabies>
- <https://www.who.int/fr/news-room/fact-sheets/detail/soil-transmitted-helminth-infections>
