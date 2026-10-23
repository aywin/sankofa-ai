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
