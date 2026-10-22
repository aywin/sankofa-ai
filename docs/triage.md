# Triage déterministe du chat

**Statut : à valider par un professionnel de santé connaissant le contexte burkinabè** (médecin, infirmier de CSPS ou sage-femme). Tant que cette relecture n'a pas eu lieu, la liste ci-dessous est une base de travail, pas un protocole validé.

Code : [web/lib/triage.ts](../web/lib/triage.ts). Vérification hors ligne : `npx tsx scripts/check-triage.ts`, depuis `web/`.

## Principe

Avant toute génération, le serveur lit les 3 derniers messages de l'utilisateur et cherche des signes d'alerte, **sans IA**. S'il en trouve, un bloc d'orientation fixe s'affiche **au-dessus** de la réponse :
- un bloc rouge pour une urgence ;
- un bloc ambre pour une consultation conseillée.

Le bloc s'affiche même si le fournisseur IA est en panne ou si le modèle se trompe. Le modèle reçoit le résultat du triage, pour que son texte ne le contredise pas.

La liste est volontairement large. Un faux positif coûte une phrase de prudence ; un faux négatif peut coûter beaucoup plus. Les mots sont comparés en minuscules et sans accents.

## Niveau « urgence » — aller au centre de santé maintenant

| Signe | Exemples de formulations repérées |
|---|---|
| Convulsions | convulse, convulsions, crise d'épilepsie |
| Trouble de la conscience | perte de connaissance, évanoui, inconscient, ne se réveille pas, très somnolent, est confus, confusion, délire, ne reconnaît plus |
| Difficulté respiratoire | du mal à respirer, respire mal, essoufflé, étouffe |
| Douleur thoracique | douleur dans la poitrine, douleur thoracique, serrement dans la poitrine |
| Saignement important | vomit du sang, crache du sang, sang dans les selles, les urines ou les vomissements, selles noires, hémorragie |
| Signes de méningite | nuque raide, raideur de la nuque |
| Signes d'AVC | paralysie, bouche de travers, visage qui tombe, ne peut plus parler |
| Envenimation | morsure de serpent, piqûre de scorpion |
| Intoxication | empoisonné, intoxiqué, a avalé du pétrole, de la javel, un insecticide… |
| Déshydratation grave | ne boit plus, ne tète plus, vomit tout, n'urine plus, yeux creux |
| Grossesse avec signe d'alerte | enceinte **et** saignement, douleur, fièvre, maux de tête forts, gonflement, ne sent plus bouger le bébé |

## Niveau « consulter » — à faire vérifier

| Signe | Conseil affiché |
|---|---|
| Fièvre, frissons, « corps chaud », palu | Faire un test de dépistage rapide du paludisme (TDR) au CSPS |
| Fièvre chez un enfant de 5 ans ou moins | Consulter le jour même (PCIME/OMS : en zone d'endémie palustre, toute fièvre de l'enfant se teste vite) |
| Durée : plusieurs jours, une semaine, « ça ne passe pas » | Faire vérifier |
| Plaie avec pus, gonflement, chaleur, traînée rouge | Plaie infectée, à faire voir |
| Douleur très forte | Avis avant tout essai |
| Jaunisse, yeux jaunes | Examen, pas de préparation sans avis |
| Diarrhée avec du sang | Consultation et solution de réhydratation (SRO) |
| Grossesse, sans signe d'alerte | Beaucoup de plantes déconseillées : avis de la sage-femme |
| Traitement en cours (tension, diabète, anticoagulant, ARV…) | Risque d'interaction : avis avant d'associer |

**Groupes à risque repérés** et transmis au modèle : enfant de 5 ans ou moins, grossesse, allaitement, personne de 65 ans ou plus, traitement en cours.

## Questions à trancher lors de la relecture

1. Le seuil d'âge « enfant » est fixé à 5 ans. Faut-il un bloc distinct pour le nourrisson (moins de 2 mois) ?
2. Faut-il ajouter les termes locaux courants (mooré, dioula) pour la fièvre, le paludisme et les convulsions ? Lesquels ?
3. La fièvre seule déclenche « consulter » (TDR). Est-ce le bon niveau pour un adulte en saison sèche ?
4. Une personne âgée qui tousse ne déclenche rien. Faut-il un seuil pour les personnes âgées ?

## Bornes de la route `/api/chat`

Ce que la route vérifie elle-même :
- corps de requête de 12 Mo maximum ;
- 60 messages maximum, dont les 20 derniers seulement sont envoyés au modèle ;
- 4 images maximum, d'environ 4,5 Mo chacune ;
- génération limitée à 40 s, et 20 s sans nouveau fragment ;
- 1 nouvelle tentative seulement ;
- au-delà : repli documentaire, sans IA.

Ce qui n'est **pas** encore couvert :
- **la limitation de débit par visiteur.** Une base partagée est nécessaire (Upstash ou une table Supabase), car la mémoire d'une fonction serverless n'est pas partagée entre les instances. À défaut, il faut configurer le pare-feu Vercel (règles de limitation de débit) ;
- **le quota du fournisseur.** Diagnostic du 22/10/2026 : la clé Gemini utilisée est sur l'offre gratuite, plafonnée à **5 requêtes par minute** pour `gemini-3.6-flash`. C'est la cause des échecs de l'audit du 21/10. Au-delà, Lafi répond par le repli documentaire. Pour un usage réel, il faut passer la clé sur une offre payante.
