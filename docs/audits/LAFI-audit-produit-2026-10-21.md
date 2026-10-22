# Lafi AI — audit produit et préparation à un pilote réel

Date : 21 octobre 2026. Périmètre : dépôt local et site public `sankofa-ai-eight.vercel.app`.

## Avis de départ

Lafi possède une base utile : des usages structurés par plante, partie, préparation et indication ; une distinction entre tradition et science ; des sources ; un formulaire de contribution ; un espace expérimental. Il reste toutefois un prototype documentaire dont le fonctionnement IA est instable pendant cet audit. Une ouverture à des utilisateurs cherchant quoi prendre demanderait d'abord de fiabiliser les réponses, leur périmètre et les preuves qu'elles présentent.

La direction proposée : **rendre les pratiques traditionnelles compréhensibles, attribuées et vérifiables, puis aider à formuler des questions de recherche testables**. La valeur de Lafi vient de la qualité de ces liens et de la participation des détenteurs du savoir.

## Ce qui a réellement été vérifié

- Lecture des routes Next.js, des composants, des fonctions de synthèse et des migrations SQL. Le schéma local ne prouve pas à lui seul que chaque migration a été appliquée en production.
- Requêtes HTTPS sur les pages et API publiques, avec validation TLS et certificats système. Les premières erreurs de certificat provenaient de l'environnement d'exécution ; elles ne prouvaient pas une panne du site.
- Sept requêtes de chat : questions de provenance pour un tradipraticien, cas urgent fictif, recherche de mécanisme, présentation de Lafi et exemple proposé par l'interface. Aucun dossier réel de patient utilisé.
- Une demande de synthèse du laboratoire, sans note personnelle. Cette route peut enregistrer une exécution ; sa réponse n'a pas été reçue avant l'expiration du délai client.
- Évaluation visuelle à partir des trois captures fournies, complétée par le code et le HTML public. Aucun navigateur utilisable n'était disponible dans cette session : clics, clavier, rendu mobile et lecteur d'écran n'ont pas été testés en conditions réelles.
- TypeScript : succès. ESLint : zéro erreur, un avertissement de directive inutilisée dans `ChatInput.tsx:87`. Build de production non exécuté.

Les résultats bruts utiles sont dans les fichiers JSON voisins. Les trois premières questions scénarisées ont subi une conversion de certains accents en `?` lors du passage PowerShell → Node. Deux contrôles supplémentaires de personas ont été envoyés en ASCII sans cette ambiguïté et ont également échoué.

| Vérification | Résultat observé | Ce que cela permet de conclure |
|---|---|---|
| `/api/health` | HTTP 200, base connectée, 8 indications | La connexion à la base fonctionne ; la génération n'est pas vérifiée par cet endpoint. |
| Accueil, Découverte, Laboratoire, Synergies, Chat, fiche bissap | HTTP 200 | Les pages sont servies. Le rendu interactif reste à tester. |
| Taille annoncée du corpus | 15 plantes, 24 usages, 15 études référencées | Petit corpus exploitable pour un pilote délimité ; ces nombres ne disent rien de sa validation clinique. |
| Chat : 7 demandes | 5 flux avec événement `error`, 1 expiration à 55 s, 1 réponse complète vers 35 s | Fonctionnement instable dans cet échantillon. Ce n'est pas une mesure de disponibilité à grande échelle. |
| Synthèse bissap du laboratoire | Aucune réponse avant 55 s | Le délai et le repli doivent être vérifiés côté serveur ; cela ne prouve pas qu'aucune exécution n'a été enregistrée. |
| Bissap : attestations | 0 comptée ; 1 source illustrative exclue du score | L'accueil affiche pourtant « Usage local » : incohérence confirmée. |

La cause des erreurs IA n'a pas été établie : logs de déploiement, erreurs fournisseur, limites et configuration du modèle restent à examiner. Un changement de modèle à l'aveugle ne serait pas un diagnostic.

## Regard d'un tradipraticien

**Situation :** « Je connais une préparation, je veux la documenter, comprendre ce que la recherche en dit et conserver la maîtrise de ce que je partage. »

Le formulaire actuel permet de commencer simplement et de signaler un désaccord. C'est une bonne base. En revanche, le choix « Tradipraticien » dans le chat ne change essentiellement que les instructions de langage : il ne crée pas encore un espace de travail adapté.

Améliorations prioritaires :

1. **Un carnet de pratiques modifiable.** Brouillon → envoyé → précision demandée → examiné → publié, avec identifiant, historique et possibilité de compléter la même contribution. Aujourd'hui, le message de succès demande de soumettre un nouveau formulaire pour compléter le précédent.
2. **Une attribution choisie.** Nom, pseudonyme, collectif ou anonymat ; langue et contexte de transmission ; visibilité séparée pour chaque information. Un nom de plante local doit être relié à une langue, une région et, si possible, une identification botanique vérifiée.
3. **Des permissions compréhensibles.** Séparer consultation par l'équipe, publication, utilisation en recherche et éventuelle utilisation commerciale. Prévoir les demandes de retrait et leurs limites. Les conditions de partage et de reconnaissance doivent être coconstruites avec les praticiens et communautés concernés.
4. **Une collecte guidée.** Partie utilisée, état frais/sec, préparation, voie d'utilisation, observations, limites rencontrées, effets indésirables et associations. Ne pas forcer la divulgation d'une préparation complète pour enregistrer une attestation.
5. **Une restitution utile.** Montrer ce que Lafi a compris, ce qui demande confirmation et les articles qui concernent réellement cette préparation. Le praticien doit pouvoir corriger l'interprétation avant publication.

La dictée française existe via les capacités du navigateur. Les langues locales, le fonctionnement hors connexion et la transcription validée par le locuteur restent des évolutions à tester avec les personnes concernées.

**Test à organiser sur le terrain :** un praticien décrit une pratique, relit la fiche structurée, choisit sa visibilité, corrige un détail, puis retrouve son envoi. Observer les incompréhensions et les erreurs d'identification ; ne pas évaluer seulement la rapidité de remplissage.

## Regard d'un particulier

**Situation :** « Je veux comprendre ce qui pourrait m'aider et savoir quoi faire ensuite. »

Le chat offre une entrée simple. Mais les formulations « Se soigner naturellement et efficacement » et « Des soins simples et efficaces » promettent davantage que les données présentées.

Dans l'unique réponse complète du test, Lafi introduit bissap, moringa et kinkeliba comme « plusieurs plantes très efficaces », puis indique des preuves modérées ou faibles. La réponse conseille un suivi, mais n'a pas demandé l'âge, les traitements en cours ou le contexte avant de présenter ces options. C'est une observation de cette réponse, pas la preuve que toutes les réponses suivent le même comportement.

Le parcours souhaitable :

1. Distinguer une question documentaire d'une demande liée à une situation personnelle.
2. Si la demande concerne des symptômes, rechercher d'abord les informations indispensables et les signes nécessitant une orientation. Faire valider ce dispositif avec des professionnels connaissant le contexte local.
3. Présenter ensuite les usages documentés et leur applicabilité : à quelle population et à quelle préparation les données se rapportent-elles ?
4. Rendre immédiatement visibles les limites, précautions connues, informations manquantes et prochaine action utile.

Les cas urgents fictifs ont échoué techniquement pendant les essais : **la qualité du triage n'est donc pas validée**. Une orientation urgente pertinente doit pouvoir s'afficher même lorsque le fournisseur IA est indisponible.

Exemple de texte d'accueil : « Comprendre les usages des plantes, leurs preuves et leurs précautions. » Garder un ton direct et chaleureux, en indiquant honnêtement que Lafi est un service assisté par IA.

Pour les photos, séparer « reconnaître une plante » de « décrire une lésion ». Une identification proposée doit rester à confirmer ; elle ne doit pas conduire automatiquement à une préparation à ingérer. Ne pas afficher de confiance chiffrée sans évaluation permettant de la calibrer.

## Constats à traiter dans le produit actuel

| Priorité | Constat et preuve | Correction attendue |
|---|---|---|
| P0 | Erreurs et lenteur IA observées malgré `/api/health` au vert. | Logs avec identifiant de requête, suivi du premier contenu utile, délais serveur bornés, repli documentaire explicite, reprise contrôlée et suivi séparé de la base, des embeddings et de la génération. |
| P0 | `HeroPreviewCard.tsx` compte toutes les attestations ; l'API bissap en exclut correctement l'illustration. | Réutiliser un calcul commun filtrant `compte_dans_les_scores`. Vérifier la cohérence accueil, découverte, chat, fiche et laboratoire. |
| P0 | Le prompt du chat demande d'incarner un savoir maîtrisé « depuis toujours » et de ne jamais se présenter comme une IA, même si on le demande. | Présentation honnête, assurance proportionnée aux preuves, distinction explicite entre parole d'un praticien cité et reformulation par Lafi. |
| P0 | Les cartes de résultats sont placées avant le texte de réponse ; tous les résultats de recherche sont affichés. Sur la demande hypertension, deux résultats concernaient maux de tête et toux. | Filtrer et sélectionner les résultats pertinents avant affichage ; faire passer une orientation ou un avertissement prioritaire avant les fiches de préparation. Une similarité vectorielle n'est pas une validation de pertinence médicale. |
| P0 | La synthèse du laboratoire reçoit le nombre d'études, mais pas leur contenu, leurs résultats ni leur contexte. Son validateur vérifie surtout longueur, `%` et « sur 10 ». | Sortie structurée avec affirmations reliées aux sources ; contrôler présence des précautions et portée des affirmations. Le contrôle actuel ne peut garantir « aucune dose à l'impératif » ni l'absence d'invention. |
| P1 | `qualiteLabelGrandPublic` transforme faible/très faible en « Peu d'études », et `null` en « Pas encore étudié ». | Séparer quantité, type d'étude, direction du résultat et certitude. Écrire « Aucune étude recensée dans Lafi » quand seul le contenu de la base est connu. |
| P1 | « Très utilisé » est déduit du nombre de lignées ; « plusieurs régions » du nombre de lignées, sans exiger plusieurs régions. | Afficher des faits mesurés : nombre d'attestations vérifiées et de traditions distinctes. Ne pas en déduire une fréquence d'utilisation dans la population. |
| P1 | `divergenceNote` est forcé à `null` dans plusieurs cartes ; la synthèse IA n'en reçoit pas le contenu. Les précautions spécifiques à la préparation ne sont pas transmises à cette synthèse. | Propager contradictions et précautions jusqu'aux cartes, au texte et aux exports. Une alerte ne doit pas disparaître selon le point d'entrée. |
| P1 | `initialQuery` est chargé après montage du parent, mais l'effet d'envoi de `ChatSession` ne s'exécute qu'au montage. | Risque identifié par lecture : tester puis corriger le passage accueil/laboratoire → chat pour conserver la question et ne l'envoyer qu'une fois. |
| P1 | Les erreurs HTTP ne sont pas vérifiées avec `res.ok` lors du lancement du canvas. Le résultat peut être marqué terminé après une réponse JSON d'erreur. | Validation du statut et du contrat de réponse ; états distincts erreur, données absentes, repli documentaire et succès IA. |
| P1 | Le cache compare `note_libre` à `""` mais insère `null` en l'absence de note. L'empreinte omet des informations qui influencent la synthèse. | Normaliser les notes absentes ; tester la réutilisation. Versionner données, modèle, prompt et règles de validation. Une contrainte UNIQUE standard ne déduplique pas des valeurs NULL comme une chaîne vide. |
| P1 | Un ancien résultat peut être affiché avec les études actuelles de la page. | Afficher l'instantané ayant produit le résultat et proposer séparément une actualisation. Conserver identifiants des sources, date, versions et paramètres. |
| P1 | La migration de l'historique local efface le local après des écritures dont l'erreur n'est pas remontée par `saveRemote`. | N'effacer qu'après confirmation de toutes les écritures ; rendre les échecs récupérables. Expliquer le transfert au compte et proposer une conversation sans historique. |
| P1 | Aucun contrôle d'accès applicatif, quota ou limitation de taille globale n'est visible dans la route de chat. | Vérifier aussi les protections de l'hébergement ; borner messages/images, temps et dépenses. L'absence de protection dans ce fichier ne prouve pas l'absence de protection à l'infrastructure. |

Les notes libres du laboratoire sont persistées et peuvent influencer une synthèse accessible par lien permanent. Décider explicitement de la confidentialité des exécutions ; un UUID difficile à deviner n'est pas une autorisation d'accès. Ne pas inviter à écrire un dossier personnel dans un champ destiné à une recherche partageable.

## Recherche assistée : rendre le « comment » et le « pourquoi » vérifiables

Le laboratoire actuel rassemble les informations d'un usage déjà enregistré. Les étapes visuelles sont animées avec des délais fixes avant l'appel de synthèse ; elles ne correspondent pas à des recherches bibliographiques indépendantes en cours. L'espace Synergies calcule l'intersection de noms de cibles puis génère un commentaire court. Aucun calcul de structure ou recherche documentaire externe n'est appelé par ces routes.

### Une chaîne de preuves consultable

**Observation traditionnelle → taxon confirmé → partie et préparation → composé observé dans ce contexte → activité biologique mesurée ou prédite → mécanisme proposé → résultat pertinent → hypothèse à tester.**

Chaque lien doit préciser sa source, son contexte, sa date, ses limites et son statut. « Inconnu » doit rester un résultat possible.

Exemples concrets tirés de Lafi :

- **Bissap :** la base associe à la même indication un essai sur le bissap et un essai sur un extrait associant *Hibiscus sabdariffa* et *Lippia citriodora*. Leur présence dans la même liste ne suffit pas à valider l'infusion locale seule. Afficher « préparation étudiée différente » et faire examiner la transférabilité. [Essai sur le bissap](https://pubmed.ncbi.nlm.nih.gov/31334091/), [essai sur l'extrait combiné](https://pubmed.ncbi.nlm.nih.gov/33810049/).
- **Goyavier et caïlcédrat :** les trois cibles communes renvoyées par l'API sont CYP1B1, KDR et IGF1R. Elles proviennent des mêmes données sur la quercétine répliquées dans les deux profils. Le recoupement décrit une information partagée ; il n'établit ni complémentarité ni effet combiné.
- **Ontologie :** le champ `proteine` contient aussi « Plasmodium falciparum (souche ... PfDd2) », qui désigne un organisme et une souche plutôt qu'une protéine. L'API du caïlcédrat renvoie deux fois la même activité. Distinguer cible moléculaire, organisme, modèle expérimental et résultat d'essai ; dédupliquer les observations.
- **Contexte perdu :** `niveau_preuve`, `voie_kegg`, provenance et localisation existent dans le modèle local, mais la requête Synergies ne les sélectionne pas. Le générateur d'hypothèse reçoit surtout les noms des composés et les cibles communes, sans les références et conditions d'essai. Ces informations doivent voyager jusqu'à l'explication.

Une fiche de recherche devrait contenir : question précise ; faits et sources ; hypothèse ; explications concurrentes ; contradictions ; données manquantes ; observation qui pourrait réfuter l'hypothèse ; prochaine vérification proposée ; revue humaine. Éviter de produire automatiquement un mélange à consommer.

Exemple de question adaptée aux données actuelles : « Les préparations documentées de ces deux plantes contiennent-elles effectivement le composé commun dans des conditions compatibles avec les activités recensées ? » C'est une étape à vérifier avant d'interpréter un mécanisme ou de rechercher un effet combiné. Une éventuelle étude de combinaison demandera ensuite une définition explicite de l'additivité, des mesures et des contrôles appropriés, sous responsabilité scientifique.

### Ce qui est utile chez DeepMind et Claude

| Référence | Apport pour Lafi | Limite à conserver |
|---|---|---|
| [AI co-scientist, Google Research](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) | Partir d'un objectif scientifique, proposer plusieurs hypothèses, les critiquer, les comparer et les réviser avec le chercheur. | Une hypothèse intéressante reste à vérifier. Le nombre d'agents ne remplace pas une preuve. |
| [AlphaFold 3, Google DeepMind et Isomorphic Labs](https://blog.google/innovation-and-ai/products/google-deepmind-isomorphic-alphafold-3-ai-model/) | Utiliser plus tard des outils spécialisés pour étudier une interaction moléculaire définie. | Une structure prédite ne démontre pas qu'une préparation contient la molécule pertinente, atteint la cible dans l'organisme ou soigne une maladie. |
| [Claude Science, Anthropic](https://www.anthropic.com/news/claude-science-ai-workbench) | Relier littérature, bases, outils et artefacts dont on peut examiner l'historique et reproduire la production. | Une interface conversationnelle ne dispense pas de vérifier sources, calculs et hypothèses. |

La première version de recherche devrait donc connecter et tracer un petit nombre de sources fiables, conserver les identifiants normalisés et produire des dossiers citables. Évaluer ensuite l'intérêt de calculs spécialisés pour une question précise. Les connecteurs, licences et coûts sont à vérifier avant intégration.

Pour la preuve clinique, le classement actuel est assigné par couple dans les seeds. Je n'ai pas trouvé de profil complet GRADE avec justification par résultat et évaluateur dans le modèle examiné. Conserver les évaluations existantes comme évaluations éditoriales à réexaminer, puis documenter la méthode. GRADE demande une appréciation explicite de domaines comme biais, imprécision et indirectness, ainsi que des tableaux de synthèse : un nombre ou un type d'études ne suffit pas. [Critères du GRADE Working Group](https://www.gradeworkinggroup.org/).

## Interface et navigation

L'identité sable/vert, la simplicité générale et les noms botaniques constituent une base cohérente. Les améliorations les plus utiles portent sur l'ordre des informations et les actions.

| Écran | Friction visible ou déduite du code | Proposition |
|---|---|---|
| Chat | Même accueil et mêmes exemples pour tous les profils ; profil placé sous la saisie. | Choisir une intention visible : « Comprendre un usage », « Documenter ma pratique », « Explorer une question de recherche ». Adapter ensuite exemples et espace de travail. Le profil professionnel ne doit pas retirer les précautions. |
| Laboratoire | Sélecteurs tronqués dans le graphe ; bouton sous un grand canvas et absent de la portion visible de la capture ; résultat initial vide. | Plante, indication et bouton au-dessus ; résumé de la préparation visible ; détails des preuves accessibles avant génération. Garder un graphe consultable pour l'exploration. |
| Laboratoire simple | SVG d'au moins 640 px, donc défilement horizontal probable sur téléphone. | Parcours vertical dans ce mode ; graphe dans le mode recherche. Vérifier sur un vrai écran de 360–390 px. |
| Graphe | Les liens sont entièrement masqués au repos par `strokeDashoffset`, d'où des nœuds isolés. | Connecteurs discrets visibles dès le départ ; animation réservée aux opérations réellement exécutées. |
| Accessibilité | Nœuds SVG avec `onClick`, sans contrôle clavier visible dans `CanvasNode`. | Contrôles HTML ou interaction clavier complète, noms accessibles, focus et alternative textuelle au graphe. |
| Découverte | Pas de recherche libre par nom local/scientifique ; cartes dominées par la photo et une attribution longue en pied. | Recherche tolérant variantes et accents ; résumé « usage / type de preuve / précaution » ; source intégrale consultable sans couper la mention illustrative. |
| Carte de plante | « Pour : hypertension » peut être compris comme une recommandation. | « Usage documenté : ... » et accès clair aux conditions et limites de la preuve. |
| Navigation | Le chat possède sa propre coque ; Synergies se trouve surtout via un lien secondaire du laboratoire. | Navigation cohérente : « Discuter », « Plantes et usages », « Recherche », « Mes contributions ». Conserver question, sélection et retour au point de départ. |
| Résultat | Promesse de « raisonnement complet », alors que la sortie est une synthèse ; options PDF/Word inactives. | « Examiner les preuves » et « Voir comment la synthèse est établie » ; actions utiles comme copier avec références, enregistrer et signaler une erreur. |

Sur mobile et réseau limité, mesurer le poids des photos, le temps avant action et la consommation des échanges. Les images actuelles utilisent souvent des balises `img` sans chargement différé explicite. Le mode documentaire doit rester utile quand la génération échoue.

## Ordre de travail proposé

| Lot | Résultat attendu | Critère de sortie |
|---|---|---|
| 1 — Réponse fiable et portée honnête | Diagnostic des erreurs IA, délais bornés, repli, cohérence des attestations, retrait des promesses d'efficacité non étayées. | Le scénario hypertension fonctionne de bout en bout ; la panne fournisseur donne une réponse utile et correctement étiquetée ; les chiffres et badges concordent partout. |
| 2 — Parcours particulier utilisable | Questions de contexte, orientation prioritaire, cartes pertinentes, transfert fiable entre écrans, contrôles mobile et clavier. | Une série définie de cas ordinaires, urgents et hors périmètre est examinée avec un professionnel ; aucun cas critique ne dépend uniquement de la génération pour afficher l'orientation. |
| 3 — Pilote avec praticiens | Petit corpus relu, carnet de contributions, identité et permissions choisies, traitement des corrections et désaccords. | Chaque fiche retenue possède provenance, statut réel/illustratif, préparation, limites, date et responsable de revue ; un contributeur peut compléter son propre envoi. |
| 4 — Dossier de recherche explicable | Liens normalisés et contextualisés, sources par affirmation, hypothèses comparables et export d'un instantané. | Un chercheur peut retracer chaque lien, identifier les données absentes et proposer une vérification sans devoir croire un texte généré sur parole. |

Pour le premier pilote, mieux vaut quelques dossiers entièrement examinés qu'une extension rapide à davantage de plantes. Faire tester séparément le parcours par des praticiens, des particuliers et des chercheurs ; mesurer compréhension des limites, réussite des tâches, erreurs, abandons et délais. Aucun taux de guérison ne peut être déduit de ces tests produit.

Le nom Lafi est déjà utilisé dans le frontend. Les mentions Sankofa restantes dans le backend et sa documentation pourront être harmonisées une fois le périmètre actif clarifié ; le frontend examiné utilise directement ses propres routes et Supabase. Le chantier prioritaire est la fiabilité de cette chaîne réellement utilisée.

Cet audit ajoute uniquement la documentation et les traces de vérification au dépôt. Il ne modifie pas le code produit ni le schéma de la base.
