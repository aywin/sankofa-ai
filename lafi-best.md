# Lafi — prompts d'exécution

**Destinataire : Claude Code.** Chaque section ci-dessous est un prompt autonome, à donner **un par un**, dans l'ordre. Une session qui n'a pas cette conversation en mémoire doit pouvoir exécuter chaque prompt seul : le contexte nécessaire est répété à chaque fois.

**Autorisation générale : le schéma de base de données peut être modifié.** Les tables actuelles ne sont pas figées. Si une tâche demande une colonne, une table ou une relation qui n'existe pas, crée-la avec une migration propre plutôt que de contourner par du champ fourre-tout ou du JSON non typé. Signale chaque changement de schéma dans ton rapport de fin de tâche.

Après chaque prompt : `tsc`, `lint`, `build`, puis **capture d'écran réelle dans un navigateur** pour tout ce qui touche à la mise en page. Plusieurs bugs de la version précédente (chevauchement du hero, déséquilibre de grille) n'étaient pas détectables par `curl`/`grep`.

---

## P0 — Contexte commun

*À coller en tête de chaque prompt si la session ne l'a pas déjà.*

Lafi est une plateforme qui documente les savoirs thérapeutiques traditionnels ouest-africains et les croise avec la littérature scientifique. Le problème qu'elle résout : les gens se soignent par les plantes mais n'ont pas accès à ceux qui connaissent les bonnes pratiques — il faut connaître la bonne personne, ville par ville.

Règles permanentes, jamais à lever sans validation explicite de l'utilisateur :
- **Jamais de pourcentage ni de « niveau de guérison » chiffré.** Le moteur calcule une plausibilité mécanistique et un niveau d'attestation, pas une probabilité de guérison.
- **Jamais de posologie, dose ou fréquence à l'impératif.** On documente une pratique observée.
- **Jamais deux axes fusionnés en un mot pour le grand public.** Qualité de la preuve scientifique et force de l'attestation traditionnelle répondent à deux questions différentes.
- **Jamais de fausse identité présentée comme réelle.** Toute personne illustrative doit être visiblement étiquetée comme telle.
- **La sécurité prime toujours** sur tout autre affichage.
- **Pas de vocabulaire technique** (GRADE, ADME, numérotation interne des nœuds) hors du mode expert.

---

## P1 — Schéma : sources, structures, personnes, statut illustratif

### Objectif
Préparer le modèle de données pour que l'attribution humaine puisse exister à l'écran, avec une distinction stricte entre ce qui est réel et ce qui est illustratif.

### Ce qu'il faut faire
1. Créer une table `source_savoir` (ou étendre `contributeur` si c'est plus propre — à toi de trancher, mais documente le choix) avec au minimum :
   - `type` : `structure` | `personne` | `publication`
   - `nom_affichage`
   - `role` : ex. « fédération de tradipraticiens », « tradipraticien de santé », « centre hospitalier »
   - `localisation` : ville ou région
   - `statut_verite` : `reel_verifie` | `illustratif` — **colonne obligatoire, non nullable**
   - `autorisation_obtenue` (booléen) et `autorisation_reference` (texte : date, forme de l'accord, personne signataire) — **obligatoires à `true` / renseignés pour tout enregistrement `reel_verifie` de type `structure` ou `personne`**
   - `reference_url` : source publique vérifiable, obligatoire si `statut_verite = reel_verifie`
   - `photo_url` : nullable ; interdit de remplir pour un enregistrement `illustratif` avec une photo de personne réelle
   - `notice` : texte court affiché sous le nom quand `illustratif`
2. Relier `attestation` à `source_savoir`.
3. Ajouter à `attestation` une colonne `compte_dans_les_scores` (booléen). **Toute attestation rattachée à une source `illustratif` doit avoir cette valeur à `false`.** Contrainte en base, pas seulement en applicatif.
4. Adapter les fonctions de calcul d'attestation pour ignorer les lignes `compte_dans_les_scores = false`.

### Ce qu'il ne faut pas faire
Ne pas permettre qu'une source illustrative influence un score, un compteur public ou un statut. Elle existe pour donner un visage à l'interface, jamais pour appuyer une affirmation de santé.

### Acceptation
- Une attestation illustrative n'augmente aucun score nulle part.
- Il est impossible d'insérer une source `reel_verifie` sans `reference_url`.
- Il est impossible d'insérer une `structure` ou une `personne` en `reel_verifie` sans `autorisation_obtenue = true` et `autorisation_reference` renseignée. La contrainte est en base.
- Le type `publication` est exempté de la contrainte d'autorisation : citer un article publié ne demande l'accord de personne.
- Les compteurs de la landing excluent les données illustratives.

---

## P2 — Vocabulaire public : deux axes, en langage courant et sans surpromesse

### Contexte
`web/lib/synthese.ts` calcule un statut unique à six valeurs affiché par `SyntheseBadge.tsx`. Deux problèmes : le mot ne dit rien à un non-initié, et toutes les cartes de `/decouverte` affichent le même. Un badge que tout le monde porte n'informe personne.

### Ce qu'il faut faire
1. Conserver `computeSyntheseStatus` et `explainSyntheseStatus` — ils restent la logique de référence, réutilisée dans le laboratoire où il y a la place d'expliquer.
2. Ajouter deux fonctions de rendu grand public, affichées comme **deux pastilles séparées**, jamais refusionnées :

**Axe tradition**
| Valeur interne | Texte affiché |
|---|---|
| `multi_traditions` | Très utilisé |
| `convergente` | Utilisé dans plusieurs régions |
| `tradition_unique` | Usage local |
| `contredite` | Avis partagés |
| `non_renseignee` | Pas encore documenté |

**Axe science**
| Valeur interne | Texte affiché |
|---|---|
| `elevee` | Bien étudié |
| `moderee` | Étudié, résultats encourageants |
| `faible` / `tres_faible` | Peu d'études |
| `null` | Pas encore étudié |

**Attention, point important :** ne pas écrire « Confirmé par la science » pour `moderee`. Dans GRADE, « modéré » signifie une confiance modérée dans l'estimation de l'effet, pas une confirmation. Rendre le langage plus simple ne doit jamais rendre l'affirmation plus grosse — c'est la seule règle de ce fichier qui touche à la sécurité de l'utilisateur.

3. Si `contre_indication_forte` est vrai, un signal unique **remplace** les deux pastilles : `Prudence — risque signalé`. Si `divergence_note` est vrai : `Avis partagés — voir le détail`.
4. Cas particulier à traiter explicitement : quand les deux axes sont vides (`non_renseignee` + `null`), ne pas afficher deux pastilles creuses. Afficher une seule mention `Pas encore documenté` et faire descendre la carte en bas du classement.

### Acceptation
- Bissap × Hypertension affiche `Usage local` + `Étudié, résultats encourageants` — les deux faits restent lisibles séparément.
- Aucune page ne montre le même couple de pastilles sur toutes ses cartes.
- Le mot « Plausible » n'apparaît plus hors du laboratoire et du mode expert.

---

## P3 — Sources fictives en attendant les accords, et publications réelles

### Contexte et règle
Aucune organisation ni personne réelle ne doit apparaître comme source sur le site tant que son accord écrit n'a pas été obtenu. Nommer une fédération de tradipraticiens existante comme source d'un usage thérapeutique suggère qu'elle cautionne le contenu — c'est faux tant qu'elle n'a rien signé, et c'est un risque bien plus sérieux qu'un nom inventé. Une URL de presse prouve qu'une organisation existe, pas qu'elle est d'accord.

La ligne à tenir :

| Type de source | Nom réel autorisé ? |
|---|---|
| `publication` (article, thèse, étude) | **Oui, immédiatement.** Citer un travail publié ne demande l'accord de personne — c'est le fonctionnement normal de la recherche. |
| `structure` (fédération, centre, association) | **Non, tant qu'un accord écrit n'est pas au dossier.** |
| `personne` (tradipraticien, praticien nommé) | **Non, tant qu'un consentement documenté n'est pas au dossier.** |

### Ce qu'il faut faire
1. **Seeder les publications réelles** en `statut_verite = reel_verifie`, type `publication`, chacune avec sa référence complète (DOI ou URL, auteurs, année). C'est la seule catégorie qui entre en base avec de vraies identités dès maintenant.
2. **Seeder 2 ou 3 structures fictives** en `statut_verite = illustratif`, type `structure`, avec la notice explicite : *« Structure d'illustration — Lafi travaillera avec des organisations réelles de tradipraticiens ; les partenariats ne sont pas encore établis. »*
3. **Règle de nommage impérative pour les fictions** : les noms inventés ne doivent ressembler à aucune organisation existante. Éviter les formulations du type « Fédération nationale… des tradipraticiens du Burkina Faso », qui se confondront avec des structures réelles. Préférer des noms clairement génériques et visiblement non institutionnels — par exemple un nom de lieu inventé, ou une formulation descriptive du type « Groupement de praticiens du Plateau central (illustration) ».
4. **Créer un registre interne, non publié**, listant les organisations réelles à contacter pour un partenariat : nom, contact, statut de la démarche, date de la dernière relance. Ce registre ne doit **pas** être une table exposée par l'API publique, et ses entrées ne doivent apparaître nulle part sur le site. C'est un outil de travail, pas du contenu.

### Ce qu'il ne faut pas faire
Ne pas rattacher un usage thérapeutique à une organisation ou une personne réelle, même en citant un article de presse qui la mentionne. Ne pas insérer un nom réel « en attendant » avec l'intention de demander l'accord après.

### Acceptation
- Aucun nom d'organisation ou de personne réelle n'apparaît sur le site.
- Les publications citées sont réelles et vérifiables.
- Les noms fictifs ne peuvent être confondus avec des structures existantes.
- Le registre des contacts à démarcher existe et n'est pas exposé publiquement.

---

## P4 — Personnes illustratives, honnêtement étiquetées

### Contexte
Le site ne montre aucun visage. C'est le défaut principal relevé : il parle d'un savoir, jamais de ceux qui le détiennent. La collecte terrain réelle est un chantier à venir, mais l'interface doit exister dès maintenant, avec la place prête.

### Ce qu'il faut faire
1. Créer 4 à 5 sources de type `personne` en `statut_verite = illustratif`, avec une `notice` explicite du type : *« Portrait d'illustration — cette personne représente le type de tradipraticien avec qui Lafi travaillera. La collecte terrain n'a pas encore eu lieu. »*
2. Les rendre **visuellement identifiables au premier regard** comme illustratives : silhouette dessinée ou illustration, jamais une photographie de personne. Un liseré, un fond différent, ou une mention permanente — trouve un traitement qui ne se confond pas avec une vraie fiche.
3. Créer un composant `SourceCard` réutilisable, avec le gabarit :
   ```
   ( avatar )  Nom ou rôle
               Localisation
               [notice si illustratif]
   ```
   qui gère les trois types (structure, personne, publication) et les deux statuts.
4. Il ne doit pas y avoir deux chemins de rendu : le jour où une vraie personne remplace une illustrative, seul le contenu de la ligne change.

### Ce qu'il ne faut pas faire
Aucune photographie de personne réelle pour un enregistrement illustratif, même libre de droits. Aucun nom qui pourrait correspondre à une personne réelle identifiable — utilise des prénoms courants sans nom de famille complet, ou un rôle seul. Même règle qu'en P3 : la fiction ne doit jamais pouvoir être prise pour une personne existante.

### Acceptation
- Un visiteur distingue en moins d'une seconde une source réelle d'une illustration.
- Aucune source illustrative ne fait bouger un chiffre.
- Le même composant sert aux deux cas.

---

## P5 — Page Découverte : photos, attribution, nouveau badge

### Contexte
`/decouverte` est la page la mieux structurée du site (filtres clairs, classement par preuve) mais elle n'affiche aucune photo alors que 12 photos réelles créditées existent en base, et son badge est celui remplacé en P2.

### Ce qu'il faut faire
1. Afficher la photo principale de `taxon_media` sur chaque carte quand elle existe. La photo passe au-dessus du texte dans la carte.
2. Brancher le nouveau double badge de P2.
3. Ajouter une ligne d'attribution **discrète** en bas de carte, via `SourceCard` en variante compacte : avatar petit, une ligne. Sur cette page la mention illustrative doit rester sobre — l'objectif est de montrer qu'il y a quelqu'un derrière, pas de saturer la grille de bandeaux « démonstration ».
4. Ajouter en haut de la page, une seule fois, une bande calme indiquant l'état du corpus : nombre d'usages, et mention que la collecte terrain est en cours.

### Acceptation
- Chaque carte avec photo disponible l'affiche.
- La mention du caractère illustratif apparaît une fois par carte au maximum, en petit, et une fois en tête de page en clair.
- Aucun élément marchand : pas d'étoiles, pas de note, pas de bouton d'ajout rapide.

---

## P6 — Fiche plante : l'attribution devient un vrai bloc

### Ce qu'il faut faire
1. Sur la fiche plante, transformer la section attestation en bloc visuel de plein droit, placé haut, pas en métadonnée grise en bas : `SourceCard` en variante large, une entrée par attestation, avec région et langue.
2. Formuler comme une citation, pas comme une fiche technique. Objectif : que le lecteur comprenne qu'un être humain a transmis ça.
3. Afficher le nombre de traditions **indépendantes** et non le nombre brut d'attestations, avec une phrase courte expliquant la différence.
4. Le bloc « Préparations » reste sans posologie : partie utilisée, mode, solvant, durée, température, formulés au constat.
5. Le bloc précautions reste non repliable.

### Acceptation
- L'attribution est visible sans scroller jusqu'en bas.
- Le compteur affiché est celui des traditions indépendantes, avec son explication.

---

## P7 — Laboratoire : le canvas

### Contexte
L'implémentation actuelle rend une liste verticale de cartes séparées par des flèches, avec des libellés internes (`Entrée: / Sortie:`, `NŒUD ⑩ AGRÉGATION`, `dépend des nœuds ⑥ et ⑦`) et six nœuds sur onze en « non calculé » avec bordures pointillées. C'est une console de debug. À refaire entièrement.

### Ce qu'il faut faire

**Six nœuds, pas onze.** Noms grand public sur le canvas, nom technique uniquement dans le panneau qui s'ouvre au clic.

| Nœud | Nom affiché | Nom technique | Entrée | Sortie |
|---|---|---|---|---|
| 1 | Sélection | Résolution taxonomique | plante + maladie + note libre optionnelle | taxon et indication résolus |
| 2 | Ce que disent les tradipraticiens | Attestation traditionnelle | taxon × indication | force d'attestation + liste des sources |
| 3 | Ce que dit la science | Littérature | taxon × indication | qualité de preuve + études |
| 4 | Ce qui correspond | Croisement | sorties 2 et 3 | les deux axes côte à côte, jamais fusionnés |
| 5 | Analyse | Synthèse | sorties 1 à 4 | voir P8 |
| 6 | Résultat | Sortie | sortie 5 | texte + sélecteur de format |

**La sécurité n'est pas un nœud, c'est un bandeau.** Elle traverse tout le canvas visuellement, de bout en bout, et signifie qu'elle s'applique à chaque étape. Si `contre_indication_forte` est vrai, le bandeau vire à l'alerte et le nœud 6 s'ouvre sur cette alerte avant tout le reste. Ne pas l'enterrer dans le nœud 4 : le fait que le contrôle existe est un signal de confiance, il doit se voir.

**La forme.** Un vrai graphe : nœuds géométriques (cercles, ovales ou carrés arrondis) reliés par des connecteurs tracés, disposés horizontalement — pas une pile de cartes. Deux entrées à gauche, les nœuds de traitement au centre, le résultat à droite.

**L'interaction.** L'utilisateur choisit une plante et une maladie, ajoute une note libre optionnelle, clique « Lancer ». Une impulsion visible parcourt les connecteurs et allume les nœuds un par un jusqu'à la sortie. C'est cette traversée qui produit l'effet, pas la richesse du texte.

**Sur la technologie :** écris le canvas en SVG à la main plutôt que d'ajouter React Flow. React Flow est un éditeur de graphes conçu pour des nœuds déplaçables par l'utilisateur ; ici le graphe est fixe et c'est l'animation de traversée qui compte, ce que du SVG maîtrisé rend plus simple et plus contrôlable. Si tu penses le contraire après évaluation, argumente avant d'ajouter la dépendance.

**Mode expert** : conservé. C'est le seul endroit où apparaissent le nom technique, la numérotation interne, GRADE, les valeurs brutes et les sources. On y ouvre un nœud, on désactive un nœud, on change un paramètre et on voit le résultat se recalculer.

**Les anciens nœuds** (profil phytochimique, cinétique d'extraction, ADME, cibles moléculaires, cartographie pathologie, convergence réseau) sortent du canvas principal. Ne pas supprimer le code : ils reviendront en mode expert quand ils auront de vraies données.

### Acceptation
- Le mode simple n'affiche jamais « non calculé ».
- Aucune bordure en pointillés nulle part.
- Aucun texte visible ne contient de numérotation interne ni de nom technique hors mode expert.
- Le bandeau sécurité est visible en permanence pendant l'exécution.

---

## P8 — Laboratoire : le nœud Analyse

### Contexte
Le nœud 5 lit les sorties structurées des nœuds 1 à 4 et rédige une explication en français courant. C'est le nœud le plus risqué du produit : un modèle qui écrit une conclusion en santé à partir de données rares.

### Ce qu'il faut faire
1. Appel serveur dédié, sur le pattern déjà en place dans `web/app/api/chat/route.ts`. **Vérifie l'identifiant de modèle réellement utilisé en production avant de le propager** — ne recopie pas celui d'un ancien fichier sans confirmation.
2. Le prompt système contraint le modèle à **reformuler**, pas à conclure :
   - il reçoit uniquement les sorties structurées des nœuds 1 à 4 ;
   - il ne peut mentionner aucune plante, aucune indication, aucune étude qui ne figure pas dans ces entrées ;
   - il rédige 3 à 5 phrases pour un particulier sans vocabulaire médical ;
   - il énonce les deux axes séparément et ne les fusionne jamais en un jugement unique ;
   - il rappelle la précaution si `contre_indication_forte` ;
   - aucun pourcentage, aucune consigne de dosage à l'impératif.
3. **Validation de sortie automatique** : avant affichage, vérifier que le texte ne contient ni chiffre suivi de `%`, ni nom d'entité absent des entrées. Si la vérification échoue, ne pas afficher le texte.
4. **Repli déterministe** : si la génération échoue ou est rejetée par la validation, afficher un texte composé à partir des sorties structurées, sans modèle. La page ne doit jamais rester vide ni afficher une erreur brute.
5. **Mise en cache versionnée** : la synthèse est générée une fois par couple plante × maladie, stockée avec la version des données d'entrée, et réutilisée tant que ces données n'ont pas changé. Sans ça, le texte diffère à chaque exécution et le bouton d'export de P9 exporte quelque chose d'irreproductible.

### Ce qu'il ne faut pas faire
Ne pas laisser le modèle produire un indicateur chiffré, même déguisé en « sur 10 » ou en nombre d'étoiles. Le besoin réel — savoir à quel point faire confiance — est satisfait par le texte lui-même.

### Acceptation
- Deux exécutions successives du même couple, données inchangées, produisent exactement le même texte.
- Aucun pourcentage n'apparaît jamais.
- Une panne du modèle produit un texte de repli lisible, pas une erreur.

---

## P9 — Laboratoire : sortie, export, reproductibilité

### Ce qu'il faut faire
1. Nœud 6 : sélecteur de format à trois options — **Texte** actif, **PDF** et **Word** grisés avec la mention « bientôt ». Ne pas construire les exports tant qu'ils ne sont pas demandés.
2. Enregistrer chaque exécution : entrées, sorties par nœud, version des données, horodatage, texte de synthèse mis en cache. Une exécution doit être rejouable à l'identique six mois plus tard.
3. Lien permanent par exécution, pour qu'un résultat puisse être cité.
4. Titres d'études : soit traduits, soit clairement présentés comme titres originaux en italique avec la mention correspondante. Trancher l'un ou l'autre, ne pas laisser des titres anglais bruts sur une interface française.

### Acceptation
- Une exécution rouverte par son lien permanent affiche exactement le même contenu.
- Aucun titre d'étude en anglais sans traitement explicite.

---

## P10 — Landing : corrections de finition

### Ce qu'il faut faire
1. **Corriger le chevauchement du hero.** Les étiquettes du graphe animé passent par-dessus le titre et le paragraphe — « Paludisme » et « Fièvre typhoïde » se lisent en travers de la phrase principale. Corriger la superposition, puis **vérifier par capture d'écran réelle**, pas par inspection du HTML.
2. **Réduire les flèches.** Le `→` apparaît après presque chaque lien. Le réserver à la progression dans le laboratoire. Ailleurs, un lien est un lien.
3. **Rééquilibrer la grille** de la section à trois entrées : la tuile « Le laboratoire » est aux deux tiers vide pendant que la colonne de droite déborde. La remplir avec un aperçu du canvas refait en P7, ou revoir les proportions.
4. **Refaire « Ce que Lafi ne fait pas ».** Les cinq croix rouges — seul rouge du site — transforment un gage de crédibilité en mur d'avertissement. Traitement calme : tiret ou coche neutre, pas de rouge. Le fond reste, assumé et non relégué en pied de page.
5. **Reformuler le titre depuis le problème de l'utilisateur.** L'actuel — « On documente le savoir des tradipraticiens » — décrit le processus interne de la plateforme. L'utilisateur, lui, ne sait pas qui demander. Proposer 2 ou 3 directions et **demander validation avant de figer**.
6. **Les chiffres.** « 15 » en gros serif attire l'œil sur ce qui est encore petit. Proposer deux options à l'utilisateur : retirer le compteur, ou déplacer l'attention vers ce qui est réellement solide (les couples enrichis de vraies données scientifiques). Ne pas trancher seul.

### Acceptation
- Capture d'écran fournie montrant le hero lisible.
- Plus aucune flèche hors du laboratoire.
- Aucun rouge sur la section des limites.

---

## P11 — Lafi Academy

### Contexte
Academy n'est pas un module annexe. C'est le seul canal par lequel l'objectif d'auto-soin tient sans jamais prescrire : interdiction de recommander un traitement, autorisation pleine d'enseigner comment les choses fonctionnent. Le second parcours a en plus un effet direct sur la qualité de la base — un contributeur formé dépose des attestations exploitables.

### Ce qu'il faut faire
1. Modèle de données : `parcours` (public visé, titre, description, ordre), `module` (→ parcours, titre, contenu, durée estimée, ordre), et si la progression utilisateur est souhaitée, `progression` (→ utilisateur, → module, statut). Migration propre.
2. Deux parcours, seedés avec au moins trois modules chacun :

**Grand public — comprendre avant d'utiliser**
- Reconnaître les plantes courantes et éviter les confusions dangereuses
- Ce que change la préparation : décoction, infusion, macération
- Nutrition et plantes alimentaires de la région
- Interactions avec les médicaments, grossesse, enfants
- Les signes qui imposent d'aller au centre de santé

**Praticiens et étudiants — documenter un savoir pour qu'il compte**
- Identification botanique et dépôt d'un spécimen en herbier
- Décrire une préparation de façon reproductible
- Consentement, attribution et partage des bénéfices
- Lire un résultat du laboratoire et ses limites
- Notions de pharmacologie utiles au dialogue avec les soignants

3. Page `/academy` : les deux parcours côte à côte, chacun avec ses modules listés. Entrée dans la nav.
4. Section dédiée sur la landing, entre Contribuer et Ce que Lafi ne fait pas.
5. Depuis une fiche plante, lien vers le module pertinent quand il existe — typiquement le module sur les préparations depuis le bloc préparations.

### Ce qu'il ne faut pas faire
Aucun contenu de module ne doit contenir de dose, de fréquence ou de recommandation de traitement. On enseigne des mécanismes et des méthodes, pas des remèdes.

### Acceptation
- Les deux parcours existent en base et s'affichent.
- Aucun contenu prescriptif dans les modules seedés.
- Academy est atteignable depuis la nav et depuis la landing.

---

## P12 — Polish transverse

### Ce qu'il faut faire
1. **Registre unique.** Le site vouvoie mais le modal de contribution tutoie, et le chat tutoie déjà par persona. Choisir le tutoiement partout, cohérent avec la voix de Lafi déjà établie, et corriger les endroits en vouvoiement.
2. **Reformuler « Signale-le »**, qui sonne comme une dénonciation. Esprit de partage : « Raconte-le à Lafi », « Partage-le avec Lafi ».
3. **Supprimer toutes les bordures en pointillés** du produit. Elles font maquette inachevée.
4. **Passer en revue les états vides.** Aucun résultat vide ne doit se lire comme « il n'existe rien » : proposer des indications voisines et une passerelle vers la contribution. Et ne pas exposer en filtre ou en catégorie ce qui n'a pas de contenu — l'état vide doit être rare par construction.

### Acceptation
- Un seul registre sur tout le site.
- Zéro bordure pointillée.
- Aucun cul-de-sac dans les résultats de recherche.

---

## Ce qui reste ouvert et attend l'utilisateur

À ne pas trancher seul : le nouveau titre du hero (P10.5), le sort des compteurs de la landing (P10.6), et le traitement des titres d'études (P9.4). Proposer, demander, puis figer.