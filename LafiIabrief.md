# Lafi IA — Ce qu'on veut construire et pourquoi

**Destinataire : Claude Code (connaît déjà le code, le design et l'existant)**
**Version 2 — août 2026**

Ce document n'impose ni style, ni palette, ni formulation. Le design system, la charte et les composants existants font foi. Il explique **l'intention, la logique et les mécanismes** des trois pages à construire, pour que l'implémentation s'inscrive dans l'existant.

---

## 1. L'idée centrale — à comprendre avant tout le reste

Tout le produit repose sur une seule décision de modélisation.

**On ne stocke pas des fiches de plantes. On stocke des affirmations vérifiables.**

L'unité élémentaire est le **claim** : un quadruplet

> plante (taxon) + partie utilisée + mode de préparation + indication

Chaque témoignage recueilli n'est pas un document, c'est une **attestation** rattachée à un claim, avec sa source, sa région, sa langue et sa lignée d'apprentissage.

Pourquoi c'est structurant : ça permet de calculer ce que personne d'autre ne calcule, l'**indépendance des sources**. Ce qui compte n'est pas combien de personnes affirment une chose, mais combien de traditions déconnectées l'affirment. Dix guérisseurs formés par le même maître, c'est une source répétée dix fois, pas dix sources. Sans lignée dans le modèle, ce calcul est impossible et tout le reste s'effondre.

Conséquence sur tout le produit : chaque écran doit pouvoir remonter d'une information à qui l'a dite et à ce que la science en dit. On ne sert jamais une réponse nue.

---

## 2. Les trois parcours

Trois intentions distinctes, trois portes d'entrée à rendre évidentes.

| Intention | Point d'entrée | Où ça mène |
|---|---|---|
| Je cherche à me soigner | un symptôme ou un mal | fiche indication → plantes attestées, triées par niveau de preuve |
| J'ai une plante, je veux savoir ce qu'elle traite | un nom de plante, vernaculaire ou scientifique | fiche plante |
| Je veux comprendre pourquoi, ou contribuer | un couple plante × maladie | laboratoire de simulation |

Le chatbot et les comptes existent déjà. Les trois parcours doivent pouvoir basculer vers le chatbot à tout moment, en lui passant le contexte de la page.

---

## 3. Page découverte — recherche et cartes

### Ce qu'on veut
Une grille de cartes de plantes, filtrable, scannable rapidement.

### Ce que porte une carte
- Nom vernaculaire principal, avec sa langue
- Nom scientifique et famille
- Niveau d'attestation (nombre de traditions indépendantes)
- Niveau de convergence scientifique
- Les indications principales

### Ce qu'il ne faut pas reprendre du modèle e-commerce
La grille dense image-en-haut / infos-en-bas est efficace, on la garde. Mais trois éléments doivent disparaître, pour des raisons de fond :

- **Pas de bouton d'action rapide type panier.** Une plante n'est pas un article qu'on ajoute.
- **Pas d'étoiles ni de note d'avis.** La popularité d'un remède n'est pas un signal de validité. L'afficher comme tel sur du contenu santé induit directement en erreur.
- **Pas de mécanique de promotion ou d'urgence.**

À la place du prix — c'est-à-dire à l'endroit où l'œil a appris à chercher le chiffre qui décide — on met le niveau de preuve. C'est le renversement le plus important de la page.

### Filtres
Par mal ou organe, par région d'attestation, par niveau de preuve, par partie utilisée. **Le tri par défaut est le niveau de preuve, jamais la popularité.**

### Résultats vides
Deux règles, dans cet ordre.

**En amont :** on n'expose que des catégories et des filtres qu'on peut remplir. Si la base couvre mal un domaine, ce domaine n'apparaît pas comme une porte d'entrée. L'état vide doit être rare par construction.

**En aval, quand il arrive quand même :** ne jamais laisser croire qu'il n'existe rien. Un utilisateur qui cherche un mal et ne voit rien conclura que le site est cassé, ou pire, qu'aucune plante ne traite ce mal. Donc : proposer des indications voisines, des plantes proches, et une passerelle vers la contribution. Un résultat vide est une redirection, pas un message.

---

## 4. Fiche plante

C'est le composant le plus réutilisé du produit. À construire en premier.

### Bloc identité
Nom vernaculaire principal **et tous les autres noms avec leur langue** (mooré, dioula, fulfulde, français). Ce point est plus important qu'il n'en a l'air : c'est ainsi que les gens cherchent réellement, et l'appariement nom local → espèce est un problème mal résolu partout ailleurs.

Puis le nom scientifique complet avec son autorité, la famille, et la référence du spécimen d'herbier. Cette référence n'est pas décorative : sans dépôt en herbier attesté par un botaniste, la donnée n'a aucune valeur scientifique et n'est pas publiable, quelle que soit la taille de la base.

### Galerie
Plante entière, feuille, écorce ou tige, fleur ou fruit, chaque vue étiquetée. Elle sert à l'identification sur le terrain.

### Ce qu'elle traite
Une ligne par indication, **chacune avec son propre niveau de preuve**. Une plante bien attestée pour un usage peut être douteuse pour un autre — les agréger en un niveau global serait faux. Chaque ligne mène à la simulation de ce couple précis.

### Préparations
C'est le bloc que personne ne fait bien, et c'est le plus différenciant.

Une entrée par préparation attestée : partie utilisée, mode (décoction, infusion, macération, poudre, cataplasme), solvant, durée, température si connue, et les indications associées à **cette** préparation.

Raison de fond : l'écart entre savoir traditionnel et pharmacologie n'est pas « quelle plante », c'est « quelle préparation délivre quelle dose ». Une décoction et une infusion de la même plante n'extraient pas les mêmes composés aux mêmes concentrations. La littérature analyse des extraits standardisés de laboratoire qui n'ont rien à voir avec ce que boit le patient.

Formulation : on documente une pratique observée. Jamais de posologie ni de quantité à l'impératif.

### Qui l'atteste
Nombre d'attestations, nombre de traditions **indépendantes**, régions, langues. Les contributeurs qui acceptent d'être cités le sont nommément. C'est ce bloc qui rend l'attribution réelle plutôt que déclarative.

### Ce que dit la science
Composés identifiés, cibles connues, études avec lien — et explicitement ce qui n'a pas été étudié.

### Précautions
Toujours visible, non repliable. Toxicités, interactions, contre-indications, populations à risque.

### Contribuer
Deux entrées de force égale : ajouter un usage, et **contester une information**. Si contester est plus difficile qu'ajouter, la base ne s'auto-corrige jamais.

---

## 5. Le laboratoire de simulation

C'est la page qui doit produire l'effet. Elle mérite le plus d'effort.

### Le principe
L'utilisateur pose une plante et un mal en entrée. Un pipeline de nœuds s'exécute visiblement, chaque nœud produisant une sortie typée qui alimente le suivant. En sortie : un statut de plausibilité avec sa chaîne complète de justification.

L'effet ne vient pas de l'animation. Il vient de ce que **rien n'est une boîte noire** : chaque nœud s'ouvre et montre sa logique, ses données d'entrée réelles et sa sortie.

### Le pipeline

```
  [ Plante ]                              [ Maladie ]
      │                                        │
      ▼                                        ▼
 ①Résolution taxonomique              ⑦Cartographie pathologie
      │                                        │
      ├──────────────┐                         │
      ▼              ▼                         │
 ②Attestation   ③Profil                        │
   traditionnelle   phytochimique              │
      │              │                         │
      │              ▼                         │
      │         ④Cinétique d'extraction        │
      │              │                         │
      │              ▼                         │
      │         ⑤Filtre ADME                   │
      │              │                         │
      │              ▼                         │
      │         ⑥Cibles moléculaires           │
      │              │                         │
      │              └────────┬────────────────┘
      │                       ▼
      │                 ⑧Convergence réseau
      │                       │
      │        ⑨Littérature   │
      │              │        │
      └──────────────┴────────┤
                              ▼
                       ⑩Agrégation
                              │
                              ▼
                    ⑪Contrôle sécurité
                              │
                              ▼
                   [ Statut + justification ]
```

### Ce que fait chaque nœud

| # | Nœud | Entrée | Sortie | Logique |
|---|---|---|---|---|
| ① | Résolution taxonomique | nom vernaculaire + région | taxon + confiance | Désambiguïsation nom local → espèce. La région est une entrée obligatoire : un même nom désigne des espèces différentes selon les zones. |
| ② | Attestation traditionnelle | taxon + indication | score de corroboration indépendante | Pondération par nombre de lignées, régions et langues **distinctes**, pas par nombre brut de citations. Le nœud le plus original du système. |
| ③ | Profil phytochimique | taxon + partie | composés connus + concentrations typiques | Interrogation des bases de produits naturels. |
| ④ | Cinétique d'extraction | préparation : solvant, température, durée | fraction réellement extraite par composé | Modèle physique à données rares. C'est ici, et seulement ici, que les PINN sont l'outil adapté. |
| ⑤ | Filtre ADME | composés extraits | composés susceptibles d'être actifs | Biodisponibilité orale, drug-likeness, perméabilité, demi-vie. **Nœud obligatoire** : la majorité des composés d'une plante n'atteignent jamais la circulation. Sans ce filtre, tout l'aval produit du bruit. |
| ⑥ | Cibles moléculaires | composés retenus | protéines cibles + affinités | Bases d'interaction composé-cible, docking, QSAR. |
| ⑦ | Cartographie pathologie | maladie | voies biologiques et cibles impliquées | Mapping maladie → pathways. |
| ⑧ | Convergence réseau | cibles composés + cibles maladie | recouvrement mécanistique | Les composés touchent-ils un module cohérent de la voie impliquée ? |
| ⑨ | Littérature | taxon + indication | niveau de preuve publiée | Études existantes, type, qualité. |
| ⑩ | Agrégation | tous les scores amont | statut + incertitude | Pondération explicite et **affichée**. |
| ⑪ | Contrôle sécurité | taxon + préparation | validation ou blocage | Toxicités, interactions, grossesse. Sa sortie prime toujours sur le reste. |

### Deux modes

**Simple**, par défaut : entrée, traversée, sortie. Trois clics maximum.

**Expert** : le graphe complet. Ouvrir un nœud pour voir sa logique, ses entrées réelles, sa sortie brute et ses sources. Désactiver un nœud. Et surtout **changer un paramètre en direct** — passer de décoction à infusion, changer la partie utilisée — et voir le résultat se recalculer.

C'est cette manipulabilité qui produit l'effet, pas l'animation. Quelqu'un qui change la préparation et voit le résultat bouger comprend la thèse du projet en trois secondes. C'est le seul élément non négociable de la page.

### Panneau de sortie
Le statut, la décomposition par nœud, l'incertitude, la liste des justificatifs cliquables, et un export du raisonnement (lien permanent ou PDF) pour qu'une exécution puisse être citée.

---

## 6. La sortie : pourquoi pas un pourcentage

Un pourcentage nu se lit comme une probabilité de guérison. Le moteur ne calcule pas ça : il calcule une plausibilité mécanistique et un niveau d'attestation. Afficher un chiffre unique sur un couple plante-maladie revient à produire une prescription déguisée en science.

Et il ne faut pas inventer un barème maison. GRADE est le standard international d'évaluation de la qualité des preuves, il a déjà été étendu à la médecine traditionnelle chinoise, et les cadres réglementaires distinguent explicitement les preuves d'essais cliniques des preuves d'usage traditionnel prolongé. Aligné sur GRADE, un résultat est lisible par un comité scientifique ou un régulateur. Avec un barème inventé, il n'est interprétable par personne.

**Deux axes indépendants, jamais fusionnés :**

| Axe | Échelle |
|---|---|
| Qualité de la preuve scientifique | Élevée / Modérée / Faible / Très faible (GRADE) |
| Force de l'attestation traditionnelle | Multi-traditions / Convergente / Tradition unique / Isolée / Contredite |

**Et un statut de synthèse dérivé des deux :**

| Statut | Signification |
|---|---|
| Convergent | Attestation multi-traditions, mécanisme plausible, littérature concordante |
| Plausible | Attestation solide, mécanisme cohérent, littérature absente ou faible |
| Attesté seul | Traditions convergentes, aucun élément scientifique disponible |
| Divergent | Traditions ou sources se contredisent — et on montre en quoi |
| Non soutenu | Attestation isolée ou contredite |
| Contre-indiqué | Le nœud sécurité a levé une alerte |

**« Divergent » est une fonctionnalité, pas un échec.** Montrer où les savoirs ne s'accordent pas, c'est exactement ce qui intéresse un chercheur : les désaccords sont les questions de recherche.

Réalisme à intégrer dans l'interface : dans les guides de médecine traditionnelle chinoise, plus de 60 % des recommandations reposent sur un niveau de preuve faible ou très faible. « Attesté seul » et « faible » seront les statuts les plus fréquents. L'interface doit rendre ça normal et lisible, pas dégradé.

---

## 7. Contribution et divulgation graduée

C'est la contrainte qui décidera si la base se remplit.

La littérature sur la médecine traditionnelle africaine identifie partout le même obstacle : beaucoup de tradipraticiens gardent délibérément leur savoir secret, et leur réticence à s'engager avec le monde scientifique est citée comme un frein majeur par les autorités de régulation. Un formulaire tout-ou-rien restera vide.

D'où trois niveaux de divulgation, portés par chaque attestation :

| Niveau | Ce qui est partagé | Ce qui reste privé |
|---|---|---|
| Déclaratif | plante + indication | partie, préparation, dosage |
| Documenté | plante + partie + préparation + indication | tours de main, associations propres |
| Complet | tout, y compris les associations de plantes | — |

Conséquences : le nœud ② doit calculer une corroboration à partir d'attestations de niveaux hétérogènes ; l'entrée en niveau déclaratif doit être très facile et sans engagement ; et un contributeur doit pouvoir **relever** son niveau plus tard. C'est la courbe de confiance qui remplit la base, pas l'ergonomie du formulaire.

### Attribution et partage
Rémunérer le **travail de documentation**, pas la propriété du savoir. Un savoir détenu par quarante personnes n'a pas d'auteur : payer le premier qui le soumet privatise un commun et crée du conflit. Par-dessus, un pourcentage contractuel de tout revenu tiré de la base va à une structure collective, pas à des individus. C'est la logique du Protocole de Nagoya, que le Burkina a ratifié en 2013 et qui vise explicitement les connaissances traditionnelles associées aux ressources génétiques.

---

## 8. Garde-fous

Structurels, pas cosmétiques.

- Mention permanente sur fiches plante et laboratoire : information documentaire, pas avis médical. Non repliable.
- Jamais de dose, quantité ou fréquence à l'impératif.
- Aucun statut affiché sans son incertitude.
- Aucun élément de langage marchand : pas d'achat, pas de promotion, pas d'urgence, pas d'étoiles.
- La sortie du nœud sécurité prime sur tout affichage.
- Consentement et niveau de divulgation visibles sur chaque contribution affichée.

---

## 9. La landing

Son rôle est d'orienter vers les trois parcours et d'expliquer la méthode. Elle assemble des composants construits ailleurs, donc elle vient après eux — construite en premier, elle promet des choses qui n'existent pas et il faut la refaire.

Sections, dans l'ordre :

1. **Entrée directe** — un champ de recherche avec bascule plante / mal, plus quelques raccourcis pour ne laisser personne devant un champ vide.
2. **Les chiffres** — plantes documentées, attestations, traditions couvertes, références croisées. Le minimalisme n'est crédible que payé par des preuves.
3. **Explorer par la plante** — un aperçu de cartes → découverte.
4. **Explorer par le mal** — les catégories effectivement couvertes → indications.
5. **Comment on valide** — le claim, l'indépendance des traditions, le croisement scientifique. C'est la section qui explique ce qui rend le projet différent.
6. **Le laboratoire** — un exemple préchargé qui s'exécute, pour donner envie de cliquer.
7. **Contribuer et être reconnu** — attribution, divulgation graduée, rémunération du travail de documentation.
8. **Ce que Lafi IA ne fait pas** — assumé, pas relégué en pied de page.

---

## 10. Modèle de données

- **Taxon** — nom scientifique, autorité, famille, voucher, herbier
- **NomVernaculaire** — libellé, langue, région → Taxon
- **Partie** — feuille, écorce, racine, fruit, graine
- **Préparation** — mode, solvant, durée, température → Partie
- **Indication** — mal, catégorie, correspondance avec une nomenclature médicale
- **Claim** — (Taxon, Partie, Préparation, Indication) : l'unité atomique
- **Attestation** — → Claim, → Contributeur, date, lieu, langue, méthode de collecte, consentement, niveau de divulgation
- **Contributeur** — identité, statut, → Lignée, préférence d'attribution
- **Lignée** — tradition d'apprentissage ; c'est elle qui porte l'indépendance
- **Composé** — → Taxon, concentration, méthode d'identification
- **Cible** — protéine, → Composé, affinité, source
- **Étude** — DOI, type, → Claim
- **Exécution** — simulation sauvegardée : entrées, sorties par nœud, version des données, horodatage

Trois exigences non négociables :
1. Toute attestation porte une lignée, sinon le nœud ② ne vaut rien.
2. Toute attestation porte un niveau de divulgation.
3. Toute exécution est versionnée : un résultat cité doit être reproductible six mois plus tard.

---

## 11. Ordre de construction

1. Fiche plante, sur 5 à 10 plantes réellement documentées — le composant le plus réutilisé
2. Page découverte : grille, filtres, redirections en cas de vide
3. Laboratoire, mode simple, avec des données préparées sur les mêmes 10 couples
4. Landing, qui assemble ce qui précède
5. Laboratoire, mode expert : ouverture des nœuds, paramètres modifiables, recalcul en direct
6. Parcours de contribution avec divulgation graduée

Il est acceptable qu'en v1 plusieurs nœuds soient des calculs simples sur un jeu de données préparé à la main. Une démo profonde sur dix cas bat une démo creuse sur mille. Seule condition : que l'interface indique clairement quels nœuds sont pleinement calculés et lesquels sont en démonstration.

---

## 12. Références utiles

- **TCMSP** — la plateforme équivalente pour la pharmacopée chinoise : ~500 plantes, ~29 000 composés, ~3 300 cibles, ~840 maladies, avec douze propriétés ADME et génération automatique des réseaux composé-cible et cible-maladie. C'est exactement l'architecture visée, construite en 2014. À utiliser comme spécification de référence.
- **ANPDB / NANPDB** — bases de produits naturels africains, à interroger plutôt qu'à reconstruire.
- **GRADE et GRADE-TCM** — évaluation de la qualité des preuves.
- **Protocole de Nagoya** — base juridique du modèle de partage.
- **SysMEDTRAD** — thèse ouest-africaine : ontologie de la médecine traditionnelle avec langage iconique pour praticiens non lettrés. À réutiliser plutôt qu'à refaire, et référence directe pour l'interface de contribution.

Ce qui est réellement original ici n'est ni le pipeline ni l'IA : c'est le corpus primaire tracé, le calcul d'indépendance des attestations, la modélisation préparation → exposition, et le modèle de partage de valeur. Le reste est un transfert de méthodes matures vers un patrimoine que personne n'a encore structuré.