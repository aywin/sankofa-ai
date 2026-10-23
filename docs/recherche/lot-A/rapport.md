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
